import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required payment verification parameters",
          code: "MISSING_PARAMETERS",
        },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic signature using HMAC-SHA256
    const isSignatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      console.error(`[SECURITY ALERT] Signature verification failed for order ${razorpay_order_id} by user ${user.id}`);
      
      // Update order status to FAILED in DB if present
      await prisma.order.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed. Invalid cryptographic signature.",
          code: "INVALID_SIGNATURE",
        },
        { status: 400 }
      );
    }

    // 2. Fetch matching Order from DB
    const existingOrder = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { plan: true, payment: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order record not found in system database", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 3. Check IDEMPOTENCY: If order is already marked PAID, return existing details without duplicating
    if (existingOrder.status === "PAID" && existingOrder.payment) {
      const existingInvoice = await prisma.invoice.findFirst({
        where: { paymentId: existingOrder.payment.id },
      });

      return NextResponse.json({
        success: true,
        message: "Payment already verified and recorded",
        orderId: existingOrder.razorpayOrderId,
        paymentId: existingOrder.payment.razorpayPaymentId,
        invoiceNumber: existingInvoice?.invoiceNumber || undefined,
        alreadyProcessed: true,
      });
    }

    // 4. Perform atomic database transaction to update Order, create Payment, activate Membership, & generate Invoice
    const result = await prisma.$transaction(async (tx) => {
      // a. Mark Order as PAID
      const updatedOrder = await tx.order.update({
        where: { id: existingOrder.id },
        data: { status: "PAID" },
      });

      // b. Record Payment entry in DB
      const newPayment = await tx.payment.create({
        data: {
          orderId: existingOrder.id,
          userId: user.id,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amount: existingOrder.amount,
          currency: existingOrder.currency,
          status: "CAPTURED",
          paymentMethod: "RAZORPAY",
          email: user.email,
          contact: user.phone || null,
          captured: true,
        },
      });

      // c. Grant purchased product/service (Membership)
      let memberProfile = await tx.memberProfile.findUnique({
        where: { userId: user.id },
      });

      if (!memberProfile) {
        memberProfile = await tx.memberProfile.create({
          data: {
            userId: user.id,
            membershipStatus: "ACTIVE",
            currentPlanId: existingOrder.planId,
          },
        });
      } else {
        await tx.memberProfile.update({
          where: { id: memberProfile.id },
          data: {
            membershipStatus: "ACTIVE",
            currentPlanId: existingOrder.planId || memberProfile.currentPlanId,
          },
        });
      }

      // Calculate membership end date based on billing cycle
      const cycle = existingOrder.billingCycle || "MONTHLY";
      const durationMonths = cycle === "MONTHLY" ? 1 : cycle === "SIX_MONTHS" ? 6 : 12;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      let createdMembership = null;
      if (existingOrder.planId) {
        createdMembership = await tx.membership.create({
          data: {
            memberId: memberProfile.id,
            planId: existingOrder.planId,
            startDate: startDate,
            endDate: endDate,
            amountPaid: existingOrder.amount,
            status: "ACTIVE",
            billingCycle: cycle,
          },
        });

        // Link payment to membership
        await tx.payment.update({
          where: { id: newPayment.id },
          data: { membershipId: createdMembership.id },
        });
      }

      // d. Create Invoice record
      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const basePrice = Math.round(existingOrder.amount / 1.18);
      const taxAmount = existingOrder.amount - basePrice;

      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: invNumber,
          userId: user.id,
          paymentId: newPayment.id,
          amount: basePrice,
          taxAmount: taxAmount,
          totalAmount: existingOrder.amount,
          status: "PAID",
          issuedDate: new Date(),
          dueDate: new Date(),
        },
      });

      return {
        order: updatedOrder,
        payment: newPayment,
        invoice: createdInvoice,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and membership activated successfully",
      orderId: result.order.razorpayOrderId,
      paymentId: result.payment.razorpayPaymentId,
      invoiceNumber: result.invoice.invoiceNumber,
    });
  } catch (error: any) {
    console.error("Error during payment verification:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during payment verification",
        code: "VERIFICATION_FAILED",
      },
      { status: 500 }
    );
  }
}

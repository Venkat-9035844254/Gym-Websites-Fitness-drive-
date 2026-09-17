import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const razorpayOrderId = searchParams.get("orderId");

    if (!razorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "Order ID parameter is required", code: "MISSING_ORDER_ID" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { razorpayOrderId: razorpayOrderId },
          { id: razorpayOrderId },
        ],
      },
      include: {
        plan: true,
        payment: {
          include: { invoice: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order record not found", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verify ownership (unless admin)
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Cannot access order history of another user", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // If order is still PENDING in local DB, attempt live reconciliation with Razorpay API
    if (order.status === "PENDING") {
      try {
        const razorpay = getRazorpayClient();
        const paymentsList: any = await razorpay.orders.fetchPayments(order.razorpayOrderId);
        
        if (paymentsList && paymentsList.items && paymentsList.items.length > 0) {
          const capturedPayment = paymentsList.items.find((p: any) => p.status === "captured");
          
          if (capturedPayment) {
            // Payment captured on Razorpay! Reconcile local database atomically
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: { status: "PAID" },
              });

              let paymentRecord = await tx.payment.findUnique({
                where: { razorpayPaymentId: capturedPayment.id },
              });

              if (!paymentRecord) {
                paymentRecord = await tx.payment.create({
                  data: {
                    orderId: order.id,
                    userId: order.userId,
                    razorpayPaymentId: capturedPayment.id,
                    razorpayOrderId: order.razorpayOrderId,
                    amount: order.amount,
                    currency: order.currency,
                    status: "CAPTURED",
                    paymentMethod: capturedPayment.method || "RAZORPAY",
                    email: capturedPayment.email,
                    contact: capturedPayment.contact,
                    captured: true,
                  },
                });
              }

              // Activate membership
              let memberProfile = await tx.memberProfile.findUnique({
                where: { userId: order.userId },
              });

              if (!memberProfile) {
                memberProfile = await tx.memberProfile.create({
                  data: {
                    userId: order.userId,
                    membershipStatus: "ACTIVE",
                    currentPlanId: order.planId,
                  },
                });
              } else {
                await tx.memberProfile.update({
                  where: { id: memberProfile.id },
                  data: {
                    membershipStatus: "ACTIVE",
                    currentPlanId: order.planId || memberProfile.currentPlanId,
                  },
                });
              }

              const cycle = order.billingCycle || "MONTHLY";
              const durationMonths = cycle === "MONTHLY" ? 1 : cycle === "SIX_MONTHS" ? 6 : 12;
              const startDate = new Date();
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + durationMonths);

              if (order.planId) {
                const membership = await tx.membership.create({
                  data: {
                    memberId: memberProfile.id,
                    planId: order.planId,
                    startDate,
                    endDate,
                    amountPaid: order.amount,
                    status: "ACTIVE",
                    billingCycle: cycle,
                  },
                });

                await tx.payment.update({
                  where: { id: paymentRecord.id },
                  data: { membershipId: membership.id },
                });
              }

              const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
              const basePrice = Math.round(order.amount / 1.18);
              const taxAmount = order.amount - basePrice;

              await tx.invoice.create({
                data: {
                  invoiceNumber: invNumber,
                  userId: order.userId,
                  paymentId: paymentRecord.id,
                  amount: basePrice,
                  taxAmount: taxAmount,
                  totalAmount: order.amount,
                  status: "PAID",
                  issuedDate: new Date(),
                  dueDate: new Date(),
                },
              });
            });

            // Refetch updated order
            const updatedOrder = await prisma.order.findUnique({
              where: { id: order.id },
              include: {
                plan: true,
                payment: { include: { invoice: true } },
              },
            });

            return NextResponse.json({
              success: true,
              reconciled: true,
              order: updatedOrder,
            });
          }
        }
      } catch (reconcileErr) {
        console.warn("Reconciliation query to Razorpay failed or credentials not present:", reconcileErr);
      }
    }

    return NextResponse.json({
      success: true,
      reconciled: false,
      order: order,
    });
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

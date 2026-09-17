import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required to initiate refunds", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paymentId, amount, reason = "Admin initiated refund" } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required", code: "MISSING_PAYMENT_ID" },
        { status: 400 }
      );
    }

    // Find Payment by local DB ID or razorpayPaymentId
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: paymentId }, { razorpayPaymentId: paymentId }],
      },
      include: { order: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found", code: "PAYMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (existingPayment.status === "REFUNDED") {
      return NextResponse.json(
        { success: false, message: "Payment has already been refunded", code: "ALREADY_REFUNDED" },
        { status: 400 }
      );
    }

    const refundAmountINR = amount && amount > 0 ? amount : existingPayment.amount;
    const refundAmountPaise = Math.round(refundAmountINR * 100);

    // Call Razorpay API to process refund
    const razorpay = getRazorpayClient();
    let razorpayRefund: any;
    
    try {
      razorpayRefund = await razorpay.payments.refund(existingPayment.razorpayPaymentId, {
        amount: refundAmountPaise,
        notes: {
          reason: reason,
          adminUserId: user.id,
        },
      });
    } catch (rzpErr: any) {
      console.error("Razorpay refund API call failed:", rzpErr);
      return NextResponse.json(
        {
          success: false,
          message: rzpErr?.description || rzpErr?.message || "Razorpay API refund failure",
          code: "RAZORPAY_REFUND_ERROR",
        },
        { status: 500 }
      );
    }

    // Update local database in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "REFUNDED",
          refundId: razorpayRefund.id,
          refundStatus: razorpayRefund.status || "PROCESSED",
          refundAmount: refundAmountINR,
        },
      });

      if (existingPayment.orderId) {
        await tx.order.update({
          where: { id: existingPayment.orderId },
          data: { status: "REFUNDED" },
        });
      }

      const createdRefund = await tx.refund.create({
        data: {
          refundId: razorpayRefund.id,
          paymentId: existingPayment.id,
          orderId: existingPayment.orderId || null,
          userId: existingPayment.userId,
          amount: refundAmountINR,
          currency: "INR",
          status: razorpayRefund.status === "processed" ? "PROCESSED" : "PENDING",
          reason: reason,
        },
      });

      return { payment: updatedPayment, refund: createdRefund };
    });

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      refundId: result.refund.refundId,
      amount: refundAmountINR,
      status: result.refund.status,
    });
  } catch (error: any) {
    console.error("Error initiating refund:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during refund processing" },
      { status: 500 }
    );
  }
}

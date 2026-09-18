import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured on server
    if (webhookSecret) {
      const isValid = verifyWebhookSignature({ rawBody, signature });
      if (!isValid) {
        console.error("[SECURITY ALERT] Invalid Razorpay webhook signature header.");
        return NextResponse.json(
          { success: false, message: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    } else {
      console.warn("[WARNING] RAZORPAY_WEBHOOK_SECRET is not configured on server. Webhook signature check skipped.");
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const payload = body.payload;

    console.log(`[RAZORPAY WEBHOOK RECEIVED] Event: ${event}`);

    switch (event) {
      case "payment.captured":
      case "order.paid": {
        const paymentEntity = payload.payment?.entity || payload.order?.entity;
        const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId) {
          const existingOrder = await prisma.order.findUnique({
            where: { razorpayOrderId },
            include: { payment: true },
          });

          if (existingOrder) {
            // Check IDEMPOTENCY: If order is already PAID, do not process twice
            if (existingOrder.status === "PAID") {
              console.log(`[WEBHOOK IDEMPOTENCY] Order ${razorpayOrderId} is already marked as PAID. Skipping redundant execution.`);
              break;
            }

            // Perform DB update to fulfill order
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: existingOrder.id },
                data: { status: "PAID" },
              });

              let paymentRecord = existingOrder.payment;
              if (!paymentRecord && razorpayPaymentId) {
                paymentRecord = await tx.payment.create({
                  data: {
                    orderId: existingOrder.id,
                    userId: existingOrder.userId,
                    razorpayPaymentId: razorpayPaymentId,
                    razorpayOrderId: razorpayOrderId,
                    amount: existingOrder.amount,
                    currency: existingOrder.currency,
                    status: "CAPTURED",
                    paymentMethod: paymentEntity?.method || "RAZORPAY",
                    email: paymentEntity?.email,
                    contact: paymentEntity?.contact,
                    captured: true,
                  },
                });
              }

              // Activate Membership
              let memberProfile = await tx.memberProfile.findUnique({
                where: { userId: existingOrder.userId },
              });

              if (!memberProfile) {
                memberProfile = await tx.memberProfile.create({
                  data: {
                    userId: existingOrder.userId,
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

              const cycle = existingOrder.billingCycle || "MONTHLY";
              const durationMonths = cycle === "MONTHLY" ? 1 : cycle === "SIX_MONTHS" ? 6 : 12;
              const startDate = new Date();
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + durationMonths);

              if (existingOrder.planId) {
                const membership = await tx.membership.create({
                  data: {
                    memberId: memberProfile.id,
                    planId: existingOrder.planId,
                    startDate,
                    endDate,
                    amountPaid: existingOrder.amount,
                    status: "ACTIVE",
                    billingCycle: cycle,
                  },
                });

                if (paymentRecord) {
                  await tx.payment.update({
                    where: { id: paymentRecord.id },
                    data: { membershipId: membership.id },
                  });
                }
              }

              // Create Invoice if not existing
              if (paymentRecord) {
                const existingInvoice = await tx.invoice.findFirst({
                  where: { paymentId: paymentRecord.id },
                });

                if (!existingInvoice) {
                  const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
                  const basePrice = Math.round(existingOrder.amount / 1.18);
                  const taxAmount = existingOrder.amount - basePrice;

                  await tx.invoice.create({
                    data: {
                      invoiceNumber: invNumber,
                      userId: existingOrder.userId,
                      paymentId: paymentRecord.id,
                      amount: basePrice,
                      taxAmount: taxAmount,
                      totalAmount: existingOrder.amount,
                      status: "PAID",
                      issuedDate: new Date(),
                      dueDate: new Date(),
                    },
                  });
                }
              }
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;

        if (razorpayOrderId) {
          await prisma.order.updateMany({
            where: { razorpayOrderId },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refundEntity = payload.refund?.entity;
        const razorpayPaymentId = refundEntity?.payment_id;
        const razorpayRefundId = refundEntity?.id;
        const refundAmountINR = (refundEntity?.amount || 0) / 100;

        if (razorpayPaymentId) {
          const existingPayment = await prisma.payment.findUnique({
            where: { razorpayPaymentId },
            include: { order: true },
          });

          if (existingPayment) {
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: existingPayment.id },
                data: {
                  status: "REFUNDED",
                  refundId: razorpayRefundId,
                  refundStatus: "PROCESSED",
                  refundAmount: refundAmountINR,
                },
              });

              if (existingPayment.orderId) {
                await tx.order.update({
                  where: { id: existingPayment.orderId },
                  data: { status: "REFUNDED" },
                });
              }

              if (razorpayRefundId) {
                await tx.refund.upsert({
                  where: { refundId: razorpayRefundId },
                  create: {
                    refundId: razorpayRefundId,
                    paymentId: existingPayment.id,
                    orderId: existingPayment.orderId || null,
                    userId: existingPayment.userId,
                    amount: refundAmountINR,
                    currency: "INR",
                    status: "PROCESSED",
                    reason: refundEntity?.notes?.reason || "Webhook Refund Event",
                  },
                  update: {
                    status: "PROCESSED",
                  },
                });
              }
            });
          }
        }
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event}`);
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}

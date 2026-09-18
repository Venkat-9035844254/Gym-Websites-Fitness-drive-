import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        plan: true,
        payment: {
          include: {
            invoice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      let notesObj: any = {};
      try {
        if (order.notes) notesObj = JSON.parse(order.notes);
      } catch (e) {}

      return {
        id: order.id,
        orderId: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        planName: order.plan?.name || notesObj.planName || "Gym Membership",
        billingCycle: order.billingCycle || "MONTHLY",
        receipt: order.receipt,
        createdAt: order.createdAt.toISOString(),
        payment: order.payment
          ? {
              paymentId: order.payment.razorpayPaymentId,
              method: order.payment.paymentMethod,
              status: order.payment.status,
              createdAt: order.payment.createdAt.toISOString(),
              invoice: order.payment.invoice
                ? {
                    id: order.payment.invoice.id,
                    invoiceNumber: order.payment.invoice.invoiceNumber,
                    totalAmount: order.payment.invoice.totalAmount,
                    issuedDate: order.payment.invoice.issuedDate.toISOString(),
                  }
                : null,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

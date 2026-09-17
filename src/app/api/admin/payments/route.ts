import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
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
        { success: false, message: "Forbidden: Admin access required", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Build Prisma query condition
    const whereCondition: any = {};

    if (statusFilter !== "ALL") {
      whereCondition.status = statusFilter;
    }

    if (search) {
      whereCondition.OR = [
        { razorpayOrderId: { contains: search } },
        { receipt: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
        { payment: { razorpayPaymentId: { contains: search } } },
      ];
    }

    if (startDateParam || endDateParam) {
      whereCondition.createdAt = {};
      if (startDateParam) whereCondition.createdAt.gte = new Date(startDateParam);
      if (endDateParam) whereCondition.createdAt.lte = new Date(endDateParam);
    }

    // Fetch orders with relations
    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        plan: true,
        payment: {
          include: {
            invoice: true,
            refunds: true,
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute Overall System Revenue Metrics (unfiltered baseline)
    const allOrders = await prisma.order.findMany({
      select: { amount: true, status: true },
    });

    const allRefunds = await prisma.refund.findMany({
      select: { amount: true },
    });

    let totalRevenue = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    allOrders.forEach((o) => {
      if (o.status === "PAID") {
        totalRevenue += o.amount;
        successfulCount++;
      } else if (o.status === "PENDING") {
        pendingCount++;
      } else if (o.status === "FAILED") {
        failedCount++;
      } else if (o.status === "REFUNDED") {
        refundedCount++;
      }
    });

    const totalRefundsAmount = allRefunds.reduce((acc, r) => acc + r.amount, 0);

    const formattedTransactions = orders.map((o) => {
      let notesObj: any = {};
      try {
        if (o.notes) notesObj = JSON.parse(o.notes);
      } catch (e) {}

      return {
        id: o.id,
        orderId: o.razorpayOrderId,
        receipt: o.receipt,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        planName: o.plan?.name || notesObj.planName || "Gym Membership",
        billingCycle: o.billingCycle || "MONTHLY",
        createdAt: o.createdAt.toISOString(),
        user: {
          id: o.user.id,
          name: o.user.name,
          email: o.user.email,
          phone: o.user.phone || undefined,
        },
        payment: o.payment
          ? {
              id: o.payment.id,
              paymentId: o.payment.razorpayPaymentId,
              method: o.payment.paymentMethod,
              status: o.payment.status,
              email: o.payment.email,
              contact: o.payment.contact,
              refundId: o.payment.refundId,
              refundAmount: o.payment.refundAmount,
              createdAt: o.payment.createdAt.toISOString(),
              invoiceNumber: o.payment.invoice?.invoiceNumber,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: Math.max(0, totalRevenue - totalRefundsAmount),
        grossRevenue: totalRevenue,
        totalTransactions: allOrders.length,
        successfulPayments: successfulCount,
        pendingPayments: pendingCount,
        failedPayments: failedCount,
        refundedPayments: refundedCount,
        totalRefundsAmount: totalRefundsAmount,
      },
      transactions: formattedTransactions,
    });
  } catch (error: any) {
    console.error("Error fetching admin payments dashboard:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin authorization required", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 1. Members count & breakdown from Prisma Database
    const totalMembers = await prisma.memberProfile.count();
    const activeMembers = await prisma.memberProfile.count({
      where: { membershipStatus: "ACTIVE" },
    });
    const expiredMembers = await prisma.memberProfile.count({
      where: { membershipStatus: "EXPIRED" },
    });

    // 2. Verification requests breakdown
    const pendingVerifications = await prisma.verificationRequest.count({
      where: { status: "PENDING_VERIFICATION" },
    });
    const approvedVerifications = await prisma.verificationRequest.count({
      where: { status: "APPROVED" },
    });
    const rejectedVerifications = await prisma.verificationRequest.count({
      where: { status: "REJECTED" },
    });
    const totalVerifications = await prisma.verificationRequest.count();

    // 3. Dynamic Verified Revenue Calculation
    // Total Revenue = SUM(successful/verified payments in DB)
    const paidOrders = await prisma.order.findMany({
      where: { status: "PAID" },
      select: { amount: true, createdAt: true },
    });

    const capturedPayments = await prisma.payment.findMany({
      where: { status: "CAPTURED", orderId: null },
      select: { amount: true, createdAt: true },
    });

    const approvedRequests = await prisma.verificationRequest.findMany({
      where: { status: "APPROVED", paymentId: null },
      select: { amount: true, createdAt: true, verifiedAt: true, requestDate: true },
    });

    const refundsAggregate = await prisma.refund.aggregate({
      _sum: { amount: true },
    });
    const totalRefunds = refundsAggregate._sum.amount || 0;

    let grossRevenue = 0;
    const monthlyRevenueMap: Record<string, number> = {};

    paidOrders.forEach((o) => {
      grossRevenue += o.amount;
      const monthKey = new Date(o.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + o.amount;
    });

    capturedPayments.forEach((p) => {
      grossRevenue += p.amount;
      const monthKey = new Date(p.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + p.amount;
    });

    approvedRequests.forEach((r) => {
      grossRevenue += r.amount;
      const dateVal = r.verifiedAt || r.requestDate || r.createdAt;
      const monthKey = new Date(dateVal).toLocaleString("default", { month: "short", year: "2-digit" });
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + r.amount;
    });

    const netRevenue = Math.max(0, grossRevenue - totalRefunds);

    const revenueChartData = Object.keys(monthlyRevenueMap).map((m) => ({
      month: m,
      revenue: monthlyRevenueMap[m],
    }));

    // 4. Expiring soon count (<= 5 days)
    const now = new Date();
    const in5Days = new Date();
    in5Days.setDate(in5Days.getDate() + 5);

    const expiringSoonCount = await prisma.membership.count({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: now,
          lte: in5Days,
        },
      },
    });

    // 5. Classes & Trainers count
    const totalClasses = await prisma.class.count();
    const totalTrainers = await prisma.trainerProfile.count();
    const totalPlans = await prisma.membershipPlan.count();

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: netRevenue,
        grossRevenue,
        totalRefunds,
        totalTransactionsCount: paidOrders.length + capturedPayments.length + approvedRequests.length,
        totalMembers,
        activeMembers,
        expiredMembers,
        pendingVerifications,
        approvedVerifications,
        rejectedVerifications,
        totalVerifications,
        expiringSoonCount,
        totalClasses,
        totalTrainers,
        totalPlans,
        revenueChartData,
      },
    });
  } catch (error: any) {
    console.error("[API Admin Stats Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to compute dashboard stats" },
      { status: 500 }
    );
  }
}

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
        { success: false, message: "Forbidden: Admin access required", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const whereCondition: any = {};

    if (statusFilter !== "ALL") {
      whereCondition.status = statusFilter;
    }

    if (search) {
      whereCondition.OR = [
        { transactionRef: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { member: { id: { contains: search } } },
        { member: { userId: { contains: search } } },
      ];
    }

    const requests = await prisma.verificationRequest.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        member: {
          select: {
            id: true,
            userId: true,
            qrCode: true,
            membershipStatus: true,
          },
        },
        plan: true,
        payment: true,
        membership: true,
        pass: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Metric summary counts
    const pendingCount = await prisma.verificationRequest.count({
      where: { status: "PENDING_VERIFICATION" },
    });

    const approvedCount = await prisma.verificationRequest.count({
      where: { status: "APPROVED" },
    });

    const rejectedCount = await prisma.verificationRequest.count({
      where: { status: "REJECTED" },
    });

    const totalCount = await prisma.verificationRequest.count();

    return NextResponse.json({
      success: true,
      metrics: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount,
      },
      requests,
    });
  } catch (error: any) {
    console.error("Error fetching admin verification requests:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

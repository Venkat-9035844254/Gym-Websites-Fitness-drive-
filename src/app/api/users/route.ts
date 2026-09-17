import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        branchId: true,
        createdAt: true,
      },
    });

    const formattedUsers = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      phone: u.phone || undefined,
      avatar: u.avatar || undefined,
      branchId: u.branchId || undefined,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error("[API] Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const requestId = params.id;
    const body = await req.json();
    const { rejectionReason } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, message: "A rejection reason must be provided" },
        { status: 400 }
      );
    }

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        plan: true,
      },
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { success: false, message: "Verification request not found" },
        { status: 404 }
      );
    }

    const rejectionTime = new Date();

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // 1. Update VerificationRequest status to REJECTED
      const reqUpdated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
          verifiedAt: rejectionTime,
          verifiedBy: authUser.id,
        },
      });

      // 2. Update Payment record status
      if (verificationRequest.paymentId) {
        await tx.payment.update({
          where: { id: verificationRequest.paymentId },
          data: { status: "FAILED" },
        });
      }

      // 3. Update Membership record status
      if (verificationRequest.membershipId) {
        await tx.membership.update({
          where: { id: verificationRequest.membershipId },
          data: { status: "CANCELLED" },
        });
      }

      // 4. Update MemberProfile status if pending
      await tx.memberProfile.update({
        where: { id: verificationRequest.memberId },
        data: { membershipStatus: "REJECTED" },
      });

      // 5. Revoke Pass if one exists
      await tx.membershipPass.updateMany({
        where: { verificationRequestId: requestId },
        data: { status: "REVOKED" },
      });

      // 6. Notify Member
      await tx.notification.create({
        data: {
          userId: verificationRequest.userId,
          title: "Payment Request Rejected",
          message: `Your membership payment request for ${verificationRequest.plan.name} was not approved by the Owner. Reason: "${rejectionReason.trim()}".`,
          type: "PAYMENT",
        },
      });

      return reqUpdated;
    });

    return NextResponse.json({
      success: true,
      message: "Verification request rejected",
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error rejecting verification request:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

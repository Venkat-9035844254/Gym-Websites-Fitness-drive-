import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { calculateMembershipDates, generatePassNumber } from "@/lib/membershipUtils";

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

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        member: true,
        user: true,
        plan: true,
        payment: true,
        membership: true,
        pass: true,
      },
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { success: false, message: "Verification request not found" },
        { status: 404 }
      );
    }

    const approvalTime = new Date();
    const dateRange = calculateMembershipDates(approvalTime, verificationRequest.billingCycle);

    // Database transaction to update request, payment, membership, profile, and issue pass
    const updatedResult = await prisma.$transaction(async (tx) => {
      // 1. Update VerificationRequest status
      const updatedReq = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          verifiedAt: approvalTime,
          verifiedBy: authUser.id,
          rejectionReason: null,
        },
      });

      // 2. Update Payment status to VERIFIED / CAPTURED
      if (verificationRequest.paymentId) {
        await tx.payment.update({
          where: { id: verificationRequest.paymentId },
          data: {
            status: "CAPTURED",
            captured: true,
          },
        });
      }

      // 3. Update Membership record status & start/end dates
      let membershipId = verificationRequest.membershipId;
      if (membershipId) {
        await tx.membership.update({
          where: { id: membershipId },
          data: {
            status: "ACTIVE",
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            amountPaid: verificationRequest.amount,
            billingCycle: verificationRequest.billingCycle,
          },
        });
      } else {
        const newMembership = await tx.membership.create({
          data: {
            memberId: verificationRequest.memberId,
            planId: verificationRequest.planId,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            amountPaid: verificationRequest.amount,
            status: "ACTIVE",
            billingCycle: verificationRequest.billingCycle,
          },
        });
        membershipId = newMembership.id;
      }

      // 4. Update MemberProfile status
      await tx.memberProfile.update({
        where: { id: verificationRequest.memberId },
        data: {
          membershipStatus: "ACTIVE",
          currentPlanId: verificationRequest.planId,
        },
      });

      // 5. Generate / Upsert MembershipPass
      const passNumber = generatePassNumber();
      const qrPayload = JSON.stringify({
        passNumber,
        memberId: verificationRequest.memberId,
        userId: verificationRequest.userId,
        memberName: verificationRequest.user.name,
        planName: verificationRequest.plan.name,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });

      const pass = await tx.membershipPass.upsert({
        where: { verificationRequestId: requestId },
        update: {
          status: "ACTIVE",
          issueDate: approvalTime,
          qrCodeData: qrPayload,
        },
        create: {
          passNumber: passNumber,
          memberId: verificationRequest.memberId,
          membershipId: membershipId!,
          verificationRequestId: requestId,
          issueDate: approvalTime,
          qrCodeData: qrPayload,
          status: "ACTIVE",
        },
      });

      // 6. Notify Member
      await tx.notification.create({
        data: {
          userId: verificationRequest.userId,
          title: "Membership Payment Approved!",
          message: `Your payment of ₹${verificationRequest.amount} for ${verificationRequest.plan.name} has been verified and approved. Your active pass #${pass.passNumber} is now available!`,
          type: "PAYMENT",
        },
      });

      return { updatedReq, pass };
    });

    return NextResponse.json({
      success: true,
      message: "Membership verification request approved successfully. Pass activated!",
      request: updatedResult.updatedReq,
      pass: updatedResult.pass,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  } catch (error: any) {
    console.error("Error approving verification request:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

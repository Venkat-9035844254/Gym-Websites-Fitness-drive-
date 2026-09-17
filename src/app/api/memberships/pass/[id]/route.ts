import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { formatDateDDMMYYYY, generatePassNumber, calculateMembershipDates } from "@/lib/membershipUtils";

export const dynamic = "force-dynamic";

export async function GET(
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

    const identifier = params.id;

    // 1. Search by Pass ID, Pass Number, VerificationRequest ID, MemberProfile ID, or User ID
    let pass = await prisma.membershipPass.findFirst({
      where: {
        OR: [
          { id: identifier },
          { passNumber: identifier },
          { verificationRequestId: identifier },
          { memberId: identifier },
          { member: { userId: identifier } },
        ],
      },
      include: {
        member: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
          },
        },
        membership: {
          include: {
            plan: true,
          },
        },
        verificationRequest: {
          include: {
            payment: true,
            plan: true,
          },
        },
      },
    });

    // 2. Fallback: If no explicit MembershipPass record exists yet, check if MemberProfile has ACTIVE status
    if (!pass) {
      const memberProfile = await prisma.memberProfile.findFirst({
        where: {
          OR: [
            { userId: authUser.id },
            { id: identifier },
            { userId: identifier },
          ],
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          currentPlan: true,
          memberships: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { plan: true },
          },
          verificationRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { payment: true, plan: true },
          },
        },
      });

      if (memberProfile && memberProfile.membershipStatus === "ACTIVE") {
        const now = new Date();
        const plan = memberProfile.currentPlan || (await prisma.membershipPlan.findFirst()) || {
          id: "plan-strength",
          name: "Strength Training Pass",
          description: "Full strength training gym floor access.",
          priceMonthly: 800,
          priceSixMonths: 4500,
          priceYearly: 9000,
        };

        let membership = memberProfile.memberships[0];
        if (!membership) {
          const dates = calculateMembershipDates(now, "MONTHLY");
          membership = await prisma.membership.create({
            data: {
              memberId: memberProfile.id,
              planId: plan.id,
              startDate: dates.startDate,
              endDate: dates.endDate,
              amountPaid: plan.priceMonthly || 800,
              status: "ACTIVE",
              billingCycle: "MONTHLY",
            },
            include: { plan: true },
          });
        }

        let verifReq = memberProfile.verificationRequests[0];
        if (!verifReq) {
          verifReq = await prisma.verificationRequest.create({
            data: {
              memberId: memberProfile.id,
              userId: memberProfile.userId,
              planId: plan.id,
              membershipId: membership.id,
              amount: membership.amountPaid,
              billingCycle: membership.billingCycle,
              paymentMethod: "VERIFIED_ACCOUNT",
              transactionRef: `REF-${Date.now().toString().substring(5)}`,
              status: "APPROVED",
              requestDate: now,
              verifiedAt: now,
            },
            include: { payment: true, plan: true },
          });
        }

        const passNum = generatePassNumber();
        const qrPayload = JSON.stringify({
          passNumber: passNum,
          memberId: memberProfile.id,
          userId: memberProfile.userId,
          memberName: memberProfile.user.name,
          planName: plan.name,
        });

        pass = await prisma.membershipPass.create({
          data: {
            passNumber: passNum,
            memberId: memberProfile.id,
            membershipId: membership.id,
            verificationRequestId: verifReq.id,
            issueDate: now,
            qrCodeData: qrPayload,
            status: "ACTIVE",
          },
          include: {
            member: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true, avatar: true },
                },
              },
            },
            membership: {
              include: { plan: true },
            },
            verificationRequest: {
              include: { payment: true, plan: true },
            },
          },
        });
      }
    }

    if (!pass) {
      return NextResponse.json(
        {
          success: false,
          message: "Membership pass not found. Please submit a payment verification request first.",
        },
        { status: 404 }
      );
    }

    // 3. Authorization Check (IDOR Prevention): Requester must be pass owner or Admin
    const isOwner = authUser.id === pass.member.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You are not authorized to view this pass", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 4. Strict Backend Status Verification
    const isRequestApproved = pass.verificationRequest?.status === "APPROVED";
    const isMembershipActive = pass.membership?.status === "ACTIVE";
    const now = new Date();
    const isNotExpired = pass.membership?.endDate ? now <= new Date(pass.membership.endDate) : false;

    if (!isRequestApproved || !isMembershipActive || !isNotExpired) {
      let failReason = "Membership pass unavailable.";
      if (!isRequestApproved) failReason = "Payment verification has not been approved by Admin yet.";
      else if (!isMembershipActive) failReason = "Membership is not in ACTIVE state.";
      else if (!isNotExpired) failReason = "Membership pass has EXPIRED.";

      return NextResponse.json(
        {
          success: false,
          message: failReason,
          verificationStatus: pass.verificationRequest?.status,
          membershipStatus: pass.membership?.status,
          isExpired: !isNotExpired,
        },
        { status: 403 }
      );
    }

    // Calculate days remaining
    const endDate = new Date(pass.membership.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const formattedPass = {
      id: pass.id,
      passNumber: pass.passNumber,
      issueDate: pass.issueDate.toISOString(),
      qrCodeData: pass.qrCodeData,
      status: pass.status,
      // Member details
      memberId: pass.member.id,
      userId: pass.member.userId,
      memberName: pass.member.user.name,
      memberEmail: pass.member.user.email,
      memberPhone: pass.member.user.phone || "N/A",
      memberAvatar: pass.member.user.avatar || null,
      memberQrCode: pass.member.qrCode,
      // Plan & Payment details
      planId: pass.membership.planId,
      planName: pass.membership.plan.name,
      planDescription: pass.membership.plan.description,
      billingCycle: pass.membership.billingCycle,
      amountPaid: pass.membership.amountPaid,
      paymentRef: pass.verificationRequest?.transactionRef || "VERIFIED-REF",
      paymentMethod: pass.verificationRequest?.paymentMethod || "MANUAL",
      // Duration dates
      startDate: pass.membership.startDate.toISOString(),
      endDate: pass.membership.endDate.toISOString(),
      startDateFormatted: formatDateDDMMYYYY(pass.membership.startDate),
      endDateFormatted: formatDateDDMMYYYY(pass.membership.endDate),
      daysRemaining: daysRemaining,
      gymName: "FITNESS DRIVE GYM ARENA",
    };

    return NextResponse.json({
      success: true,
      pass: formattedPass,
    });
  } catch (error: any) {
    console.error("Error fetching membership pass:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

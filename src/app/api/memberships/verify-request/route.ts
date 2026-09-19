import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Your session has expired. Please log in again.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, billingCycle, amount, paymentMethod, transactionRef, receiptUrl } = body;

    if (!planId || !billingCycle || !amount || !transactionRef) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: planId, billingCycle, amount, transactionRef" },
        { status: 400 }
      );
    }

    // Verify membership plan exists
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Invalid membership plan selected" },
        { status: 404 }
      );
    }

    // Ensure member profile exists
    let memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: authUser.id },
    });

    if (!memberProfile) {
      memberProfile = await prisma.memberProfile.create({
        data: {
          userId: authUser.id,
          qrCode: `FIT-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
          membershipStatus: "PENDING_VERIFICATION",
          currentPlanId: planId,
        },
      });
    }

    // Check if there is already a pending verification request
    const existingPending = await prisma.verificationRequest.findFirst({
      where: {
        memberId: memberProfile.id,
        status: "PENDING_VERIFICATION",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a pending verification request. Please wait for admin approval.",
          existingRequest: existingPending,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const manualRefId = `MANUAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Perform database transaction to create Payment, Membership, and VerificationRequest atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record in PENDING_VERIFICATION status
      const payment = await tx.payment.create({
        data: {
          userId: authUser.id,
          razorpayPaymentId: `PAY-${manualRefId}`,
          razorpayOrderId: `ORD-${manualRefId}`,
          amount: parseFloat(amount),
          currency: "INR",
          status: "PENDING_VERIFICATION",
          paymentMethod: paymentMethod || "MANUAL",
          email: authUser.email,
          contact: authUser.phone || null,
          captured: false,
        },
      });

      // 2. Create Membership record in PENDING_VERIFICATION status
      const membership = await tx.membership.create({
        data: {
          memberId: memberProfile.id,
          planId: planId,
          startDate: now,
          endDate: now, // Will be set upon admin approval
          amountPaid: parseFloat(amount),
          status: "PENDING_VERIFICATION",
          billingCycle: billingCycle,
        },
      });

      // Link payment to membership
      await tx.payment.update({
        where: { id: payment.id },
        data: { membershipId: membership.id },
      });

      // 3. Create VerificationRequest
      const verificationRequest = await tx.verificationRequest.create({
        data: {
          memberId: memberProfile.id,
          userId: authUser.id,
          planId: planId,
          paymentId: payment.id,
          membershipId: membership.id,
          amount: parseFloat(amount),
          billingCycle: billingCycle,
          paymentMethod: paymentMethod || "MANUAL",
          transactionRef: transactionRef.trim(),
          receiptUrl: receiptUrl || null,
          status: "PENDING_VERIFICATION",
          requestDate: now,
        },
        include: {
          plan: true,
          payment: true,
        },
      });

      // Update MemberProfile status
      await tx.memberProfile.update({
        where: { id: memberProfile.id },
        data: {
          membershipStatus: "PENDING_VERIFICATION",
          currentPlanId: planId,
        },
      });

      // Find admin user(s) to create system notification
      const adminUsers = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: "New Membership Verification Request",
            message: `${authUser.name} submitted a ${billingCycle} payment verification request for ${plan.name} (₹${amount}). Ref: ${transactionRef}`,
            type: "PAYMENT",
          },
        });
      }

      // Create notification for the member confirming request submission
      await tx.notification.create({
        data: {
          userId: authUser.id,
          title: "Payment Request Submitted",
          message: `Your membership payment request for ${plan.name} (${billingCycle}) has been submitted successfully. Please wait for Owner verification.`,
          type: "PAYMENT",
        },
      });

      return verificationRequest;
    });

    return NextResponse.json({
      success: true,
      message: "Verification request submitted successfully. Waiting for admin approval.",
      request: result,
    });
  } catch (error: any) {
    console.error("Error submitting verification request:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Your session has expired. Please log in again.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: authUser.id },
      include: {
        currentPlan: true,
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            plan: true,
            pass: true,
          },
        },
      },
    });

    if (!memberProfile) {
      return NextResponse.json({
        success: true,
        requests: [],
        latestRequest: null,
        activeMembership: null,
      });
    }

    const requests = await prisma.verificationRequest.findMany({
      where: { memberId: memberProfile.id },
      include: {
        plan: true,
        payment: true,
        pass: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const latestRequest = requests.length > 0 ? requests[0] : null;
    const latestMembership = memberProfile.memberships.length > 0 ? memberProfile.memberships[0] : null;

    // Evaluate dynamic lifecycle status (ACTIVE vs EXPIRED)
    let membershipStatus = memberProfile.membershipStatus;
    let isExpired = false;

    if (latestMembership && latestMembership.status === "ACTIVE") {
      if (new Date() > new Date(latestMembership.endDate)) {
        membershipStatus = "EXPIRED";
        isExpired = true;
      }
    }

    return NextResponse.json({
      success: true,
      requests,
      latestRequest,
      activeMembership: latestMembership,
      membershipStatus,
      isExpired,
    });
  } catch (error: any) {
    console.error("Error fetching member verification requests:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

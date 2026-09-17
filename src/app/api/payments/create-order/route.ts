import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, billingCycle = "MONTHLY", hasDietPlan = false } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Membership plan ID is required", code: "MISSING_PLAN_ID" },
        { status: 400 }
      );
    }

    // 1. Fetch official plan from database to enforce server-side authority
    let plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      plan = await prisma.membershipPlan.findFirst({
        where: {
          OR: [
            { id: { contains: planId } },
            { name: { contains: planId } },
          ],
        },
      });
    }

    if (!plan) {
      plan = await prisma.membershipPlan.findFirst();
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Membership plan not found in database", code: "PLAN_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 2. Calculate exact price on server
    const validCycle = ["MONTHLY", "SIX_MONTHS", "YEARLY"].includes(billingCycle)
      ? billingCycle
      : "MONTHLY";

    const durationMultiplier = validCycle === "MONTHLY" ? 1 : validCycle === "SIX_MONTHS" ? 6 : 12;
    
    let planBasePrice = plan.priceMonthly;
    if (validCycle === "SIX_MONTHS") {
      planBasePrice = (plan as any).priceSixMonths || plan.priceMonthly * 6;
    } else if (validCycle === "YEARLY") {
      planBasePrice = plan.priceYearly;
    }

    const dietPrice = hasDietPlan ? 500 * durationMultiplier : 0;
    const basePrice = planBasePrice + dietPrice;
    const taxAmount = Math.round(basePrice * 0.18); // 18% GST
    const totalAmountINR = basePrice + taxAmount;
    const amountInPaise = Math.round(totalAmountINR * 100);

    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, message: "Calculated amount must be at least ₹1.00", code: "INVALID_AMOUNT" },
        { status: 400 }
      );
    }

    // 3. Create Razorpay order via SDK
    const razorpay = getRazorpayClient();
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const receipt = `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: user.id,
        userEmail: user.email,
        planId: plan.id,
        planName: plan.name,
        billingCycle: validCycle,
        hasDietPlan: String(hasDietPlan),
      },
    });

    // 4. Save Order in local database with status PENDING
    const savedOrder = await prisma.order.create({
      data: {
        userId: user.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmountINR,
        currency: "INR",
        status: "PENDING",
        planId: plan.id,
        billingCycle: validCycle,
        receipt: receipt,
        notes: JSON.stringify({
          planName: plan.name,
          hasDietPlan,
          totalPaise: amountInPaise,
          basePrice,
          taxAmount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      order_id: razorpayOrder.id, // alias for frontend compatibility
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: keyId,
      key_id: keyId, // alias for frontend compatibility
      receipt: receipt,
      localOrderId: savedOrder.id,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.description || error?.message || "Failed to create Razorpay order",
        code: "ORDER_CREATION_FAILED",
      },
      { status: 500 }
    );
  }
}

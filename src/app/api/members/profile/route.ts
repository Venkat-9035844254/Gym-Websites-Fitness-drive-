import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      age,
      gender,
      heightCm,
      weightKg,
      workoutDays,
      foodPreference,
      dietGoal,
      dietBudget,
      dietBudgetPeriod,
      workoutPlanJson,
      dietPlanJson,
    } = body;

    let memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: authUser.id },
    });

    if (!memberProfile) {
      const qrCodeVal = `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
      memberProfile = await prisma.memberProfile.create({
        data: {
          userId: authUser.id,
          qrCode: qrCodeVal,
          membershipStatus: "ACTIVE",
        },
      });
    }

    const updateData: any = {};
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (gender !== undefined) updateData.gender = String(gender);
    if (heightCm !== undefined) updateData.heightCm = parseFloat(heightCm);
    if (weightKg !== undefined) updateData.weightKg = parseFloat(weightKg);
    if (workoutDays !== undefined) updateData.workoutDays = parseInt(workoutDays, 10);
    if (foodPreference !== undefined) updateData.foodPreference = String(foodPreference);
    if (dietGoal !== undefined) updateData.dietGoal = String(dietGoal);
    if (dietBudget !== undefined) updateData.dietBudget = parseFloat(dietBudget);
    if (dietBudgetPeriod !== undefined) updateData.dietBudgetPeriod = String(dietBudgetPeriod);

    if (workoutPlanJson !== undefined) {
      updateData.workoutPlanJson =
        typeof workoutPlanJson === "string"
          ? workoutPlanJson
          : JSON.stringify(workoutPlanJson);
    }

    if (dietPlanJson !== undefined) {
      updateData.dietPlanJson =
        typeof dietPlanJson === "string"
          ? dietPlanJson
          : JSON.stringify(dietPlanJson);
    }

    const updatedProfile = await prisma.memberProfile.update({
      where: { id: memberProfile.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Member profile updated successfully",
      memberProfile: updatedProfile,
    });
  } catch (error: any) {
    console.error("[API] Error updating member profile:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

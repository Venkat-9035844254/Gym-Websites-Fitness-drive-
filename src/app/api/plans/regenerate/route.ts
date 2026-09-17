import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWorkoutPlan } from "@/lib/workoutGenerator";
import { generateDietPlan } from "@/lib/dietGenerator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      workoutDays,
      foodPreference,
      dietGoal,
      dietBudget,
      dietBudgetPeriod,
      age,
      gender,
      heightCm,
      weightKg,
    } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    }

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId },
    });

    if (!memberProfile) {
      return NextResponse.json({ success: false, message: "Member profile not found." }, { status: 404 });
    }

    const parsedDays = workoutDays ? parseInt(workoutDays, 10) : memberProfile.workoutDays || 4;
    const parsedFoodPref = foodPreference || memberProfile.foodPreference || "Non-Vegetarian";
    const parsedDietGoal = dietGoal || memberProfile.dietGoal || "Muscle Gain";
    const parsedBudget = dietBudget ? parseFloat(dietBudget) : memberProfile.dietBudget || 7000;
    const parsedBudgetPeriod = dietBudgetPeriod || memberProfile.dietBudgetPeriod || "MONTHLY";
    const parsedAge = age ? parseInt(age, 10) : memberProfile.age || 25;
    const parsedHeight = heightCm ? parseFloat(heightCm) : memberProfile.heightCm || 175;
    const parsedWeight = weightKg ? parseFloat(weightKg) : memberProfile.weightKg || 70;
    const parsedGender = gender || memberProfile.gender || "Male";

    // Generate new Workout & Diet Plans
    const newWorkoutPlan = generateWorkoutPlan(userId, parsedDays);
    const newDietPlan = generateDietPlan(
      {
        age: parsedAge,
        gender: parsedGender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        workoutDays: parsedDays,
      },
      parsedFoodPref as any,
      parsedDietGoal as any,
      parsedBudget,
      parsedBudgetPeriod as any
    );

    newWorkoutPlan.userId = userId;
    newDietPlan.userId = userId;

    // Update DB
    const updatedProfile = await prisma.memberProfile.update({
      where: { userId },
      data: {
        workoutDays: parsedDays,
        foodPreference: parsedFoodPref,
        dietGoal: parsedDietGoal,
        dietBudget: parsedBudget,
        dietBudgetPeriod: parsedBudgetPeriod,
        age: parsedAge,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        gender: parsedGender,
        workoutPlanJson: JSON.stringify(newWorkoutPlan),
        dietPlanJson: JSON.stringify(newDietPlan),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workout and Diet plans regenerated successfully!",
      memberProfile: updatedProfile,
      workoutPlan: newWorkoutPlan,
      dietPlan: newDietPlan,
    });
  } catch (error: any) {
    console.error("[API] Plan regeneration error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to regenerate plans." },
      { status: 500 }
    );
  }
}

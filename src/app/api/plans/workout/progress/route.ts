import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GeneratedWorkoutPlan } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, dayNumber, exerciseId, completed } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 });
    }

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId },
    });

    if (!memberProfile || !memberProfile.workoutPlanJson) {
      return NextResponse.json({ success: false, message: "No workout plan found for user." }, { status: 404 });
    }

    const workoutPlan: GeneratedWorkoutPlan = JSON.parse(memberProfile.workoutPlanJson);

    const targetDay = workoutPlan.days.find((d) => d.dayNumber === dayNumber);
    if (targetDay) {
      if (exerciseId) {
        // Toggle specific exercise completion
        const ex = targetDay.exercises.find((item) => item.id === exerciseId || item.exerciseId === exerciseId);
        if (ex) {
          ex.completed = typeof completed === "boolean" ? completed : !ex.completed;
        }
      } else {
        // Toggle entire day completion
        const isDayDone = typeof completed === "boolean" ? completed : !targetDay.isCompleted;
        targetDay.isCompleted = isDayDone;
        targetDay.exercises.forEach((ex) => {
          ex.completed = isDayDone;
        });
      }
    }

    const updatedWorkoutPlanJson = JSON.stringify(workoutPlan);

    await prisma.memberProfile.update({
      where: { userId },
      data: { workoutPlanJson: updatedWorkoutPlanJson },
    });

    return NextResponse.json({
      success: true,
      workoutPlan,
    });
  } catch (error: any) {
    console.error("[API] Workout progress update error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update workout progress." },
      { status: 500 }
    );
  }
}

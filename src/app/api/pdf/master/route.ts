import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateWorkoutPlan } from "@/lib/workoutGenerator";
import { generateDietPlan } from "@/lib/dietGenerator";
import { GeneratedWorkoutPlan, GeneratedDietPlan } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: authUser.id },
    });

    let workoutPlan: GeneratedWorkoutPlan | null = null;
    let dietPlan: GeneratedDietPlan | null = null;

    if (memberProfile?.workoutPlanJson) {
      try {
        workoutPlan = typeof memberProfile.workoutPlanJson === "string"
          ? JSON.parse(memberProfile.workoutPlanJson)
          : memberProfile.workoutPlanJson;
      } catch (e) {}
    }

    if (memberProfile?.dietPlanJson) {
      try {
        dietPlan = typeof memberProfile.dietPlanJson === "string"
          ? JSON.parse(memberProfile.dietPlanJson)
          : memberProfile.dietPlanJson;
      } catch (e) {}
    }

    // Generate dynamic fallback plans if missing
    if (!workoutPlan) {
      workoutPlan = generateWorkoutPlan(authUser.id, memberProfile?.workoutDays || 4);
    }
    if (!dietPlan) {
      dietPlan = generateDietPlan(
        {
          age: memberProfile?.age || 25,
          gender: memberProfile?.gender || "Male",
          heightCm: memberProfile?.heightCm || 175,
          weightKg: (memberProfile as any)?.currentWeightKg || memberProfile?.weightKg || 70,
          workoutDays: memberProfile?.workoutDays || 4,
        },
        (memberProfile?.foodPreference as any) || "Non-Vegetarian",
        (memberProfile?.dietGoal as any) || "Muscle Gain",
        memberProfile?.dietBudget || 7000,
        (memberProfile?.dietBudgetPeriod as any) || "MONTHLY"
      );
    }

    const doc = new jsPDF();

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(6, 182, 212); // Cyan-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FITNESS DRIVE", 14, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("MASTER PERSONALIZED FITNESS PLAN", 110, 18);

    // Member Profile Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 34, 182, 32, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 34, 182, 32, "S");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Member Name: ${authUser.name}`, 18, 41);
    doc.text(`Email: ${authUser.email}`, 18, 47);
    doc.text(`Phone: ${authUser.phone || "N/A"}`, 18, 53);
    doc.text(`Age / Gender: ${memberProfile?.age || 25} yrs | ${memberProfile?.gender || "Male"}`, 18, 59);

    doc.text(`Fitness Goal: ${memberProfile?.dietGoal || dietPlan?.dietGoal || "Muscle Gain"}`, 110, 41);
    doc.text(`Food Preference: ${dietPlan?.foodPreference || memberProfile?.foodPreference || "Non-Vegetarian"}`, 110, 47);
    doc.text(`Height / Weight: ${memberProfile?.heightCm || 175} cm | ${(memberProfile as any)?.currentWeightKg || memberProfile?.weightKg || 70} kg`, 110, 53);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 110, 59);

    let currentY = 72;

    // SECTION 1: WORKOUT PLAN
    if (workoutPlan && workoutPlan.days) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(6, 182, 212);
      doc.text("1. WORKOUT SCHEDULE & ROUTINES", 14, currentY);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Split Title: ${workoutPlan.splitTitle} (${workoutPlan.workoutDays} Days / Week)`, 14, currentY + 6);

      currentY += 12;

      workoutPlan.days.forEach((day) => {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${day.dayName.toUpperCase()} — ${day.title}`, 14, currentY);

        if (day.isRestDay) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text("REST DAY — Focus on hydration, mobility, and recovery.", 14, currentY + 6);
          currentY += 14;
          return;
        }

        const tableRows = day.exercises.map((ex, idx) => [
          `${idx + 1}. ${ex.name}`,
          ex.targetMuscle,
          `${ex.sets} Sets`,
          ex.reps,
          `${ex.restSeconds}s`,
          ex.instructions ? ex.instructions.substring(0, 40) : "Maintain strict form",
        ]);

        autoTable(doc, {
          startY: currentY + 2,
          head: [["Exercise Name", "Target Muscle", "Sets", "Reps", "Rest", "Instructions"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 18 },
            3: { cellWidth: 20 },
            4: { cellWidth: 18 },
            5: { cellWidth: 46 },
          },
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      });
    }

    // Page Break before Diet
    doc.addPage();
    currentY = 20;

    // SECTION 2: NUTRITION PLAN
    const dietDays = dietPlan?.weeklyPlan || dietPlan?.monthlyPlan || [];

    if (dietPlan && dietDays.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("2. PERSONALIZED NUTRITION & MEAL PLAN", 14, currentY);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Target Daily Intake: ${dietPlan.dailyCalorieTarget} kcal | Protein Target: ${dietPlan.dailyProteinTarget}g | Preference: ${dietPlan.foodPreference}`,
        14,
        currentY + 6
      );

      currentY += 12;

      dietDays.forEach((day: any) => {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${day.dayName.toUpperCase()} NUTRITION SCHEDULE`, 14, currentY);

        const tableRows = day.meals.map((m: any) => [
          m.mealType,
          m.name,
          Array.isArray(m.items) ? m.items.join(", ") : m.items,
          m.quantity,
          `${m.calories} kcal`,
          `${m.proteinGrams}g`,
          `₹${m.approxCostInr}`,
        ]);

        autoTable(doc, {
          startY: currentY + 2,
          head: [["Meal Type", "Dish Name", "Food Items", "Quantity", "Calories", "Protein", "Cost"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: "bold" },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 26 },
            1: { cellWidth: 35 },
            2: { cellWidth: 52 },
            3: { cellWidth: 26 },
            4: { cellWidth: 18 },
            5: { cellWidth: 15 },
            6: { cellWidth: 16 },
          },
        });

        currentY = (doc as any).lastAutoTable.finalY + 8;
      });
    }

    // Disclaimer
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Important Note: This fitness & diet plan is generated for general health and athletic goals. Consult a physician or registered dietitian before making significant physical or dietary adjustments.",
      14,
      currentY + 5,
      { maxWidth: 180 }
    );

    const pdfBuffer = doc.output("arraybuffer");
    const safeFilename = `FitnessDrive_Master_Fitness_Plan_${authUser.name.replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[PDF_GEN] Error generating master PDF API:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate Master PDF" },
      { status: 500 }
    );
  }
}

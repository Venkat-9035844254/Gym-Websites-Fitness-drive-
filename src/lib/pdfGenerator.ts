import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GeneratedWorkoutPlan, GeneratedDietPlan, User, MemberProfile } from "@/types";

export function downloadWorkoutPlanPdf(user: User, memberProfile: MemberProfile | null, plan: GeneratedWorkoutPlan) {
  const doc = new jsPDF();

  // Title Header
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(6, 182, 212); // Cyan-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FITNESS DRIVE", 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("PERSONALIZED WORKOUT PLAN", 110, 18);

  // User & Plan Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Member Name: ${user.name}`, 14, 38);
  doc.text(`Email: ${user.email}`, 14, 44);
  doc.text(`Workout Frequency: ${plan.workoutDays} Days / Week`, 14, 50);

  doc.text(`Split Title: ${plan.splitTitle}`, 120, 38);
  doc.text(`Generated Date: ${new Date(plan.generatedAt).toLocaleDateString()}`, 120, 44);
  doc.text(`Target Goal: ${memberProfile?.dietGoal || "General Fitness"}`, 120, 50);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 55, 196, 55);

  let currentY = 60;

  plan.days.forEach((day) => {
    // Add page break if near bottom
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text(`${day.dayName.toUpperCase()} — ${day.title}`, 14, currentY);

    if (day.isRestDay) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("REST DAY — Focus on active recovery, hydration, and mobility.", 14, currentY + 7);
      currentY += 16;
      return;
    }

    const tableRows = day.exercises.map((ex, idx) => [
      `${idx + 1}. ${ex.name}`,
      ex.targetMuscle,
      `${ex.sets} Sets`,
      ex.reps,
      `${ex.restSeconds}s`,
      ex.instructions ? ex.instructions.substring(0, 45) + "..." : "Controlled form",
    ]);

    autoTable(doc, {
      startY: currentY + 3,
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

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Footer Disclaimer
  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Important Note: This workout plan is a general fitness-oriented program and is not a substitute for advice from a qualified medical doctor or certified athletic trainer.",
    14,
    currentY + 5,
    { maxWidth: 180 }
  );

  doc.save(`Fitness_Drive_Workout_Plan_${user.name.replace(/\s+/g, "_")}.pdf`);
}

export function downloadDietPlanPdf(user: User, memberProfile: MemberProfile | null, plan: GeneratedDietPlan) {
  const doc = new jsPDF();

  // Title Header
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(6, 182, 212); // Cyan-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FITNESS DRIVE", 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("PERSONALIZED DIET & NUTRITION PLAN", 110, 18);

  // User & Plan Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Member Name: ${user.name}`, 14, 38);
  doc.text(`Food Preference: ${plan.foodPreference}`, 14, 44);
  doc.text(`Fitness Goal: ${plan.dietGoal}`, 14, 50);

  doc.text(`Daily Calorie Target: ${plan.dailyCalorieTarget} kcal`, 120, 38);
  doc.text(`Daily Protein Target: ${plan.dailyProteinTarget} g`, 120, 44);
  doc.text(`Approx. Monthly Budget: RS ${plan.dietBudget.toLocaleString("en-IN")}`, 120, 50);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 55, 196, 55);

  let currentY = 60;

  plan.weeklyPlan.forEach((day) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text(`${day.dayName.toUpperCase()} MEAL SCHEDULE`, 14, currentY);

    const tableRows = day.meals.map((m) => [
      m.mealType,
      m.name,
      m.items.join(", "),
      m.quantity,
      `${m.calories} kcal`,
      `${m.proteinGrams}g`,
      `RS ${m.approxCostInr}`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [["Meal Type", "Dish Name", "Food Items", "Quantity", "Calories", "Protein", "Cost"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
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

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Footer Disclaimer
  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Important Note: This diet plan is a general fitness-oriented plan and is not a substitute for advice from a qualified doctor or registered dietitian. Users with medical conditions, allergies, or special nutritional requirements should consult a qualified professional.",
    14,
    currentY + 5,
    { maxWidth: 180 }
  );

  doc.save(`Fitness_Drive_Diet_Plan_${user.name.replace(/\s+/g, "_")}.pdf`);
}

import { generateWorkoutPlan } from "../src/lib/workoutGenerator.js";

console.log("==========================================");
console.log("TESTING DYNAMIC WORKOUT & TRICEPS ALIGNMENT");
console.log("==========================================");

const params = {
  age: 28,
  gender: "Male",
  heightCm: 180,
  weightKg: 82,
  fitnessGoal: "Muscle Gain",
  workoutExperience: "Intermediate",
  equipment: "Full Gym",
  workoutType: "Hypertrophy",
  limitations: "",
};

const plan6 = generateWorkoutPlan("test-usr-1", 6, params);
console.log(`✓ 6-Day Plan Generated: "${plan6.splitTitle}"`);

plan6.days.forEach((day) => {
  if (day.isRestDay) return;
  console.log(`\nDay ${day.dayNumber}: ${day.title} (${day.muscleGroups.join(", ")})`);
  day.exercises.forEach((ex, idx) => {
    console.log(`   ${idx + 1}. [${ex.targetMuscle}] ${ex.name} (${ex.sets} sets x ${ex.reps}, rest ${ex.restSeconds}s)`);
    if (day.muscleGroups.includes("Triceps") && !day.muscleGroups.includes("Biceps") && ex.name.toLowerCase().includes("bicep")) {
      console.error(`❌ ERROR: Bicep exercise found in Triceps day! -> ${ex.name}`);
      process.exit(1);
    }
  });
});

console.log("\n==========================================");
console.log("✓ VERIFICATION SUCCESSFUL: 0 Misaligned Exercises Found!");
console.log("==========================================");

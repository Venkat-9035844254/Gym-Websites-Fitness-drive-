import { INITIAL_EXERCISES } from "./seedData";
import { GeneratedWorkoutPlan, WorkoutDayPlan, WorkoutExercisePlanItem } from "@/types";

function getRandomId(): string {
  return `wex-${Math.random().toString(36).substring(2, 9)}`;
}

export interface WorkoutBiometricsAndPreferences {
  age?: number;
  gender?: string;
  weightKg?: number;
  heightCm?: number;
  dietGoal?: string;
  fitnessGoal?: string;
  workoutExperience?: string;
  equipment?: string;
  workoutType?: string;
}

function findExercises(
  categoryKeywords: string[],
  count: number,
  usedIds: Set<string>,
  goal: string = "Muscle Gain"
): WorkoutExercisePlanItem[] {
  const matches = INITIAL_EXERCISES.filter((ex) => {
    const mg = (ex.muscleGroup || "").toLowerCase();
    const pb = (ex.primaryBodyPart || "").toLowerCase();
    const nm = (ex.name || "").toLowerCase();

    return categoryKeywords.some(
      (kw) => mg.includes(kw) || pb.includes(kw) || nm.includes(kw)
    );
  });

  // Filter out already used ones if possible
  let available = matches.filter((m) => !usedIds.has(m.id));
  if (available.length < count) {
    available = matches; // fallback to reuse if pool is small
  }

  const selected = available.slice(0, count);

  // Determine dynamic sets, reps, rest time based on fitness goal
  let defaultSets = 4;
  let defaultReps = "8-12";
  let defaultRest = 60;
  let defaultInstructionPrefix = "Maintain strict posture, peak contraction, and controlled eccentric control.";

  const normalizedGoal = goal.toLowerCase();
  if (normalizedGoal.includes("loss") || normalizedGoal.includes("fat") || normalizedGoal.includes("hiit")) {
    defaultSets = 4;
    defaultReps = "12-15";
    defaultRest = 45;
    defaultInstructionPrefix = "High-tempo execution with minimal rest to maximize calorie burn and metabolic response.";
  } else if (normalizedGoal.includes("strength") || normalizedGoal.includes("power")) {
    defaultSets = 5;
    defaultReps = "5-8";
    defaultRest = 90;
    defaultInstructionPrefix = "Heavy compound execution. Rest fully between sets and push heavy weight with explosive power.";
  } else if (normalizedGoal.includes("endurance") || normalizedGoal.includes("fitness")) {
    defaultSets = 3;
    defaultReps = "12-15";
    defaultRest = 45;
    defaultInstructionPrefix = "Focus on aerobic conditioning, continuous tension, and high stamina output.";
  }

  return selected.map((ex) => {
    usedIds.add(ex.id);
    const existingInstructions = Array.isArray(ex.instructions)
      ? ex.instructions.join(" ")
      : typeof ex.instructions === "string"
      ? ex.instructions
      : "";

    const instructionsStr = existingInstructions
      ? `${defaultInstructionPrefix} ${existingInstructions}`
      : defaultInstructionPrefix;

    return {
      id: getRandomId(),
      exerciseId: ex.id,
      name: ex.name,
      targetMuscle: ex.primaryBodyPart || ex.muscleGroup,
      imageUrl: ex.imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
      sets: defaultSets,
      reps: defaultReps,
      restSeconds: defaultRest,
      instructions: instructionsStr,
      completed: false,
    };
  });
}

export function generateWorkoutPlan(
  userId: string,
  workoutDaysCount: number,
  params: WorkoutBiometricsAndPreferences = {}
): GeneratedWorkoutPlan {
  const days: WorkoutDayPlan[] = [];
  const daysCount = [3, 4, 5, 6].includes(workoutDaysCount) ? workoutDaysCount : 4;
  const goal = params.fitnessGoal || params.dietGoal || "Muscle Gain";
  let splitTitle = "";

  if (daysCount === 6) {
    splitTitle = `6-Day Push/Pull/Legs ${goal} Split`;
    const usedMon = new Set<string>();
    const usedTue = new Set<string>();
    const usedWed = new Set<string>();

    // Mon: Chest 4 + Triceps 4 = 8
    const monExercises = [
      ...findExercises(["chest"], 4, usedMon, goal),
      ...findExercises(["tricep", "arm"], 4, usedMon, goal),
    ];
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps Hypertrophy",
      muscleGroups: ["Chest", "Triceps"],
      exercises: monExercises,
      isRestDay: false,
    });

    // Tue: Back 4 + Biceps 4 = 8
    const tueExercises = [
      ...findExercises(["back", "lats"], 4, usedTue, goal),
      ...findExercises(["bicep", "arm"], 4, usedTue, goal),
    ];
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps Density",
      muscleGroups: ["Back", "Biceps"],
      exercises: tueExercises,
      isRestDay: false,
    });

    // Wed: Legs 3 + Shoulders 3 + Abs 3 = 9
    const wedExercises = [
      ...findExercises(["leg", "quad", "hamstring", "calf"], 3, usedWed, goal),
      ...findExercises(["shoulder", "deltoid"], 3, usedWed, goal),
      ...findExercises(["ab", "core"], 3, usedWed, goal),
    ];
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "Legs + Shoulders + Core",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: wedExercises,
      isRestDay: false,
    });

    // Thu: Chest 4 + Triceps 4 = 8
    const thuExercises = [
      ...findExercises(["chest"], 4, new Set(), goal),
      ...findExercises(["tricep", "arm"], 4, new Set(), goal),
    ];
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "Upper Body Push Focus",
      muscleGroups: ["Chest", "Triceps"],
      exercises: thuExercises,
      isRestDay: false,
    });

    // Fri: Back 4 + Biceps 4 = 8
    const friExercises = [
      ...findExercises(["back", "lats"], 4, new Set(), goal),
      ...findExercises(["bicep", "arm"], 4, new Set(), goal),
    ];
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Upper Body Pull Focus",
      muscleGroups: ["Back", "Biceps"],
      exercises: friExercises,
      isRestDay: false,
    });

    // Sat: Legs 3 + Shoulders 3 + Abs 3 = 9
    const satExercises = [
      ...findExercises(["leg", "quad", "hamstring", "calf"], 3, new Set(), goal),
      ...findExercises(["shoulder", "deltoid"], 3, new Set(), goal),
      ...findExercises(["ab", "core"], 3, new Set(), goal),
    ];
    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: "Lower Body + Delts Conditioning",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: satExercises,
      isRestDay: false,
    });

    // Sun: Rest
    days.push({
      dayName: "Sunday",
      dayNumber: 7,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
  } else if (daysCount === 5) {
    splitTitle = `5-Day Advanced ${goal} Split`;
    const usedMon = new Set<string>();

    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps Power",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, goal),
        ...findExercises(["tricep", "arm"], 4, usedMon, goal),
      ],
      isRestDay: false,
    });

    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps Thickness",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue, goal),
        ...findExercises(["bicep", "arm"], 4, usedTue, goal),
      ],
      isRestDay: false,
    });

    const usedWed = new Set<string>();
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedWed, goal),
        ...findExercises(["shoulder", "deltoid"], 3, usedWed, goal),
        ...findExercises(["ab", "core"], 3, usedWed, goal),
      ],
      isRestDay: false,
    });

    const usedThu = new Set<string>();
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "Arms & Forearms Specialization",
      muscleGroups: ["Triceps", "Biceps", "Forearms"],
      exercises: [
        ...findExercises(["tricep"], 3, usedThu, goal),
        ...findExercises(["bicep"], 3, usedThu, goal),
        ...findExercises(["arm", "forearm", "wrist"], 3, usedThu, goal),
      ],
      isRestDay: false,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Full Body Conditioning & Core",
      muscleGroups: ["Chest", "Back", "Core", "Full Body"],
      exercises: [
        ...findExercises(["push", "chest"], 2, usedFri, goal),
        ...findExercises(["pull", "back"], 2, usedFri, goal),
        ...findExercises(["dip", "tricep", "arm"], 2, usedFri, goal),
        ...findExercises(["core", "ab", "plank"], 2, usedFri, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
    days.push({
      dayName: "Sunday",
      dayNumber: 7,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
  } else if (daysCount === 4) {
    splitTitle = `4-Day ${goal} Split`;
    const usedMon = new Set<string>();

    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps Focus",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, goal),
        ...findExercises(["tricep", "arm"], 4, usedMon, goal),
      ],
      isRestDay: false,
    });

    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps Focus",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue, goal),
        ...findExercises(["bicep", "arm"], 4, usedTue, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });

    const usedThu = new Set<string>();
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedThu, goal),
        ...findExercises(["shoulder", "deltoid"], 3, usedThu, goal),
        ...findExercises(["ab", "core"], 3, usedThu, goal),
      ],
      isRestDay: false,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Arms & Core Conditioning",
      muscleGroups: ["Triceps", "Biceps", "Abs"],
      exercises: [
        ...findExercises(["tricep"], 3, usedFri, goal),
        ...findExercises(["bicep"], 3, usedFri, goal),
        ...findExercises(["ab", "core"], 3, usedFri, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
    days.push({
      dayName: "Sunday",
      dayNumber: 7,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
  } else {
    // 3 Days Split
    splitTitle = `3-Day ${goal} Foundation Split`;

    const usedMon = new Set<string>();
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps Routine",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, goal),
        ...findExercises(["tricep", "arm"], 4, usedMon, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });

    const usedWed = new Set<string>();
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "Back + Biceps Routine",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedWed, goal),
        ...findExercises(["bicep", "arm"], 4, usedWed, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedFri, goal),
        ...findExercises(["shoulder", "deltoid"], 3, usedFri, goal),
        ...findExercises(["ab", "core"], 3, usedFri, goal),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
    days.push({
      dayName: "Sunday",
      dayNumber: 7,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
  }

  return {
    id: `wp-${Date.now()}`,
    userId,
    workoutDays: daysCount,
    splitTitle,
    days,
    generatedAt: new Date().toISOString(),
  };
}

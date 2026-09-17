import { INITIAL_EXERCISES } from "./seedData";
import { GeneratedWorkoutPlan, WorkoutDayPlan, WorkoutExercisePlanItem } from "@/types";

function getRandomId(): string {
  return `wex-${Math.random().toString(36).substring(2, 9)}`;
}

function findExercises(
  categoryKeywords: string[],
  count: number,
  usedIds: Set<string>
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

  return selected.map((ex) => {
    usedIds.add(ex.id);
    const instructionsStr = Array.isArray(ex.instructions)
      ? ex.instructions.join(" ")
      : typeof ex.instructions === "string"
      ? ex.instructions
      : "Focus on controlled form, proper breathing, and full range of motion.";

    return {
      id: getRandomId(),
      exerciseId: ex.id,
      name: ex.name,
      targetMuscle: ex.primaryBodyPart || ex.muscleGroup,
      imageUrl: ex.imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
      sets: 4,
      reps: "8-12",
      restSeconds: 60,
      instructions: instructionsStr,
      completed: false,
    };
  });
}

export function generateWorkoutPlan(userId: string, workoutDaysCount: number): GeneratedWorkoutPlan {
  const days: WorkoutDayPlan[] = [];
  const daysCount = [3, 4, 5, 6].includes(workoutDaysCount) ? workoutDaysCount : 4;
  let splitTitle = "";

  if (daysCount === 6) {
    splitTitle = "6-Day High-Frequency Push/Pull/Legs Split";
    const usedMon = new Set<string>();
    const usedTue = new Set<string>();
    const usedWed = new Set<string>();

    // Mon: Chest 4 + Triceps 4 = 8
    const monExercises = [
      ...findExercises(["chest"], 4, usedMon),
      ...findExercises(["tricep", "arm"], 4, usedMon),
    ];
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps",
      muscleGroups: ["Chest", "Triceps"],
      exercises: monExercises,
      isRestDay: false,
    });

    // Tue: Back 4 + Biceps 4 = 8
    const tueExercises = [
      ...findExercises(["back", "lats"], 4, usedTue),
      ...findExercises(["bicep", "arm"], 4, usedTue),
    ];
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps",
      muscleGroups: ["Back", "Biceps"],
      exercises: tueExercises,
      isRestDay: false,
    });

    // Wed: Legs 3 + Shoulders 3 + Abs 3 = 9
    const wedExercises = [
      ...findExercises(["leg", "quad", "hamstring", "calf"], 3, usedWed),
      ...findExercises(["shoulder", "deltoid"], 3, usedWed),
      ...findExercises(["ab", "core"], 3, usedWed),
    ];
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: wedExercises,
      isRestDay: false,
    });

    // Thu: Chest 4 + Triceps 4 = 8 (Repeat Mon split)
    const thuExercises = [
      ...findExercises(["chest"], 4, new Set()),
      ...findExercises(["tricep", "arm"], 4, new Set()),
    ];
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "Chest + Triceps",
      muscleGroups: ["Chest", "Triceps"],
      exercises: thuExercises,
      isRestDay: false,
    });

    // Fri: Back 4 + Biceps 4 = 8 (Repeat Tue split)
    const friExercises = [
      ...findExercises(["back", "lats"], 4, new Set()),
      ...findExercises(["bicep", "arm"], 4, new Set()),
    ];
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Back + Biceps",
      muscleGroups: ["Back", "Biceps"],
      exercises: friExercises,
      isRestDay: false,
    });

    // Sat: Legs 3 + Shoulders 3 + Abs 3 = 9 (Repeat Wed split)
    const satExercises = [
      ...findExercises(["leg", "quad", "hamstring", "calf"], 3, new Set()),
      ...findExercises(["shoulder", "deltoid"], 3, new Set()),
      ...findExercises(["ab", "core"], 3, new Set()),
    ];
    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: "Legs + Shoulders + Abs",
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
    splitTitle = "5-Day Advanced Bodybuilding & Conditioning Split";
    const usedMon = new Set<string>();

    // Mon: Chest 4 + Triceps 4 = 8
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon),
        ...findExercises(["tricep", "arm"], 4, usedMon),
      ],
      isRestDay: false,
    });

    // Tue: Back 4 + Biceps 4 = 8
    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue),
        ...findExercises(["bicep", "arm"], 4, usedTue),
      ],
      isRestDay: false,
    });

    // Wed: Legs 3 + Shoulders 3 + Abs 3 = 9
    const usedWed = new Set<string>();
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedWed),
        ...findExercises(["shoulder", "deltoid"], 3, usedWed),
        ...findExercises(["ab", "core"], 3, usedWed),
      ],
      isRestDay: false,
    });

    // Thu: Arms (Triceps 3 + Biceps 3 + Forearms 3) = 9
    const usedThu = new Set<string>();
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: "Arms Specialization",
      muscleGroups: ["Triceps", "Biceps", "Forearms"],
      exercises: [
        ...findExercises(["tricep"], 3, usedThu),
        ...findExercises(["bicep"], 3, usedThu),
        ...findExercises(["arm", "forearm", "wrist"], 3, usedThu),
      ],
      isRestDay: false,
    });

    // Fri: Complete Body Conditioning = 8
    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Complete Body Conditioning",
      muscleGroups: ["Chest", "Back", "Core", "Full Body"],
      exercises: [
        ...findExercises(["push", "chest"], 2, usedFri),
        ...findExercises(["pull", "back"], 2, usedFri),
        ...findExercises(["dip", "tricep", "arm"], 2, usedFri),
        ...findExercises(["core", "ab", "plank"], 2, usedFri),
      ],
      isRestDay: false,
    });

    // Sat & Sun: Rest
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
    splitTitle = "4-Day Hypertrophy & Power Split";
    const usedMon = new Set<string>();

    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon),
        ...findExercises(["tricep", "arm"], 4, usedMon),
      ],
      isRestDay: false,
    });

    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: "Back + Biceps",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue),
        ...findExercises(["bicep", "arm"], 4, usedTue),
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
        ...findExercises(["leg", "quad", "hamstring"], 3, usedThu),
        ...findExercises(["shoulder", "deltoid"], 3, usedThu),
        ...findExercises(["ab", "core"], 3, usedThu),
      ],
      isRestDay: false,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: "Arms + Core",
      muscleGroups: ["Triceps", "Biceps", "Abs"],
      exercises: [
        ...findExercises(["tricep"], 3, usedFri),
        ...findExercises(["bicep"], 3, usedFri),
        ...findExercises(["ab", "core"], 3, usedFri),
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
    splitTitle = "3-Day Full Body Strength & Foundation Split";

    const usedMon = new Set<string>();
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: "Chest + Triceps",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon),
        ...findExercises(["tricep", "arm"], 4, usedMon),
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
      title: "Back + Biceps",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedWed),
        ...findExercises(["bicep", "arm"], 4, usedWed),
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
        ...findExercises(["leg", "quad", "hamstring"], 3, usedFri),
        ...findExercises(["shoulder", "deltoid"], 3, usedFri),
        ...findExercises(["ab", "core"], 3, usedFri),
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

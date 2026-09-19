import {
  FoodPreference,
  DietGoal,
  DietBudgetPeriod,
  GeneratedDietPlan,
  DietDayPlan,
  DietMealItem,
} from "@/types";

interface Biometrics {
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  workoutDays?: number;
}

interface MealOption {
  name: string;
  items: string[];
  quantity: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  costInr: number;
  tags: ("VEG" | "EGG" | "NON_VEG")[];
}

const BREAKFAST_OPTIONS: MealOption[] = [
  {
    name: "Classic Anabolic Oats & Peanut Butter",
    items: ["Rolled Oats (60g)", "Skimmed Milk (250ml)", "Peanut Butter (1 tbsp)", "Banana (1)"],
    quantity: "1 Large Bowl",
    calories: 480,
    proteinGrams: 22,
    carbsGrams: 68,
    fatsGrams: 14,
    costInr: 35,
    tags: ["VEG"],
  },
  {
    name: "High Protein Boiled Eggs & Whole Wheat Toast",
    items: ["Boiled Whole Eggs (2)", "Egg Whites (2)", "Whole Wheat Bread (2 Slices)", "Green Chutney"],
    quantity: "4 Eggs + 2 Toast",
    calories: 420,
    proteinGrams: 30,
    carbsGrams: 32,
    fatsGrams: 16,
    costInr: 32,
    tags: ["EGG"],
  },
  {
    name: "Paneer & Vegetable Stuffed Paratha",
    items: ["Grating Fresh Paneer (80g)", "Whole Wheat Paratha (2)", "Fresh Curd (100g)"],
    quantity: "2 Parathas + Curd",
    calories: 520,
    proteinGrams: 24,
    carbsGrams: 58,
    fatsGrams: 20,
    costInr: 45,
    tags: ["VEG"],
  },
  {
    name: "South Indian Idli & Sambhar Protein Bowl",
    items: ["Steamed Idli (3)", "Protein Sambhar (1 Bowl)", "Sprouted Moong Salad (50g)"],
    quantity: "3 Idlis + Sprouts",
    calories: 410,
    proteinGrams: 18,
    carbsGrams: 72,
    fatsGrams: 6,
    costInr: 30,
    tags: ["VEG"],
  },
];

const MID_MORNING_OPTIONS: MealOption[] = [
  {
    name: "Roasted Chana & Fresh Fruit",
    items: ["Roasted Black Chana (50g)", "Apple or Guava (1)"],
    quantity: "1 Bowl + 1 Fruit",
    calories: 220,
    proteinGrams: 11,
    carbsGrams: 38,
    fatsGrams: 3,
    costInr: 18,
    tags: ["VEG"],
  },
  {
    name: "Egg White Bhurji Snack",
    items: ["Egg Whites (3)", "Onions & Tomatoes", "Brown Toast (1)"],
    quantity: "3 Egg Whites",
    calories: 180,
    proteinGrams: 20,
    carbsGrams: 15,
    fatsGrams: 2,
    costInr: 22,
    tags: ["EGG"],
  },
  {
    name: "Greek Yogurt & Almond Bowl",
    items: ["Fresh Curd / Greek Yogurt (150g)", "Soaked Almonds (8)", "Honey (1 tsp)"],
    quantity: "1 Bowl",
    calories: 210,
    proteinGrams: 14,
    carbsGrams: 22,
    fatsGrams: 8,
    costInr: 30,
    tags: ["VEG"],
  },
];

const LUNCH_OPTIONS: MealOption[] = [
  {
    name: "Grilled Chicken Breast & Basmati Rice",
    items: ["Skinless Grilled Chicken Breast (160g)", "Steamed Basmati Rice (150g)", "Dal Tadka (1 Bowl)", "Green Salad"],
    quantity: "Full Plate Meal",
    calories: 650,
    proteinGrams: 48,
    carbsGrams: 70,
    fatsGrams: 12,
    costInr: 65,
    tags: ["NON_VEG"],
  },
  {
    name: "Protein Rich Soya Chunk & Rice Bowl",
    items: ["Nutri Soya Chunks (60g)", "Jeera Rice (150g)", "Panchratan Dal (1 Bowl)", "Cucumber Salad"],
    quantity: "Full Plate Meal",
    calories: 610,
    proteinGrams: 42,
    carbsGrams: 82,
    fatsGrams: 9,
    costInr: 35,
    tags: ["VEG"],
  },
  {
    name: "Egg Curry & Chapati Meal",
    items: ["Boiled Egg Curry (3 Eggs)", "Whole Wheat Chapati (3)", "Mixed Veg Salad"],
    quantity: "3 Eggs + 3 Roti",
    calories: 590,
    proteinGrams: 32,
    carbsGrams: 64,
    fatsGrams: 18,
    costInr: 40,
    tags: ["EGG"],
  },
  {
    name: "Desi Paneer Bhurji & Multigrain Roti",
    items: ["Low-fat Paneer (120g)", "Multigrain Roti (3)", "Yellow Arhar Dal (1 Bowl)", "Curd (100g)"],
    quantity: "Full Plate Meal",
    calories: 680,
    proteinGrams: 36,
    carbsGrams: 68,
    fatsGrams: 22,
    costInr: 60,
    tags: ["VEG"],
  },
];

const EVENING_SNACK_OPTIONS: MealOption[] = [
  {
    name: "Sprouted Moong & Peanut Chaat",
    items: ["Steamed Sprouted Moong (80g)", "Roasted Peanuts (25g)", "Lemon & Chaat Masala"],
    quantity: "1 Large Bowl",
    calories: 260,
    proteinGrams: 15,
    carbsGrams: 32,
    fatsGrams: 9,
    costInr: 20,
    tags: ["VEG"],
  },
  {
    name: "Whey Protein Shake / Buttermilk Bowl",
    items: ["Whey Protein Isolate (1 Scoop) OR Masala Chaas (300ml)", "Banana (1)"],
    quantity: "1 Shake + Fruit",
    calories: 240,
    proteinGrams: 26,
    carbsGrams: 28,
    fatsGrams: 3,
    costInr: 45,
    tags: ["VEG"],
  },
  {
    name: "Omelette Roll",
    items: ["Whole Eggs (2)", "Roti (1)", "Sliced Capsicum & Onion"],
    quantity: "1 Roll",
    calories: 310,
    proteinGrams: 18,
    carbsGrams: 28,
    fatsGrams: 12,
    costInr: 25,
    tags: ["EGG"],
  },
];

const DINNER_OPTIONS: MealOption[] = [
  {
    name: "Steamed Fish Curry & Brown Rice / Roti",
    items: ["White Fish / Rohu Fillet (160g)", "Steamed Rice or 2 Roti", "Sautéed Vegetables"],
    quantity: "Full Dinner Plate",
    calories: 520,
    proteinGrams: 42,
    carbsGrams: 52,
    fatsGrams: 10,
    costInr: 70,
    tags: ["NON_VEG"],
  },
  {
    name: "High Protein Rajma & Brown Rice",
    items: ["Slow Cooked Rajma (1.5 Bowls)", "Brown Rice (140g)", "Mix Green Salad"],
    quantity: "1 Plate",
    calories: 550,
    proteinGrams: 26,
    carbsGrams: 88,
    fatsGrams: 8,
    costInr: 32,
    tags: ["VEG"],
  },
  {
    name: "Tofu / Paneer Tikka & Roti",
    items: ["Grilled Tofu or Paneer (130g)", "Whole Wheat Roti (2)", "Steamed Broccoli & Carrot"],
    quantity: "Full Plate Meal",
    calories: 540,
    proteinGrams: 32,
    carbsGrams: 48,
    fatsGrams: 18,
    costInr: 55,
    tags: ["VEG"],
  },
  {
    name: "Chicken Soup & Boiled Egg Plate",
    items: ["Clear Chicken Soup with Veggies (350ml)", "Boiled Eggs (2)", "Toast (1 Slice)"],
    quantity: "Bowl + Toast",
    calories: 460,
    proteinGrams: 38,
    carbsGrams: 26,
    fatsGrams: 14,
    costInr: 50,
    tags: ["NON_VEG"],
  },
];

const POST_WORKOUT_OPTIONS: MealOption[] = [
  {
    name: "Post-Workout Whey & Banana Shake",
    items: ["Whey Protein (1 Scoop)", "Skimmed Milk (250ml)", "Banana (1 Large)", "Honey (1 tsp)"],
    quantity: "1 Shaker Bottle (400ml)",
    calories: 320,
    proteinGrams: 30,
    carbsGrams: 42,
    fatsGrams: 4,
    costInr: 50,
    tags: ["VEG"],
  },
  {
    name: "Post-Workout Egg Whites & Fruit Bowl",
    items: ["Boiled Egg Whites (4)", "Fresh Papaya or Watermelon (150g)"],
    quantity: "4 Egg Whites + Fruit",
    calories: 220,
    proteinGrams: 24,
    carbsGrams: 22,
    fatsGrams: 1,
    costInr: 30,
    tags: ["EGG"],
  },
  {
    name: "Post-Workout Paneer / Tofu & Sprouts Bowl",
    items: ["Low-fat Paneer / Tofu (100g)", "Steamed Moong Sprouts (80g)", "Lemon Juice"],
    quantity: "1 Bowl",
    calories: 280,
    proteinGrams: 22,
    carbsGrams: 26,
    fatsGrams: 10,
    costInr: 40,
    tags: ["VEG"],
  },
];

function filterOptions(options: MealOption[], pref: FoodPreference | string): MealOption[] {
  const norm = (pref || "").toString().toLowerCase().trim();

  let allowed: MealOption[] = [];

  if (norm === "vegetarian" || norm === "veg") {
    allowed = options.filter((opt) => opt.tags.includes("VEG"));
  } else if (norm === "vegetarian + eggs" || norm.includes("egg") || norm === "eggetarian") {
    allowed = options.filter((opt) => opt.tags.includes("VEG") || opt.tags.includes("EGG"));
  } else {
    // Non-Vegetarian accepts all options
    allowed = options;
  }

  if (allowed.length > 0) {
    return allowed;
  }

  // Safe fallback if allowed is empty
  const vegFallback = options.filter((opt) => opt.tags.includes("VEG"));
  return vegFallback.length > 0 ? vegFallback : options;
}

function selectMeal(
  options: MealOption[],
  pref: FoodPreference | string,
  dayIndex: number
): MealOption {
  const allowed = filterOptions(options, pref);
  if (allowed.length === 0) return options[0];
  return allowed[dayIndex % allowed.length];
}

export function generateDietPlan(
  biometrics: Biometrics,
  foodPreference: FoodPreference,
  dietGoal: DietGoal,
  dietBudget: number,
  dietBudgetPeriod: DietBudgetPeriod
): GeneratedDietPlan {
  const age = biometrics.age && biometrics.age > 0 ? biometrics.age : 25;
  const heightCm = biometrics.heightCm && biometrics.heightCm > 0 ? biometrics.heightCm : 175;
  const weightKg = biometrics.weightKg && biometrics.weightKg > 0 ? biometrics.weightKg : 70;
  const gender = (biometrics.gender || "Male").toLowerCase();
  const workoutDays = biometrics.workoutDays || 4;

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender.startsWith("f") ? bmr - 161 : bmr + 5;

  // 2. Activity Multiplier
  let activityMult = 1.4;
  if (workoutDays >= 6) activityMult = 1.65;
  else if (workoutDays === 5) activityMult = 1.55;
  else if (workoutDays === 4) activityMult = 1.45;
  else activityMult = 1.35;

  const tdee = Math.round(bmr * activityMult);

  // 3. Goal Calorie Adjustment
  let dailyCalorieTarget = tdee;
  if (dietGoal === "Weight Loss" || dietGoal === "Fat Loss") {
    dailyCalorieTarget = Math.round(tdee - 450);
  } else if (dietGoal === "Weight Gain" || dietGoal === "Muscle Gain") {
    dailyCalorieTarget = Math.round(tdee + 400);
  }

  // 4. Macro Calculation
  const dailyProteinTarget = Math.round(weightKg * 1.8); // 1.8g per kg
  const dailyFatsTarget = Math.round((dailyCalorieTarget * 0.25) / 9);
  const dailyCarbsTarget = Math.round((dailyCalorieTarget - dailyProteinTarget * 4 - dailyFatsTarget * 9) / 4);

  // 5. Budget Calculation (Monthly vs Weekly)
  const monthlyBudget = dietBudgetPeriod === "WEEKLY" ? dietBudget * 4.33 : dietBudget;
  const targetDailyBudget = Math.max(100, Math.round(monthlyBudget / 30));

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeklyPlan: DietDayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const bf = selectMeal(BREAKFAST_OPTIONS, foodPreference, i);
    const mm = selectMeal(MID_MORNING_OPTIONS, foodPreference, i);
    const lu = selectMeal(LUNCH_OPTIONS, foodPreference, i);
    const es = selectMeal(EVENING_SNACK_OPTIONS, foodPreference, i);
    const dn = selectMeal(DINNER_OPTIONS, foodPreference, i);
    const pw = selectMeal(POST_WORKOUT_OPTIONS, foodPreference, i);

    const unscaledMeals = [
      { mealType: "Breakfast" as const, option: bf },
      { mealType: "Mid-Morning Snack" as const, option: mm },
      { mealType: "Lunch" as const, option: lu },
      { mealType: "Evening Snack" as const, option: es },
      { mealType: "Dinner" as const, option: dn },
      { mealType: "Post-Workout Meal/Snack" as const, option: pw },
    ];

    const unscaledTotalCals = unscaledMeals.reduce((sum, m) => sum + m.option.calories, 0);
    const scaleFactor = Math.min(Math.max(dailyCalorieTarget / unscaledTotalCals, 0.7), 1.6);

    const meals: DietMealItem[] = unscaledMeals.map(({ mealType, option }) => {
      const scaledCals = Math.round(option.calories * scaleFactor);
      const scaledProt = Math.round(option.proteinGrams * scaleFactor);
      const scaledCarbs = Math.round(option.carbsGrams * scaleFactor);
      const scaledFats = Math.round(option.fatsGrams * scaleFactor);
      const scaledCost = Math.round(option.costInr * scaleFactor);

      // Scale item portions text if numeric values present
      const scaledItems = option.items.map((item) => {
        return item.replace(/(\d+)\s*(g|ml|tbsp|tsp|Slices|Eggs?)/gi, (_, numStr, unit) => {
          const num = parseInt(numStr, 10);
          const scaledNum = Math.round(num * scaleFactor);
          return `${scaledNum}${unit}`;
        });
      });

      return {
        mealType: mealType as any,
        name: option.name,
        items: scaledItems,
        quantity: `${option.quantity} (Scaled ${Math.round(scaleFactor * 100)}%)`,
        calories: scaledCals,
        proteinGrams: scaledProt,
        carbsGrams: scaledCarbs,
        fatsGrams: scaledFats,
        approxCostInr: scaledCost,
      };
    });

    const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProt = meals.reduce((sum, m) => sum + m.proteinGrams, 0);
    const totalCost = meals.reduce((sum, m) => sum + m.approxCostInr, 0);

    weeklyPlan.push({
      dayName: dayNames[i],
      dayNumber: i + 1,
      meals,
      totalCalories: totalCals,
      totalProtein: totalProt,
      totalCostInr: totalCost,
    });
  }

  // Generate 30-day monthly rotation plan
  const monthlyPlan: DietDayPlan[] = [];
  for (let d = 0; d < 30; d++) {
    const dayRef = weeklyPlan[d % 7];
    monthlyPlan.push({
      ...dayRef,
      dayName: `Day ${d + 1} (${dayNames[d % 7]})`,
      dayNumber: d + 1,
    });
  }

  const weeklyEstimatedCost = weeklyPlan.reduce((sum, d) => sum + d.totalCostInr, 0);
  const monthlyEstimatedCost = Math.round(weeklyEstimatedCost * 4.33);

  return {
    id: `dp-${Date.now()}`,
    userId: "",
    foodPreference,
    dietGoal,
    dietBudget,
    dietBudgetPeriod,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    weeklyEstimatedCost,
    monthlyEstimatedCost,
    weeklyPlan,
    monthlyPlan,
    generatedAt: new Date().toISOString(),
  };
}


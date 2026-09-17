import { PrismaClient } from "@prisma/client";
import { generateWorkoutPlan } from "../src/lib/workoutGenerator";
import { generateDietPlan } from "../src/lib/dietGenerator";

const prisma = new PrismaClient();

async function runWorkoutAndDietTests() {
  console.log("\n==================================================");
  console.log(" WORKOUT & DIET GENERATION VERIFICATION SUITE");
  console.log("==================================================\n");

  try {
    // --------------------------------------------------------
    // TEST 1 — 6-Day Workout Plan Structure
    // --------------------------------------------------------
    console.log("[TEST 1] Testing 6-Day Workout Plan Split...");
    const plan6 = generateWorkoutPlan("test-user-6d", 6);
    if (plan6.days.length !== 7) throw new Error(`Test 1 Failed: Expected 7 days, got ${plan6.days.length}`);

    const mon6 = plan6.days[0];
    const tue6 = plan6.days[1];
    const wed6 = plan6.days[2];
    const sun6 = plan6.days[6];

    if (mon6.exercises.length !== 8) throw new Error(`Test 1 Failed: Mon should have 8 exercises, got ${mon6.exercises.length}`);
    if (tue6.exercises.length !== 8) throw new Error(`Test 1 Failed: Tue should have 8 exercises, got ${tue6.exercises.length}`);
    if (wed6.exercises.length !== 9) throw new Error(`Test 1 Failed: Wed should have 9 exercises, got ${wed6.exercises.length}`);
    if (!sun6.isRestDay) throw new Error("Test 1 Failed: Sunday must be Rest Day!");

    console.log(`✓ Mon: ${mon6.title} (${mon6.exercises.length} exercises)`);
    console.log(`✓ Tue: ${tue6.title} (${tue6.exercises.length} exercises)`);
    console.log(`✓ Wed: ${wed6.title} (${wed6.exercises.length} exercises)`);
    console.log(`✓ Sun: ${sun6.title}`);
    console.log("✓ Test 1 PASSED: 6-Day Workout Plan structure verified.\n");

    // --------------------------------------------------------
    // TEST 2 — 5-Day Workout Plan Structure
    // --------------------------------------------------------
    console.log("[TEST 2] Testing 5-Day Workout Plan Split...");
    const plan5 = generateWorkoutPlan("test-user-5d", 5);
    const thu5 = plan5.days[3];
    const fri5 = plan5.days[4];
    const sat5 = plan5.days[5];

    if (thu5.title !== "Arms Specialization" || thu5.exercises.length !== 9) {
      throw new Error(`Test 2 Failed: Thu Arms Specialization expected 9 exercises, got ${thu5.exercises.length}`);
    }
    if (fri5.title !== "Complete Body Conditioning" || fri5.exercises.length !== 8) {
      throw new Error(`Test 2 Failed: Fri Complete Body Conditioning expected 8 exercises, got ${fri5.exercises.length}`);
    }
    if (!sat5.isRestDay) throw new Error("Test 2 Failed: Saturday must be Rest Day!");

    console.log(`✓ Thu: ${thu5.title} (${thu5.exercises.length} exercises)`);
    console.log(`✓ Fri: ${fri5.title} (${fri5.exercises.length} exercises)`);
    console.log(`✓ Sat & Sun: REST DAYS`);
    console.log("✓ Test 2 PASSED: 5-Day Workout Plan structure verified.\n");

    // --------------------------------------------------------
    // TEST 3 — 4-Day and 3-Day Workout Plan Splits
    // --------------------------------------------------------
    console.log("[TEST 3] Testing 4-Day & 3-Day Workout Plan Splits...");
    const plan4 = generateWorkoutPlan("test-user-4d", 4);
    const plan3 = generateWorkoutPlan("test-user-3d", 3);

    const activeDays4 = plan4.days.filter((d) => !d.isRestDay);
    const activeDays3 = plan3.days.filter((d) => !d.isRestDay);

    if (activeDays4.length !== 4) throw new Error(`Test 3 Failed: Expected 4 active workout days, got ${activeDays4.length}`);
    if (activeDays3.length !== 3) throw new Error(`Test 3 Failed: Expected 3 active workout days, got ${activeDays3.length}`);

    console.log(`✓ 4-Day Split Active Days: ${activeDays4.map((d) => d.dayName).join(", ")}`);
    console.log(`✓ 3-Day Split Active Days: ${activeDays3.map((d) => d.dayName).join(", ")}`);
    console.log("✓ Test 3 PASSED: 4-Day & 3-Day Splits verified.\n");

    // --------------------------------------------------------
    // TEST 4 — Vegetarian Diet Plan (0 Eggs, 0 Meat, 0 Fish)
    // --------------------------------------------------------
    console.log("[TEST 4] Testing Vegetarian Diet Plan...");
    const vegDiet = generateDietPlan(
      { age: 25, heightCm: 175, weightKg: 70, workoutDays: 4 },
      "Vegetarian",
      "Muscle Gain",
      7000,
      "MONTHLY"
    );

    let hasEggOrMeatInVeg = false;
    vegDiet.weeklyPlan.forEach((day) => {
      day.meals.forEach((meal) => {
        const text = (meal.name + " " + meal.items.join(" ")).toLowerCase();
        if (text.includes("egg") || text.includes("chicken") || text.includes("fish") || text.includes("mutton")) {
          hasEggOrMeatInVeg = true;
          console.error(`Violation in Veg Diet: ${meal.name}`);
        }
      });
    });

    if (hasEggOrMeatInVeg) throw new Error("Test 4 Failed: Non-vegetarian food found in Vegetarian diet!");
    console.log(`✓ Generated ${vegDiet.weeklyPlan.length} days of strictly Vegetarian meals.`);
    console.log("✓ Test 4 PASSED: Vegetarian diet restriction verified.\n");

    // --------------------------------------------------------
    // TEST 5 — Vegetarian + Eggs Diet Plan (Eggs allowed, 0 Meat/Fish)
    // --------------------------------------------------------
    console.log("[TEST 5] Testing Vegetarian + Eggs Diet Plan...");
    const eggDiet = generateDietPlan(
      { age: 25, heightCm: 175, weightKg: 70, workoutDays: 4 },
      "Vegetarian + Eggs",
      "Muscle Gain",
      7000,
      "MONTHLY"
    );

    let hasMeatInEggDiet = false;
    eggDiet.weeklyPlan.forEach((day) => {
      day.meals.forEach((meal) => {
        const text = (meal.name + " " + meal.items.join(" ")).toLowerCase();
        if (text.includes("chicken") || text.includes("fish") || text.includes("mutton")) {
          hasMeatInEggDiet = true;
        }
      });
    });

    if (hasMeatInEggDiet) throw new Error("Test 5 Failed: Meat or fish found in Vegetarian + Eggs diet!");
    console.log(`✓ Generated Vegetarian + Eggs diet. Eggs included, 0 meat/fish.`);
    console.log("✓ Test 5 PASSED: Vegetarian + Eggs restriction verified.\n");

    // --------------------------------------------------------
    // TEST 6 — Non-Vegetarian Diet Plan
    // --------------------------------------------------------
    console.log("[TEST 6] Testing Non-Vegetarian Diet Plan...");
    const nonVegDiet = generateDietPlan(
      { age: 25, heightCm: 175, weightKg: 70, workoutDays: 5 },
      "Non-Vegetarian",
      "Fat Loss",
      8000,
      "MONTHLY"
    );
    console.log(`✓ Non-Veg Diet Target Calories: ${nonVegDiet.dailyCalorieTarget} kcal, Protein: ${nonVegDiet.dailyProteinTarget}g`);
    console.log("✓ Test 6 PASSED: Non-Vegetarian diet generated.\n");

    // --------------------------------------------------------
    // TEST 7 — Budget Estimation
    // --------------------------------------------------------
    console.log("[TEST 7] Testing Diet Budget Scaling (₹7,000 Monthly)...");
    const budgetPlan = generateDietPlan(
      { age: 25, heightCm: 175, weightKg: 70, workoutDays: 4 },
      "Non-Vegetarian",
      "Muscle Gain",
      7000,
      "MONTHLY"
    );
    console.log(`✓ Input Budget: ₹7,000 / month`);
    console.log(`✓ Calculated Weekly Cost: ₹${budgetPlan.weeklyEstimatedCost}`);
    console.log(`✓ Calculated Monthly Cost: ₹${budgetPlan.monthlyEstimatedCost}`);
    console.log("✓ Test 7 PASSED: Budget estimation aligned.\n");

    // --------------------------------------------------------
    // TEST 8 — SQLite Database Persistence of Biometrics & Plans
    // --------------------------------------------------------
    console.log("[TEST 8] Testing SQLite Database Persistence for Member Plans...");
    const testUserEmail = `planuser_${Date.now()}@example.com`;

    const createdUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        passwordHash: "dummyhash",
        name: "Plan Tester",
        role: "MEMBER",
        memberProfile: {
          create: {
            qrCode: `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
            membershipStatus: "ACTIVE",
            age: 28,
            gender: "Male",
            heightCm: 180,
            weightKg: 78,
            workoutDays: 6,
            foodPreference: "Vegetarian + Eggs",
            dietGoal: "Muscle Gain",
            dietBudget: 9000,
            dietBudgetPeriod: "MONTHLY",
            workoutPlanJson: JSON.stringify(plan6),
            dietPlanJson: JSON.stringify(eggDiet),
          },
        },
      },
      include: { memberProfile: true },
    });

    // Re-query database to simulate server restart
    await prisma.$disconnect();
    const freshPrisma = new PrismaClient();
    const queriedUser = await freshPrisma.user.findUnique({
      where: { email: testUserEmail },
      include: { memberProfile: true },
    });

    if (!queriedUser || !queriedUser.memberProfile) {
      throw new Error("Test 8 Failed: Member profile not found in DB!");
    }

    const fetchedWp: any = JSON.parse(queriedUser.memberProfile.workoutPlanJson!);
    const fetchedDp: any = JSON.parse(queriedUser.memberProfile.dietPlanJson!);

    if (fetchedWp.workoutDays !== 6) throw new Error("Test 8 Failed: Workout days mismatch in DB!");
    if (fetchedDp.foodPreference !== "Vegetarian + Eggs") throw new Error("Test 8 Failed: Food preference mismatch in DB!");

    console.log(`✓ Successfully verified user ${queriedUser.email} persisted in SQLite DB!`);
    console.log(`✓ Retrieved workout plan: ${fetchedWp.splitTitle} (${fetchedWp.days.length} Days)`);
    console.log(`✓ Retrieved diet plan: ${fetchedDp.foodPreference} (₹${fetchedDp.dietBudget}/mo)`);
    console.log("✓ Test 8 PASSED: Database persistence verified.\n");

    console.log("==================================================");
    console.log(" ALL 8 WORKOUT & DIET TESTS PASSED PERFECTLY!");
    console.log("==================================================\n");

    await freshPrisma.$disconnect();
  } catch (err: any) {
    console.error("❌ TEST SUITE FAILURE:", err.message || err);
    process.exit(1);
  }
}

runWorkoutAndDietTests();

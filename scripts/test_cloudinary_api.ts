import { getAllExercises, getExercisesByCategory, getExerciseById } from "../src/lib/cloudinaryService";

async function runCloudinaryApiTests() {
  console.log("==================================================");
  console.log("RUNNING CLOUDINARY EXERCISE API INTEGRATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   -> ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   -> ${detail}`);
      failed++;
    }
  }

  // 1. Test GET /api/exercises (All Categories)
  try {
    const allData = await getAllExercises();
    assert(
      Array.isArray(allData.categories) && allData.categories.length > 0,
      "GET /api/exercises returns categories array",
      `Total categories returned: ${allData.categories.length}`
    );

    const shouldersCat = allData.categories.find((c) => c.name === "shoulders");
    assert(
      Boolean(shouldersCat && shouldersCat.exercises.length > 0),
      "All exercises includes 'shoulders' category with exercises",
      `Shoulders exercise count: ${shouldersCat?.count}`
    );
  } catch (err: any) {
    assert(false, "GET /api/exercises failed", err.message);
  }

  // 2. Test Category Endpoints
  const categoriesToTest = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "core",
    "quads",
    "hamstrings",
    "calves",
    "hips",
    "full-body",
  ];

  for (const cat of categoriesToTest) {
    try {
      const res = await getExercisesByCategory(cat, 1, 20);
      const hasHttpsUrls = res.exercises.every(
        (ex) => ex.imageUrl.startsWith("https://") && ex.imageUrl.includes("cloudinary.com")
      );
      assert(
        res.category === cat && res.exercises.length > 0 && hasHttpsUrls,
        `GET /api/exercises/${cat}`,
        `Returned ${res.count} exercises. Sample image URL: ${res.exercises[0]?.imageUrl}`
      );
    } catch (err: any) {
      assert(false, `GET /api/exercises/${cat} failed`, err.message);
    }
  }

  // 3. Test Pagination (?page=1&limit=2)
  try {
    const pageRes = await getExercisesByCategory("shoulders", 1, 2);
    assert(
      pageRes.exercises.length === 2 && pageRes.pagination.limit === 2 && pageRes.pagination.page === 1,
      "Pagination parameter ?page=1&limit=2 works correctly",
      `Limit requested: 2, Limit returned: ${pageRes.exercises.length}, Total: ${pageRes.pagination.total}`
    );
  } catch (err: any) {
    assert(false, "Pagination test failed", err.message);
  }

  // 4. Test Individual Exercise Endpoint GET /api/exercises/shoulders/:exerciseId
  try {
    const singleEx = await getExerciseById("shoulders", "ex-s1");
    assert(
      Boolean(singleEx && singleEx.name.includes("Overhead Barbell Press")),
      "GET /api/exercises/shoulders/ex-s1 returns specific exercise",
      `Exercise Name: ${singleEx?.name}, Public ID: ${singleEx?.publicId}`
    );
  } catch (err: any) {
    assert(false, "Individual exercise test failed", err.message);
  }

  // 5. Test Invalid Category Error Handling
  try {
    await getExercisesByCategory("invalid-category-name");
    assert(false, "Invalid category should throw error");
  } catch (err: any) {
    assert(
      err.message.includes("Invalid exercise category"),
      "Invalid category returns proper error response",
      `Error caught: ${err.message}`
    );
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCloudinaryApiTests();

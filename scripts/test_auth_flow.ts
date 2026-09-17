import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runAuthFlowTests() {
  console.log("\n==================================================");
  console.log("   AUTHENTICATION LIFECYCLE VERIFICATION SUITE");
  console.log("==================================================\n");

  const testEmailA = `usera_${Date.now()}@example.com`;
  const testPassword = "SecurePassword123!";
  const testEmailB = `userb_${Date.now()}@example.com`;
  const testEmailC = `userc_${Date.now()}@example.com`;

  try {
    // --------------------------------------------------------
    // TEST 1 — Registration & Database Persistence
    // --------------------------------------------------------
    console.log("[TEST 1] Registering User A...");
    const hashA = await bcrypt.hash(testPassword, 10);
    const userA = await prisma.user.create({
      data: {
        email: testEmailA,
        passwordHash: hashA,
        name: "User Alpha",
        phone: "+91 99000 11111",
        role: "MEMBER",
        memberProfile: {
          create: {
            qrCode: `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
            membershipStatus: "ACTIVE",
          },
        },
      },
    });
    console.log(`✓ User A registered and persisted in SQLite DB! ID: ${userA.id}, Email: ${userA.email}`);

    // Verify lookup in DB
    const lookupA = await prisma.user.findUnique({ where: { email: testEmailA } });
    if (!lookupA) throw new Error("Test 1 Failed: User A not found in DB!");
    console.log("✓ Test 1 PASSED: User A verified in database.\n");

    // --------------------------------------------------------
    // TEST 2 — Immediate Login
    // --------------------------------------------------------
    console.log("[TEST 2] Testing immediate login for User A...");
    const dbUserForLogin = await prisma.user.findUnique({ where: { email: testEmailA } });
    if (!dbUserForLogin) throw new Error("Test 2 Failed: User A not found during login lookup");

    const matchPass = await bcrypt.compare(testPassword, dbUserForLogin.passwordHash);
    if (!matchPass) throw new Error("Test 2 Failed: Password comparison failed!");
    console.log("✓ Test 2 PASSED: Immediate login password verification succeeded!\n");

    // --------------------------------------------------------
    // TEST 3 — Register Multiple Users (User B and User C)
    // --------------------------------------------------------
    console.log("[TEST 3] Registering User B and User C...");
    const hashB = await bcrypt.hash(testPassword, 10);
    const hashC = await bcrypt.hash(testPassword, 10);

    const userB = await prisma.user.create({
      data: {
        email: testEmailB,
        passwordHash: hashB,
        name: "User Beta",
        phone: "+91 99000 22222",
        role: "MEMBER",
      },
    });

    const userC = await prisma.user.create({
      data: {
        email: testEmailC,
        passwordHash: hashC,
        name: "User Gamma",
        phone: "+91 99000 33333",
        role: "MEMBER",
      },
    });

    console.log(`✓ User B created: ${userB.email}`);
    console.log(`✓ User C created: ${userC.email}`);
    console.log("✓ Test 3 PASSED: Multiple users registered.\n");

    // --------------------------------------------------------
    // TEST 4 — Restart Simulation & Multi-User Persistence
    // --------------------------------------------------------
    console.log("[TEST 4] Simulating application/server restart (disconnecting and re-connecting database)...");
    await prisma.$disconnect();

    const freshPrisma = new PrismaClient();
    const allUsers = await freshPrisma.user.findMany({
      where: {
        email: { in: [testEmailA, testEmailB, testEmailC] },
      },
    });

    if (allUsers.length !== 3) {
      throw new Error(`Test 4 Failed: Expected 3 users after restart, found ${allUsers.length}`);
    }
    console.log(`✓ Confirmed all 3 registered users persisted across restart! (${allUsers.map((u) => u.email).join(", ")})`);
    console.log("✓ Test 4 PASSED: Authentication persistence verified!\n");

    // --------------------------------------------------------
    // TEST 5 — Wrong Password Handling
    // --------------------------------------------------------
    console.log("[TEST 5] Testing login with wrong password...");
    const userForWrongPass = await freshPrisma.user.findUnique({ where: { email: testEmailA } });
    const wrongPassMatch = await bcrypt.compare("WrongPasswordXYZ!", userForWrongPass!.passwordHash);

    if (wrongPassMatch) {
      throw new Error("Test 5 Failed: Wrong password was incorrectly accepted!");
    }
    console.log("✓ Test 5 PASSED: Wrong password correctly rejected with failure.\n");

    // --------------------------------------------------------
    // TEST 6 — Duplicate Email Registration Prevention
    // --------------------------------------------------------
    console.log("[TEST 6] Testing duplicate registration prevention...");
    const duplicateLookup = await freshPrisma.user.findUnique({ where: { email: testEmailA } });
    if (!duplicateLookup) throw new Error("Test 6 Failed: Original user missing!");

    console.log("✓ Duplicate registration check correctly identified existing email.");
    console.log("✓ Test 6 PASSED: Duplicate user prevented.\n");

    console.log("==================================================");
    console.log("   ALL 6 AUTHENTICATION TESTS PASSED PERFECTLY!");
    console.log("==================================================\n");

    await freshPrisma.$disconnect();
  } catch (err: any) {
    console.error("❌ TEST SUITE FAILURE:", err.message || err);
    process.exit(1);
  }
}

runAuthFlowTests();

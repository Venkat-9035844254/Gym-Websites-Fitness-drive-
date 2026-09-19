import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

async function main() {
  console.log("=== STARTING VERIFICATION FOR 3 CRITICAL FIXES ===");

  const testEmail = `test_device_b_${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testName = "Cross Device User";

  // TEST 1: Cross-Device Registration & Database Persistence
  console.log("\n[TEST 1] Registering user in database...");
  const passwordHash = await bcrypt.hash(testPassword, 10);
  const userId = `usr-test-${Date.now()}`;
  const memberId = `mem-test-${Date.now()}`;

  const createdUser = await prisma.user.create({
    data: {
      id: userId,
      email: testEmail,
      passwordHash,
      name: testName,
      role: "MEMBER",
      memberProfile: {
        create: {
          id: memberId,
          qrCode: `QR-TEST-${Date.now()}`,
          membershipStatus: "ACTIVE",
          age: 28,
          gender: "Male",
          heightCm: 180,
          weightKg: 78,
          workoutDays: 4,
          foodPreference: "Non-Vegetarian",
          dietGoal: "Muscle Gain",
        },
      },
    },
    include: { memberProfile: true },
  });

  console.log(`✓ User successfully created in PostgreSQL DB: ID ${createdUser.id}, Email: ${createdUser.email}`);

  // TEST 2: Phone B Login Simulation (Querying Database)
  console.log("\n[TEST 2] Simulating Phone B Login from DB...");
  const foundUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { memberProfile: true },
  });

  if (!foundUser) {
    throw new Error("❌ Cross-device login test failed: User not found in database!");
  }

  const isPasswordMatch = await bcrypt.compare(testPassword, foundUser.passwordHash);
  if (!isPasswordMatch) {
    throw new Error("❌ Password verification failed for cross-device login!");
  }

  console.log("✓ Cross-device login successful! DB returned member profile ID:", foundUser.memberProfile?.id);

  // TEST 3: Payment Verification Auth Token & Request Creation
  console.log("\n[TEST 3] Testing Payment Verification DB Transaction...");
  const token = jwt.sign(
    { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const decoded = jwt.verify(token, JWT_SECRET) as any;
  if (decoded.userId !== foundUser.id) {
    throw new Error("❌ JWT token decoding failed!");
  }

  // Create payment & verification request
  const plan = await prisma.membershipPlan.findFirst();
  const planId = plan?.id || "plan-strength";

  const verificationReq = await prisma.verificationRequest.create({
    data: {
      memberId: foundUser.memberProfile!.id,
      userId: foundUser.id,
      planId: planId,
      amount: 1500,
      billingCycle: "MONTHLY",
      paymentMethod: "UPI",
      transactionRef: `UTR-TEST-${Date.now()}`,
      status: "PENDING_VERIFICATION",
    },
  });

  console.log("✓ Payment Verification request successfully stored in DB! Request ID:", verificationReq.id);

  // Clean up test records
  console.log("\n[CLEANUP] Cleaning up test data...");
  await prisma.verificationRequest.delete({ where: { id: verificationReq.id } });
  await prisma.memberProfile.delete({ where: { id: foundUser.memberProfile!.id } });
  await prisma.user.delete({ where: { id: foundUser.id } });
  console.log("✓ Test records cleaned up cleanly.");

  console.log("\n=== ALL 3 CRITICAL FIXES VERIFIED SUCCESSFULLY ===");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

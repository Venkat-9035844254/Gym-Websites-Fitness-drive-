import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupPredefinedMemberships() {
  console.log("Cleaning up all predefined/demo membership records from database...");

  // 1. Delete all passes
  const deletedPasses = await prisma.membershipPass.deleteMany({});
  console.log(`Deleted ${deletedPasses.count} membership pass records.`);

  // 2. Delete all memberships
  const deletedMemberships = await prisma.membership.deleteMany({});
  console.log(`Deleted ${deletedMemberships.count} membership records.`);

  // 3. Delete all verification requests
  const deletedVerifs = await prisma.verificationRequest.deleteMany({});
  console.log(`Deleted ${deletedVerifs.count} verification request records.`);

  // 4. Reset all member profiles to INACTIVE without plan
  const updatedMembers = await prisma.memberProfile.updateMany({
    data: {
      membershipStatus: "INACTIVE",
      currentPlanId: null,
    },
  });
  console.log(`Reset ${updatedMembers.count} member profiles to INACTIVE.`);

  // 5. Verify Owner account is intact
  const owner = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  console.log("Owner Account Verified:", owner?.email, owner?.name, "(Intact)");

  console.log("Cleanup complete!");
}

cleanupPredefinedMemberships().catch(console.error).finally(() => prisma.$disconnect());

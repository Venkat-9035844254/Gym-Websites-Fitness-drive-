import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDb() {
  const plans = await prisma.membershipPlan.findMany();
  console.log("=== DB PLANS ===", JSON.stringify(plans, null, 2));

  const memberships = await prisma.membership.findMany();
  console.log("=== DB MEMBERSHIPS ===", JSON.stringify(memberships, null, 2));

  const verificationRequests = await prisma.verificationRequest.findMany();
  console.log("=== DB VERIFICATION REQUESTS ===", JSON.stringify(verificationRequests, null, 2));

  const members = await prisma.memberProfile.findMany({
    select: { id: true, userId: true, membershipStatus: true, currentPlanId: true }
  });
  console.log("=== DB MEMBERS ===", JSON.stringify(members, null, 2));
}

checkDb().finally(() => prisma.$disconnect());

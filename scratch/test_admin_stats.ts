import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testStats() {
  const totalMembers = await prisma.memberProfile.count();
  const activeMembers = await prisma.memberProfile.count({ where: { membershipStatus: "ACTIVE" } });
  const pendingRequests = await prisma.verificationRequest.count({ where: { status: "PENDING_VERIFICATION" } });
  const approvedRequests = await prisma.verificationRequest.findMany({ where: { status: "APPROVED" } });

  const totalRev = approvedRequests.reduce((acc, r) => acc + r.amount, 0);

  console.log("=== DB DYNAMIC STATS VERIFICATION ===");
  console.log("Total Members:", totalMembers);
  console.log("Active Members:", activeMembers);
  console.log("Pending Requests:", pendingRequests);
  console.log("Approved Requests:", approvedRequests.length);
  console.log("Total Verified Revenue (₹):", totalRev);
}

testStats().finally(() => prisma.$disconnect());

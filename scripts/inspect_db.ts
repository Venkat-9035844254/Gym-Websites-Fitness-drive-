import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspect() {
  console.log("==================================================");
  console.log("   PERSISTENT SQLITE DATABASE USER INSPECTOR");
  console.log("==================================================");

  try {
    const users = await prisma.user.findMany({
      include: {
        memberProfile: true,
        trainerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total Persistent Users Found: ${users.length}\n`);

    users.forEach((u, i) => {
      console.log(`User #${i + 1}:`);
      console.log(`  ID:          ${u.id}`);
      console.log(`  Name:        ${u.name}`);
      console.log(`  Email:       ${u.email}`);
      console.log(`  Phone:       ${u.phone || "N/A"}`);
      console.log(`  Role:        ${u.role}`);
      console.log(`  Registered:  ${u.createdAt.toISOString()}`);
      if (u.memberProfile) {
        console.log(`  Member Status: ${u.memberProfile.membershipStatus}`);
        console.log(`  QR Code:       ${u.memberProfile.qrCode}`);
      }
      if (u.trainerProfile) {
        console.log(`  Specialization: ${u.trainerProfile.specialization}`);
      }
      console.log("--------------------------------------------------");
    });
  } catch (err) {
    console.error("Error querying SQLite database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

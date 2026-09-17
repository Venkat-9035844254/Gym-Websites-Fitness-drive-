import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const INITIAL_DEMO_USERS = [
  {
    id: "usr-admin-1",
    email: "chetan@fitnessdrive.com",
    name: "Chetan (Owner)",
    phone: "+91 88800 77188",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "usr-trainer-1",
    email: "venki@fitnessdrive.com",
    name: "Venki",
    phone: "+91 95384 33663",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331349",
  },
  {
    id: "usr-trainer-2",
    email: "gaviprakash@fitnessdrive.com",
    name: "Gavi Prakash",
    phone: "+91 97317 41627",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331756",
  },
  {
    id: "usr-trainer-3",
    email: "harsha@fitnessdrive.com",
    name: "Harsha",
    phone: "+91 80087 62399",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331768",
  },
  {
    id: "usr-trainer-4",
    email: "shivu@fitnessdrive.com",
    name: "Shivu",
    phone: "+91 78468 30687",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331761",
  },
  {
    id: "usr-mem-1",
    email: "rahul@example.com",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    role: "MEMBER",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
  },
];

const INITIAL_MEMBERSHIP_PLANS = [
  {
    id: "plan-strength",
    name: "Strength Training",
    description: "Dedicated strength building, gym workout guidance, and structured exercise guidance.",
    priceMonthly: 800,
    priceSixMonths: 4500,
    priceYearly: 9000,
    features: JSON.stringify([
      "Strength training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ]),
    isPopular: false,
  },
  {
    id: "plan-cardio-strength",
    name: "Cardio + Strength Training",
    description: "Combined cardiovascular endurance training and resistance strength programs.",
    priceMonthly: 1000,
    priceSixMonths: 5600,
    priceYearly: 10000,
    features: JSON.stringify([
      "Cardio training",
      "Strength training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ]),
    isPopular: false,
  },
  {
    id: "plan-cardio-strength-core",
    name: "Cardio + Strength Training + Core",
    description: "Our most comprehensive transformation package including targeted core conditioning.",
    priceMonthly: 1200,
    priceSixMonths: 6500,
    priceYearly: 12000,
    features: JSON.stringify([
      "Cardio training",
      "Strength training",
      "Core training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ]),
    isPopular: true,
    badgeText: "MOST COMPREHENSIVE",
  },
];

async function main() {
  console.log("[SEED] Starting idempotent database seed...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Seed Demo Users
  for (const u of INITIAL_DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const createdUser = await prisma.user.create({
        data: {
          id: u.id,
          email: u.email,
          passwordHash: defaultPasswordHash,
          name: u.name,
          phone: u.phone,
          role: u.role,
          avatar: u.avatar,
          memberProfile: u.role === "MEMBER" ? {
            create: {
              id: `mem-${u.id}`,
              qrCode: `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
              membershipStatus: "ACTIVE",
            }
          } : undefined,
          trainerProfile: u.role === "TRAINER" ? {
            create: {
              id: `trn-${u.id}`,
              specialization: "General Fitness & Bodybuilding",
              experienceYears: 3,
            }
          } : undefined,
        },
      });
      console.log(`[SEED] Created demo user: ${createdUser.email} (${createdUser.role})`);
    }
  }

  // 2. Seed Membership Plans
  for (const plan of INITIAL_MEMBERSHIP_PLANS) {
    await prisma.membershipPlan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features,
        isPopular: plan.isPopular,
        badgeText: plan.badgeText || null,
      },
      create: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        features: plan.features,
        isPopular: plan.isPopular,
        badgeText: plan.badgeText || null,
      },
    });
    console.log(`[SEED] Upserted membership plan: ${plan.name} (₹${plan.priceMonthly}/mo)`);
  }

  const totalUsers = await prisma.user.count();
  const totalPlans = await prisma.membershipPlan.count();
  console.log(`[SEED] Database seed completed successfully. Users: ${totalUsers}, Plans: ${totalPlans}`);
}

main()
  .catch((e) => {
    console.error("[SEED] Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

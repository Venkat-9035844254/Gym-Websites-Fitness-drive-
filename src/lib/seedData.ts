import {
  User,
  MemberProfile,
  TrainerProfile,
  GymBranch,
  MembershipPlan,
  MembershipRecord,
  ClassItem,
  Exercise,
  WorkoutPlan,
  NutritionPlan,
  BlogPost,
  Testimonial,
  Invoice,
  AttendanceRecord,
  Goal,
  ProgressMeasurement,
  Lead,
  Enquiry,
  GymSettings,
  NotificationLog
} from "@/types";
import { EXERCISE_IMAGE_CATALOG } from "./exerciseImageCatalog";

export const INITIAL_SETTINGS: GymSettings = {
  enableExpiryReminders: true,
  reminderDaysBefore: 5,
  channels: {
    inApp: true,
    email: true,
    sms: false,
    whatsApp: false,
  },
  timezone: "Asia/Kolkata",
  gymName: "FITNESS DRIVE",
  ownerName: "Chetan",
  gymEmail: "contact@fitnessdrive.com",
  gymPhone: "+91 88800 77188",
};

export const INITIAL_BRANCHES: GymBranch[] = [
  {
    id: "branch-1",
    name: "FITNESS DRIVE Flagship Arena",
    code: "FD-MAIN",
    address: "108 Elite Towers, Outer Ring Road",
    city: "Bengaluru, KA",
    phone: "+91 88800 77188",
    email: "contact@fitnessdrive.com",
    openingHours: "Mon-Sat: 5:00 AM - 11:00 PM | Sun: 6:00 AM - 9:00 PM",
    capacity: 600,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: "usr-admin-1",
    email: "chetan@fitnessdrive.com",
    name: "Chetan (Owner)",
    phone: "+91 88800 77188",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    branchId: "branch-1",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "usr-trainer-1",
    email: "venki@fitnessdrive.com",
    name: "Venki",
    phone: "+91 95384 33663",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331349",
    branchId: "branch-1",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "usr-trainer-2",
    email: "gaviprakash@fitnessdrive.com",
    name: "Gavi Prakash",
    phone: "+91 97317 41627",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331756",
    branchId: "branch-1",
    createdAt: "2024-02-01T00:00:00.000Z",
  },
  {
    id: "usr-trainer-3",
    email: "harsha@fitnessdrive.com",
    name: "Harsha",
    phone: "+91 80087 62399",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331768",
    branchId: "branch-1",
    createdAt: "2024-02-15T00:00:00.000Z",
  },
  {
    id: "usr-trainer-4",
    email: "shivu@fitnessdrive.com",
    name: "Shivu",
    phone: "+91 78468 30687",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788081026/IMG_20260830_143909.jpg",
    branchId: "branch-1",
    createdAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "usr-trainer-5",
    email: "chetan.trainer@fitnessdrive.com",
    name: "Chetan",
    phone: "+91 88800 77188",
    role: "TRAINER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788166669/file_00000000c5f08211bd6462692b64749a.png",
    branchId: "branch-1",
    createdAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "usr-member-1",
    email: "member.harsha@gmail.com",
    name: "Harsha Vardhan",
    phone: "+91 98888 77777",
    role: "MEMBER",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331768",
    branchId: "branch-1",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
];

function getDateOffset(daysToAdd: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split("T")[0];
}

export const FIVE_DAYS_FROM_TODAY = getDateOffset(5);

export const INITIAL_MEMBERS: MemberProfile[] = [
  {
    id: "mem-1",
    userId: "usr-member-1",
    dateOfBirth: "1997-06-15",
    gender: "Male",
    emergencyContact: "Suresh Vardhan (Father)",
    emergencyPhone: "+91 98888 00000",
    qrCode: "FD-MEM-889410",
    membershipStatus: "INACTIVE",
    assignedTrainerId: "tr-1",
    assignedTrainerName: "Venki",
    joinDate: "2024-03-10",
  },
];

export const INITIAL_MEMBERSHIP_RECORDS: MembershipRecord[] = [];

export const INITIAL_TRAINERS: TrainerProfile[] = [
  {
    id: "tr-5",
    userId: "usr-trainer-5",
    name: "Chetan",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788177446/Screenshot_20260831_172704.jpg",
    phone: "+91 88800 77188",
    bio: "Senior strength & conditioning coach specializing in athletic performance, physique transformation, and core strength.",
    specialization: "Athletic Conditioning & Transformation",
    experienceYears: "4-5",
    rating: 4.98,
    certifications: ["Master Personal Trainer", "Certified Strength Specialist"],
    languages: ["English", "Kannada", "Hindi"],
    isAvailable: true,
  },
  {
    id: "tr-2",
    userId: "usr-trainer-2",
    name: "Gavi Prakash",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331756",
    phone: "+91 97317 41627",
    bio: "Specialist in functional mobility, group fitness circuits, and metabolic conditioning.",
    specialization: "Functional Fitness & HIIT",
    experienceYears: 3,
    rating: 4.95,
    certifications: ["Group Fitness Specialist"],
    languages: ["English", "Kannada", "Hindi"],
    isAvailable: true,
  },
  {
    id: "tr-1",
    userId: "usr-trainer-1",
    name: "Venki",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331349",
    phone: "+91 95384 33663",
    bio: "Certified fitness specialist with dedicated 1-on-1 coaching for strength and fat loss.",
    specialization: "Strength & Conditioning",
    experienceYears: 3,
    rating: 4.9,
    certifications: ["Certified Personal Trainer"],
    languages: ["English", "Kannada", "Hindi"],
    isAvailable: true,
  },
  {
    id: "tr-4",
    userId: "usr-trainer-4",
    name: "Shivu",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788081026/IMG_20260830_143909.jpg",
    phone: "+91 78468 30687",
    bio: "Expert fitness consultant guiding body transformations, core stability, and athletic endurance.",
    specialization: "Body Transformation & Endurance",
    experienceYears: 3,
    rating: 4.92,
    certifications: ["Certified Personal Trainer"],
    languages: ["English", "Kannada"],
    isAvailable: true,
  },
  {
    id: "tr-3",
    userId: "usr-trainer-3",
    name: "Harsha",
    avatar: "https://res.cloudinary.com/crnwvrdz/image/upload/f_auto,q_auto/1000331768",
    phone: "+91 80087 62399",
    bio: "Master strength coach focusing on progressive overload, compound lifts, and hypertrophy.",
    specialization: "Hypertrophy & Powerlifting",
    experienceYears: 3,
    rating: 4.88,
    certifications: ["Master Strength Coach"],
    languages: ["English", "Telugu", "Kannada"],
    isAvailable: true,
  },
];

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: "plan-strength",
    name: "Strength Training",
    description: "Dedicated strength building, gym workout guidance, and structured exercise guidance.",
    priceMonthly: 800,
    priceSixMonths: 4500,
    priceYearly: 9000,
    features: [
      "Strength training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ],
    isPopular: false,
  },
  {
    id: "plan-cardio-strength",
    name: "Cardio + Strength Training",
    description: "Combined cardiovascular endurance training and resistance strength programs.",
    priceMonthly: 1000,
    priceSixMonths: 5600,
    priceYearly: 10000,
    features: [
      "Cardio training",
      "Strength training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ],
    isPopular: false,
  },
  {
    id: "plan-cardio-strength-core",
    name: "Cardio + Strength Training + Core",
    description: "Our most comprehensive transformation package including targeted core conditioning.",
    priceMonthly: 1200,
    priceSixMonths: 6500,
    priceYearly: 12000,
    features: [
      "Cardio training",
      "Strength training",
      "Core training",
      "Gym workout guidance",
      "Exercise guidance",
      "Trainer support",
    ],
    isPopular: true,
    badgeText: "MOST COMPREHENSIVE",
  },
];

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "cls-1",
    name: "Inferno HIIT Ignition",
    description: "High-intensity full body circuit combining kettlebells, plyometrics, and battle ropes.",
    category: "HIIT",
    trainerId: "tr-1",
    trainerName: "Venki",
    trainerAvatar: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80",
    scheduleTime: "2026-08-28T07:00:00.000Z",
    durationMins: 45,
    capacity: 20,
    bookedCount: 0,
    location: "Studio 1 - FITNESS DRIVE Arena",
    intensity: "Advanced",
  },
];

const RAW_EXERCISES: Exercise[] = [
  // CHEST EXERCISES
  {
    id: "ex-c1",
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    primaryBodyPart: "Chest",
    secondaryMuscles: ["Triceps", "Front Delts"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Lie back on flat bench with eyes directly below barbell.",
      "Grip bar slightly wider than shoulder-width.",
      "Unrack bar, lower under control to mid-chest level.",
      "Press bar upward forcefully until elbows lock out."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-c2",
    name: "Incline Barbell Bench Press",
    muscleGroup: "Chest",
    primaryBodyPart: "Chest",
    secondaryMuscles: ["Upper Chest", "Front Delts", "Triceps"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Set incline bench at 30 to 45 degrees.",
      "Lower bar slowly to upper clavicle area.",
      "Drive weight up engaging upper pectoral fibers."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-c3",
    name: "Dumbbell Chest Fly",
    muscleGroup: "Chest",
    primaryBodyPart: "Chest",
    secondaryMuscles: ["Front Delts"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    instructions: [
      "Lie on bench holding dumbbells directly above chest with palms facing.",
      "Lower dumbbells in wide arc keeping slight bend in elbows.",
      "Squeeze chest muscles to bring dumbbells back to top."
    ],
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-c4",
    name: "Cable Crossover",
    muscleGroup: "Chest",
    primaryBodyPart: "Chest",
    secondaryMuscles: ["Lower Inner Chest", "Serratus Anterior"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Set pulleys at high position, hold D-handles with slight elbow bend.",
      "Pull handles downward and inward until hands cross over.",
      "Pause for peak contraction in lower inner chest."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-c5",
    name: "Push-Ups",
    muscleGroup: "Chest",
    primaryBodyPart: "Chest",
    secondaryMuscles: ["Core", "Triceps"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Place hands slightly wider than shoulder width on floor.",
      "Maintain straight line from head to heels.",
      "Lower chest until elbows form 90 degree angle, push up back."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 20,
  },

  // BACK EXERCISES
  {
    id: "ex-b1",
    name: "Lat Pulldown",
    muscleGroup: "Back",
    primaryBodyPart: "Back",
    secondaryMuscles: ["Biceps", "Rear Delts", "Lats"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Grip wide bar with overhand grip.",
      "Pull bar down smoothly towards upper chest.",
      "Squeeze lats at bottom, release bar under control."
    ],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 12,
  },
  {
    id: "ex-b2",
    name: "Bent-Over Barbell Row",
    muscleGroup: "Back",
    primaryBodyPart: "Back",
    secondaryMuscles: ["Rhomboids", "Biceps", "Upper & Mid Back"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Hinge at hips with flat back at 45 degree angle.",
      "Pull barbell towards belly button, squeezing shoulder blades together.",
      "Lower bar slowly without rounding spine."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-b3",
    name: "Seated Cable Row",
    muscleGroup: "Back",
    primaryBodyPart: "Back",
    secondaryMuscles: ["Rhomboids", "Lats", "Mid Back"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Sit at cable row machine with feet braced and knees slightly bent.",
      "Pull handle towards lower ribs while keeping chest high.",
      "Extend arms fully forward for deep lat stretch."
    ],
    imageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-b4",
    name: "Wide-Grip Pull-Ups",
    muscleGroup: "Back",
    primaryBodyPart: "Back",
    secondaryMuscles: ["Biceps", "Upper Back", "Lats"],
    equipment: "Bodyweight",
    difficulty: "Advanced",
    instructions: [
      "Grip pull-up bar wider than shoulder width.",
      "Pull body up until chin clears bar.",
      "Lower body down smoothly under full lat tension."
    ],
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 8,
  },
  {
    id: "ex-b5",
    name: "Single-Arm Dumbbell Row",
    muscleGroup: "Back",
    primaryBodyPart: "Back",
    secondaryMuscles: ["Core", "Rhomboids", "Lats"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Place one knee and hand on flat bench for torso support.",
      "Pull dumbbell up to hip level keeping elbow close to torso.",
      "Lower dumbbell with controlled full stretch."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },

  // SHOULDER EXERCISES
  {
    id: "ex-s1",
    name: "Overhead Barbell Press",
    muscleGroup: "Shoulders",
    primaryBodyPart: "Shoulders",
    secondaryMuscles: ["Triceps", "Upper Chest", "Anterior & Lateral Delts"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Stand upright holding barbell at collarbone level.",
      "Press bar overhead until arms lock out directly over shoulders.",
      "Lower bar back to chest under strict control."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 8,
  },
  {
    id: "ex-s2",
    name: "Seated Dumbbell Shoulder Press",
    muscleGroup: "Shoulders",
    primaryBodyPart: "Shoulders",
    secondaryMuscles: ["Triceps"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Sit on 90 degree bench holding dumbbells at ear level.",
      "Press dumbbells upward until palms almost meet at top.",
      "Lower dumbbells smoothly back to shoulder level."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-s3",
    name: "Dumbbell Lateral Raise",
    muscleGroup: "Shoulders",
    primaryBodyPart: "Shoulders",
    secondaryMuscles: ["Traps", "Side Delts"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Stand upright holding dumbbells at thighs.",
      "Raise arms out to sides until parallel to floor.",
      "Pause briefly at shoulder height, lower slowly."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-s4",
    name: "Dumbbell Front Raise",
    muscleGroup: "Shoulders",
    primaryBodyPart: "Shoulders",
    secondaryMuscles: ["Upper Chest", "Front Delts"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Raise dumbbell forward in front of body up to eye level.",
      "Lower under control, avoiding swinging momentum."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-s5",
    name: "Rear Delt Fly",
    muscleGroup: "Shoulders",
    primaryBodyPart: "Shoulders",
    secondaryMuscles: ["Upper Back", "Rear Delts"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Bend forward at waist with flat back.",
      "Raise dumbbells out to sides squeezing rear deltoid muscles."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },

  // ARM EXERCISES - BICEPS
  {
    id: "ex-bi1",
    name: "Standing Barbell Bicep Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Biceps",
    secondaryMuscles: ["Forearms"],
    equipment: "Barbell",
    difficulty: "Beginner",
    instructions: [
      "Grip bar shoulder-width underhand.",
      "Curl bar towards shoulders keeping upper arms pinned to sides.",
      "Squeeze biceps at top."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 12,
  },
  {
    id: "ex-bi2",
    name: "Alternating Dumbbell Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Biceps",
    secondaryMuscles: ["Brachialis"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Hold dumbbells at sides, rotate wrist outward as you curl upward.",
      "Squeeze peak contraction."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-bi3",
    name: "Hammer Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Biceps",
    secondaryMuscles: ["Brachioradialis", "Forearms"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Hold dumbbells with neutral thumbs-up grip.",
      "Curl toward shoulders without rotating wrists."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-bi4",
    name: "Preacher Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Biceps",
    secondaryMuscles: ["Brachialis"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Rest upper arms against slanted preacher bench pad.",
      "Lower bar to full extension, curl upward."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 10,
  },
  {
    id: "ex-bi5",
    name: "Cable Bicep Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Biceps",
    secondaryMuscles: ["Forearms"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Attach straight bar to low pulley.",
      "Curl bar upward under constant cable tension."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },

  // ARM EXERCISES - TRICEPS
  {
    id: "ex-tri1",
    name: "Triceps Cable Pushdown",
    muscleGroup: "Arms",
    primaryBodyPart: "Triceps",
    secondaryMuscles: ["Forearms"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Attach rope or bar to high cable pulley.",
      "Extend arms downward locking out elbows fully at bottom."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-tri2",
    name: "Overhead Dumbbell Triceps Extension",
    muscleGroup: "Arms",
    primaryBodyPart: "Triceps",
    secondaryMuscles: ["Long Head Triceps"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Hold single heavy dumbbell overhead with both hands.",
      "Lower behind head, press back overhead."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-tri3",
    name: "Skull Crushers (EZ Bar Extension)",
    muscleGroup: "Arms",
    primaryBodyPart: "Triceps",
    secondaryMuscles: ["Triceps Lateral Head"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Lie on flat bench holding EZ bar above chest.",
      "Lower bar towards forehead, press bar up."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-tri4",
    name: "Close-Grip Bench Press",
    muscleGroup: "Arms",
    primaryBodyPart: "Triceps",
    secondaryMuscles: ["Chest", "Front Delts"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Grip barbell with narrow shoulder-width grip.",
      "Lower to lower chest keeping elbows tucked."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 8,
  },
  {
    id: "ex-tri5",
    name: "Bench Dips",
    muscleGroup: "Arms",
    primaryBodyPart: "Triceps",
    secondaryMuscles: ["Front Delts"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Place hands on edge of bench with legs extended.",
      "Lower hips, drive up locking out triceps."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },

  // ARM EXERCISES - FOREARMS & GRIP
  {
    id: "ex-fo1",
    name: "Seated Barbell Wrist Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Forearms",
    secondaryMuscles: ["Wrist Flexors"],
    equipment: "Barbell",
    difficulty: "Beginner",
    instructions: [
      "Curl barbell upward using wrist flexion over knees."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-fo2",
    name: "Reverse Barbell Wrist Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Forearms",
    secondaryMuscles: ["Wrist Extensors"],
    equipment: "Barbell",
    difficulty: "Beginner",
    instructions: [
      "Hold bar overhand, curl wrists upward targeting upper forearms."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-fo3",
    name: "Heavy Farmer's Carry",
    muscleGroup: "Arms",
    primaryBodyPart: "Forearms",
    secondaryMuscles: ["Grip", "Traps", "Core"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    instructions: [
      "Walk upright carrying heavy dumbbells maintaining crushing grip."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 1,
  },
  {
    id: "ex-fo4",
    name: "Wrist Roller",
    muscleGroup: "Arms",
    primaryBodyPart: "Forearms",
    secondaryMuscles: ["Grip"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Roll wrist roller weight up and down under continuous tension."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 5,
  },
  {
    id: "ex-fo5",
    name: "Reverse Barbell Bicep Curl",
    muscleGroup: "Arms",
    primaryBodyPart: "Forearms",
    secondaryMuscles: ["Brachioradialis"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Curl barbell overhand targeting brachioradialis forearm mass."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },

  // CORE EXERCISES - ABS & OBLIQUES
  {
    id: "ex-ab1",
    name: "Hanging Leg Raises",
    muscleGroup: "Core",
    primaryBodyPart: "Abs",
    secondaryMuscles: ["Hip Flexors"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    instructions: [
      "Hang from pull-up bar, raise legs straight out parallel to floor."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-ab2",
    name: "Weighted Cable Crunch",
    muscleGroup: "Core",
    primaryBodyPart: "Abs",
    secondaryMuscles: ["Upper Abs"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Kneel at cable machine holding rope at ears, flex spine downward."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-ab3",
    name: "Classic Floor Crunch",
    muscleGroup: "Core",
    primaryBodyPart: "Abs",
    secondaryMuscles: ["Upper Abs"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Lie back with knees bent, flex abs raising shoulders off floor."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-ab4",
    name: "Forearm Plank Hold",
    muscleGroup: "Core",
    primaryBodyPart: "Abs",
    secondaryMuscles: ["Transverse Abdominis"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Hold rigid plank position on forearms maintaining flat back."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 60,
  },
  {
    id: "ex-ab5",
    name: "Bicycle Crunches",
    muscleGroup: "Core",
    primaryBodyPart: "Abs",
    secondaryMuscles: ["Obliques"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Alternate touching opposite elbow to knee in pedaling motion."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-ob1",
    name: "Russian Twists",
    muscleGroup: "Core",
    primaryBodyPart: "Obliques",
    secondaryMuscles: ["Abs"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Sit with feet elevated, twist weight plate side-to-side across torso."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-ob2",
    name: "Side Plank Hold",
    muscleGroup: "Core",
    primaryBodyPart: "Obliques",
    secondaryMuscles: ["Core"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Support weight on single elbow and side foot holding straight hip line."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 45,
  },
  {
    id: "ex-ob3",
    name: "Cable Woodchoppers",
    muscleGroup: "Core",
    primaryBodyPart: "Obliques",
    secondaryMuscles: ["Abs"],
    equipment: "Cable",
    difficulty: "Intermediate",
    instructions: [
      "Rotate cable diagonally down across body engaging rotational core."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-ob4",
    name: "Hanging Oblique Knee Raise",
    muscleGroup: "Core",
    primaryBodyPart: "Obliques",
    secondaryMuscles: ["Abs"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    instructions: [
      "Raise knees toward left and right side alternatively while hanging."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-ob5",
    name: "Dumbbell Side Bend",
    muscleGroup: "Core",
    primaryBodyPart: "Obliques",
    secondaryMuscles: ["Lower Back"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Hold dumbbell in one hand, lower laterally toward knee and pull back up."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },

  // CORE EXERCISES - LOWER BACK
  {
    id: "ex-lb1",
    name: "Hyperextensions (Back Extension)",
    muscleGroup: "Core",
    primaryBodyPart: "Lower Back",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Lock feet into 45° extension bench, flex and extend lower back."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-lb2",
    name: "Barbell Good Mornings",
    muscleGroup: "Core",
    primaryBodyPart: "Lower Back",
    secondaryMuscles: ["Hamstrings", "Glutes"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Rest bar across upper traps, hinge hips backward keeping spine flat."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 10,
  },
  {
    id: "ex-lb3",
    name: "Superman Hold",
    muscleGroup: "Core",
    primaryBodyPart: "Lower Back",
    secondaryMuscles: ["Glutes"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Lie face down on mat, raise arms and legs off floor squeezing lower back."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 30,
  },
  {
    id: "ex-lb4",
    name: "Bird-Dog Core Hold",
    muscleGroup: "Core",
    primaryBodyPart: "Lower Back",
    secondaryMuscles: ["Core"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "On all fours, extend right arm forward and left leg backward straight."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-lb5",
    name: "Barbell Rack Pulls",
    muscleGroup: "Core",
    primaryBodyPart: "Lower Back",
    secondaryMuscles: ["Traps", "Erectors"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Set safety bars at knee level, lift barbell locking out upper back and erectors."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 6,
  },

  // LEG EXERCISES - QUADRICEPS
  {
    id: "ex-q1",
    name: "Barbell Back Squat",
    muscleGroup: "Legs",
    primaryBodyPart: "Quadriceps",
    secondaryMuscles: ["Glutes", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Rest bar on upper back, squat until hips pass knee crease, drive up through midfoot."
    ],
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 8,
  },
  {
    id: "ex-q2",
    name: "45-Degree Leg Press",
    muscleGroup: "Legs",
    primaryBodyPart: "Quadriceps",
    secondaryMuscles: ["Glutes"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Feet shoulder width on sled platform, lower sled to 90 degrees, press up."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 12,
  },
  {
    id: "ex-q3",
    name: "Seated Leg Extension",
    muscleGroup: "Legs",
    primaryBodyPart: "Quadriceps",
    secondaryMuscles: ["Patellar Tendon"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Extend knees fully upwards squeezing quad rectus femoris muscle."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-q4",
    name: "Bulgarian Split Squat",
    muscleGroup: "Legs",
    primaryBodyPart: "Quadriceps",
    secondaryMuscles: ["Glutes"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    instructions: [
      "Place rear foot on bench, lower front thigh until parallel to floor."
    ],
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-q5",
    name: "Dumbbell Goblet Squat",
    muscleGroup: "Legs",
    primaryBodyPart: "Quadriceps",
    secondaryMuscles: ["Core"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    instructions: [
      "Hold heavy dumbbell vertically at chest, squat deep between knees."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },

  // LEG EXERCISES - HAMSTRINGS & GLUTES
  {
    id: "ex-h1",
    name: "Romanian Deadlift (RDL)",
    muscleGroup: "Legs",
    primaryBodyPart: "Hamstrings",
    secondaryMuscles: ["Glutes", "Lower Back"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Lower bar along shins pushing hips back until hamstrings stretch."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-h2",
    name: "Lying Leg Curl",
    muscleGroup: "Legs",
    primaryBodyPart: "Hamstrings",
    secondaryMuscles: ["Calves"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Lie face down on machine, flex knees pulling roller toward glutes."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 12,
  },
  {
    id: "ex-h3",
    name: "Seated Leg Curl",
    muscleGroup: "Legs",
    primaryBodyPart: "Hamstrings",
    secondaryMuscles: ["Biceps Femoris"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Sit with pad over thighs, curl pad downward under control."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 12,
  },
  {
    id: "ex-gl1",
    name: "Barbell Hip Thrust",
    muscleGroup: "Legs",
    primaryBodyPart: "Glutes",
    secondaryMuscles: ["Hamstrings"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Upper back on bench with padded barbell across hips, drive hips straight up."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-gl2",
    name: "Bodyweight Glute Bridge",
    muscleGroup: "Legs",
    primaryBodyPart: "Glutes",
    secondaryMuscles: ["Core"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Lie back with knees bent, drive heels into floor elevating glutes."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-gl3",
    name: "Cable Glute Kickback",
    muscleGroup: "Legs",
    primaryBodyPart: "Glutes",
    secondaryMuscles: ["Glute Medius"],
    equipment: "Cable",
    difficulty: "Beginner",
    instructions: [
      "Attach ankle strap to low cable, extend leg backward squeezing glutes."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-gl4",
    name: "Walking Dumbbell Lunges",
    muscleGroup: "Legs",
    primaryBodyPart: "Glutes",
    secondaryMuscles: ["Quads"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    instructions: [
      "Lunge forward stepping through each stride driving up through front heel."
    ],
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-gl5",
    name: "Sumo Deadlift",
    muscleGroup: "Legs",
    primaryBodyPart: "Glutes",
    secondaryMuscles: ["Adductors", "Quads"],
    equipment: "Barbell",
    difficulty: "Advanced",
    instructions: [
      "Wide stance with toes out, pull barbell vertically squeezing glutes."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 6,
  },

  // LEG EXERCISES - CALVES & HIPS
  {
    id: "ex-ca1",
    name: "Standing Machine Calf Raise",
    muscleGroup: "Legs",
    primaryBodyPart: "Calves",
    secondaryMuscles: ["Gastrocnemius"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Extend ankles upward squeezing calf peaks under shoulder pads."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-ca2",
    name: "Seated Calf Raise",
    muscleGroup: "Legs",
    primaryBodyPart: "Calves",
    secondaryMuscles: ["Soleus"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Sit with pad over lower thighs, flex soleus muscle elevating heels."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-ca3",
    name: "Leg Press Calf Press",
    muscleGroup: "Legs",
    primaryBodyPart: "Calves",
    secondaryMuscles: ["Gastrocnemius"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Rest toes on lower sled edge, extend ankles forward under controlled load."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-ca4",
    name: "Single-Leg Bodyweight Calf Raise",
    muscleGroup: "Legs",
    primaryBodyPart: "Calves",
    secondaryMuscles: ["Balance"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Stand on step edge on one foot, drop heel deep and press up to tiptoe."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 20,
  },
  {
    id: "ex-ad1",
    name: "Seated Machine Hip Adduction",
    muscleGroup: "Legs",
    primaryBodyPart: "Adductors",
    secondaryMuscles: ["Inner Thigh"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Squeeze legs inward against machine pads targeting inner thigh."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-ad2",
    name: "Seated Machine Hip Abduction",
    muscleGroup: "Legs",
    primaryBodyPart: "Abductors",
    secondaryMuscles: ["Glute Medius"],
    equipment: "Machine",
    difficulty: "Beginner",
    instructions: [
      "Push knees outward against machine pads engaging hip abductors."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-ad3",
    name: "Lateral Band Walk",
    muscleGroup: "Legs",
    primaryBodyPart: "Abductors",
    secondaryMuscles: ["Glutes"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Resistance band above knees, step sideways maintaining squat tension."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 15,
  },
  {
    id: "ex-ad4",
    name: "Copenhagen Plank",
    muscleGroup: "Legs",
    primaryBodyPart: "Adductors",
    secondaryMuscles: ["Core"],
    equipment: "Bodyweight",
    difficulty: "Advanced",
    instructions: [
      "Rest top leg on bench in side plank position holding inner thigh isometric."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 30,
  },

  // FULL BODY & CONDITIONING
  {
    id: "ex-fb1",
    name: "Barbell Thruster",
    muscleGroup: "Full Body",
    primaryBodyPart: "Full Body",
    secondaryMuscles: ["Quads", "Shoulders", "Core"],
    equipment: "Barbell",
    difficulty: "Advanced",
    instructions: [
      "Perform front squat into explosive overhead shoulder press in single continuous motion."
    ],
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 10,
  },
  {
    id: "ex-fb2",
    name: "Kettlebell Swing",
    muscleGroup: "Full Body",
    primaryBodyPart: "Full Body",
    secondaryMuscles: ["Hamstrings", "Glutes", "Core"],
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    instructions: [
      "Hinge at hips swinging kettlebell between legs, drive hips forward to eye level."
    ],
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 20,
  },
  {
    id: "ex-fb3",
    name: "Explosive Burpees",
    muscleGroup: "Full Body",
    primaryBodyPart: "Full Body",
    secondaryMuscles: ["Chest", "Legs", "Cardio"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    instructions: [
      "Drop to chest-to-floor push-up, jump feet in and explode vertically into overhead jump."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80",
    setsDefault: 4,
    repsDefault: 15,
  },
  {
    id: "ex-fb4",
    name: "Dumbbell Clean and Press",
    muscleGroup: "Full Body",
    primaryBodyPart: "Full Body",
    secondaryMuscles: ["Shoulders", "Hamstrings"],
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    instructions: [
      "Clean dumbbells from floor to shoulders, press overhead with leg dip."
    ],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
    setsDefault: 3,
    repsDefault: 10,
  },
  {
    id: "ex-fb5",
    name: "Man Maker",
    muscleGroup: "Full Body",
    primaryBodyPart: "Full Body",
    secondaryMuscles: ["Chest", "Back", "Shoulders", "Quads"],
    equipment: "Dumbbell",
    difficulty: "Advanced",
    instructions: [
      "Push-up on dumbbells, row right, row left, jump to squat, thruster overhead."
    ],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
  },
];

export const INITIAL_EXERCISES: Exercise[] = RAW_EXERCISES.map((ex) => {
  const catalogItem = EXERCISE_IMAGE_CATALOG[ex.name];
  return {
    ...ex,
    imageUrl: catalogItem ? (catalogItem.assetPath || catalogItem.fallbackUrl) : ex.imageUrl,
  };
});

export const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [];
export const INITIAL_NUTRITION_PLANS: NutritionPlan[] = [
  {
    id: "np-1",
    title: "Apex Lean Mass Fuel Protocol",
    trainerId: "tr-1",
    calories: 2850,
    proteinGrams: 210,
    carbsGrams: 310,
    fatsGrams: 75,
    meals: [
      {
        mealType: "Breakfast",
        name: "Anabolic Oats & Whey",
        description: "100g Rolled Oats, 2 scoops Isolate Whey, 15g Almond Butter, Blueberries",
        calories: 650,
        protein: 52,
        carbs: 72,
        fats: 16,
      },
      {
        mealType: "Lunch",
        name: "Grilled Chicken & Complex Carbs",
        description: "220g Grilled Chicken Breast, 200g Jasmine Rice, Steamed Broccoli & Olive Oil",
        calories: 780,
        protein: 62,
        carbs: 85,
        fats: 18,
      },
      {
        mealType: "Snack",
        name: "Pre-Workout Fuel",
        description: "Greek Yogurt, Banana, 30g Rice Cakes with Honey",
        calories: 420,
        protein: 28,
        carbs: 68,
        fats: 6,
      },
      {
        mealType: "Dinner",
        name: "Sirloin Steak & Roasted Sweet Potatoes",
        description: "200g Lean Beef Sirloin, 250g Sweet Potato, Mixed Greens Salad",
        calories: 1000,
        protein: 68,
        carbs: 85,
        fats: 35,
      },
    ],
  },
];
export const INITIAL_BLOG_POSTS: BlogPost[] = [];
export const INITIAL_TESTIMONIALS: Testimonial[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_MEASUREMENTS: ProgressMeasurement[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_NOTIFICATION_LOGS: NotificationLog[] = [];

export type UserRole = 'ADMIN' | 'TRAINER' | 'MEMBER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  branchId?: string;
  createdAt: string;
}

export type FoodPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Vegetarian + Eggs';
export type DietGoal = 'Weight Loss' | 'Weight Gain' | 'Muscle Gain' | 'Fat Loss' | 'Maintenance' | 'General Fitness';
export type DietBudgetPeriod = 'MONTHLY' | 'WEEKLY';

export interface WorkoutExercisePlanItem {
  id: string;
  exerciseId: string;
  name: string;
  targetMuscle: string;
  imageUrl: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions?: string;
  completed?: boolean;
}

export interface WorkoutDayPlan {
  dayName: string;
  dayNumber: number;
  title: string;
  muscleGroups: string[];
  exercises: WorkoutExercisePlanItem[];
  isRestDay: boolean;
  isCompleted?: boolean;
}

export interface GeneratedWorkoutPlan {
  id: string;
  userId: string;
  workoutDays: number;
  splitTitle: string;
  days: WorkoutDayPlan[];
  generatedAt: string;
}

export interface DietMealItem {
  mealType: 'Breakfast' | 'Mid-Morning Snack' | 'Lunch' | 'Evening Snack' | 'Dinner';
  name: string;
  items: string[];
  quantity: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  approxCostInr: number;
}

export interface DietDayPlan {
  dayName: string;
  dayNumber: number;
  meals: DietMealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCostInr: number;
}

export interface GeneratedDietPlan {
  id: string;
  userId: string;
  foodPreference: FoodPreference;
  dietGoal: DietGoal;
  dietBudget: number;
  dietBudgetPeriod: DietBudgetPeriod;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatsTarget: number;
  weeklyEstimatedCost: number;
  monthlyEstimatedCost: number;
  weeklyPlan: DietDayPlan[];
  monthlyPlan: DietDayPlan[];
  generatedAt: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  emergencyContact?: string;
  emergencyPhone?: string;
  qrCode: string;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED' | string;
  currentPlanId?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  joinDate?: string;
  expiryDate?: string;
  // Biometrics & Personalization
  currentWeightKg?: number;
  targetWeightKg?: number;
  heightCm?: number;
  age?: number;
  workoutDays?: number;
  foodPreference?: FoodPreference;
  dietGoal?: DietGoal;
  dietBudget?: number;
  dietBudgetPeriod?: DietBudgetPeriod;
  workoutPlanJson?: string;
  dietPlanJson?: string;
  activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
  fitnessGoal?: string;
  dailyCalorieTarget?: number;
  proteinGramsTarget?: number;
  carbsGramsTarget?: number;
  fatsGramsTarget?: number;
  waterLitersTarget?: number;
  hasCompletedOnboarding?: boolean;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  phone?: string;
  bio: string;
  specialization: string;
  experienceYears: number | string;
  rating: number;
  certifications: string[];
  languages: string[];
  isAvailable: boolean;
}

export interface GymBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  openingHours: string;
  capacity: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceSixMonths: number;
  priceYearly: number;
  features: string[];
  isPopular?: boolean;
  badgeText?: string;
  trialDays?: number;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  billingCycle: 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY';
  hasDietPlan?: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string;
  category: 'HIIT' | 'Yoga' | 'CrossFit' | 'Strength' | 'Boxing' | 'Cardio' | 'Zumba';
  trainerId: string;
  trainerName: string;
  trainerAvatar?: string;
  scheduleTime: string;
  durationMins: number;
  capacity: number;
  bookedCount: number;
  location: string;
  intensity: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ClassBooking {
  id: string;
  classId: string;
  memberId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';
  bookedAt: string;
}

export interface PersonalTrainingBooking {
  id: string;
  memberId: string;
  memberName: string;
  trainerId: string;
  trainerName: string;
  sessionTime: string;
  durationMins: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberQr: string;
  branchId: string;
  branchName: string;
  checkInTime: string;
  checkOutTime?: string;
  method: 'QR_CODE' | 'MANUAL' | 'BIOMETRIC';
  status: 'VALID' | 'EXPIRED_MEMBERSHIP' | 'INVALID';
}

export type PrimaryBodyPart =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Abs'
  | 'Obliques'
  | 'Lower Back'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Adductors'
  | 'Abductors'
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | 'Full Body';
  primaryBodyPart: PrimaryBodyPart;
  secondaryMuscles?: string[];
  equipment: 'Dumbbell' | 'Barbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Kettlebell';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  setsDefault?: number;
  repsDefault?: number;
  safetyNotes?: string;
  trainerNotes?: string;
  createdBy?: string;
}

export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  targetWeightKg?: number;
  isCompleted?: boolean;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  trainerName: string;
  memberId?: string;
  targetGoal: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Strength' | 'General Fitness';
  exercises: WorkoutExerciseItem[];
  assignedDate: string;
}

export interface NutritionPlan {
  id: string;
  title: string;
  trainerId: string;
  memberId?: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  meals: {
    mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
}

export interface ProgressMeasurement {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  bmi?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
}

export interface ProgressPhoto {
  id: string;
  memberId: string;
  date: string;
  photoType: 'FRONT' | 'SIDE' | 'BACK';
  imageUrl: string;
  isPrivate: boolean;
}

export interface Goal {
  id: string;
  memberId: string;
  title: string;
  category: 'WEIGHT' | 'STRENGTH' | 'ATTENDANCE' | 'FAT_LOSS';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  isCompleted: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  issuedDate: string;
  dueDate: string;
  paymentMethod: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationType =
  | 'MEMBERSHIP_EXPIRY_5_DAY'
  | 'MEMBERSHIP_EXPIRY_CUSTOM'
  | 'SYSTEM'
  | 'CLASS_REMINDER'
  | 'PAYMENT'
  | 'MESSAGING';

export interface NotificationLog {
  id: string;
  userId: string;
  memberId: string;
  membershipId: string;
  type: NotificationType;
  title: string;
  message: string;
  expiryDate: string;
  scheduledDate: string;
  sentDate?: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  readStatus: boolean;
  errorLog?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GymSettings {
  enableExpiryReminders: boolean;
  reminderDaysBefore: number;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    whatsApp: boolean;
  };
  timezone: string;
  gymName: string;
  ownerName?: string;
  gymEmail: string;
  gymPhone: string;
}

export interface ExpiringMembershipReport {
  memberId: string;
  memberName: string;
  memberEmail: string;
  membershipId: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  reminderStatus: DeliveryStatus | 'NOT_SCHEDULED';
  emailStatus: DeliveryStatus | 'NOT_SENT';
  inAppStatus: DeliveryStatus | 'NOT_SENT';
  lastSentDate?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedPlan?: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'TRIAL_SCHEDULED' | 'CONVERTED' | 'LOST';
  notes?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: 'Fitness' | 'Nutrition' | 'Recovery' | 'Lifestyle' | 'Gym News';
  authorName: string;
  publishedAt: string;
  readTimeMins: number;
}

export interface Testimonial {
  id: string;
  memberName: string;
  memberRole: string;
  avatar: string;
  rating: number;
  comment: string;
  beforeWeight?: string;
  afterWeight?: string;
}

export type VerificationStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface VerificationRequest {
  id: string;
  memberId: string;
  userId: string;
  planId: string;
  planName?: string;
  paymentId?: string;
  membershipId?: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY';
  paymentMethod: string;
  transactionRef: string;
  receiptUrl?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  requestDate: string;
  verifiedAt?: string;
  verifiedBy?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  member?: {
    id: string;
    userId: string;
    qrCode: string;
  };
  pass?: MembershipPass;
}

export interface MembershipPass {
  id: string;
  passNumber: string;
  memberId: string;
  membershipId: string;
  verificationRequestId: string;
  issueDate: string;
  qrCodeData: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  memberName?: string;
  memberAvatar?: string;
  planName?: string;
  billingCycle?: string;
  amountPaid?: number;
  transactionRef?: string;
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
}


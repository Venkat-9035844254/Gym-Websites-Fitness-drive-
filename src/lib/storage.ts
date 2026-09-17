import {
  INITIAL_USERS,
  INITIAL_MEMBERS,
  INITIAL_MEMBERSHIP_RECORDS,
  INITIAL_TRAINERS,
  INITIAL_PLANS,
  INITIAL_CLASSES,
  INITIAL_EXERCISES,
  INITIAL_WORKOUT_PLANS,
  INITIAL_NUTRITION_PLANS,
  INITIAL_BLOG_POSTS,
  INITIAL_TESTIMONIALS,
  INITIAL_INVOICES,
  INITIAL_ATTENDANCE,
  INITIAL_GOALS,
  INITIAL_MEASUREMENTS,
  INITIAL_LEADS,
  INITIAL_BRANCHES,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATION_LOGS,
} from "./seedData";

import {
  User,
  MemberProfile,
  TrainerProfile,
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
  ClassBooking,
  GymBranch,
  GymSettings,
  NotificationLog
} from "@/types";

const STORAGE_KEYS = {
  USERS: "apex_gym_users",
  MEMBERS: "apex_gym_members",
  MEMBERSHIPS: "apex_gym_memberships",
  TRAINERS: "apex_gym_trainers",
  PLANS: "apex_gym_plans",
  CLASSES: "apex_gym_classes",
  BOOKINGS: "apex_gym_bookings",
  EXERCISES: "apex_gym_exercises",
  WORKOUT_PLANS: "apex_gym_workouts",
  NUTRITION_PLANS: "apex_gym_nutrition",
  BLOG_POSTS: "apex_gym_blogs",
  TESTIMONIALS: "apex_gym_testimonials",
  INVOICES: "apex_gym_invoices",
  ATTENDANCE: "apex_gym_attendance",
  GOALS: "apex_gym_goals",
  MEASUREMENTS: "apex_gym_measurements",
  LEADS: "apex_gym_leads",
  ENQUIRIES: "apex_gym_enquiries",
  BRANCHES: "apex_gym_branches",
  SETTINGS: "apex_gym_settings",
  NOTIFICATION_LOGS: "apex_gym_notification_logs",
};

// In-Memory cache fallback for Node.js server environments & tests
const memoryStore: Record<string, any> = {
  [STORAGE_KEYS.USERS]: INITIAL_USERS,
  [STORAGE_KEYS.MEMBERS]: INITIAL_MEMBERS,
  [STORAGE_KEYS.MEMBERSHIPS]: INITIAL_MEMBERSHIP_RECORDS,
  [STORAGE_KEYS.TRAINERS]: INITIAL_TRAINERS,
  [STORAGE_KEYS.PLANS]: INITIAL_PLANS,
  [STORAGE_KEYS.CLASSES]: INITIAL_CLASSES,
  [STORAGE_KEYS.EXERCISES]: INITIAL_EXERCISES,
  [STORAGE_KEYS.WORKOUT_PLANS]: INITIAL_WORKOUT_PLANS,
  [STORAGE_KEYS.NUTRITION_PLANS]: INITIAL_NUTRITION_PLANS,
  [STORAGE_KEYS.BLOG_POSTS]: INITIAL_BLOG_POSTS,
  [STORAGE_KEYS.TESTIMONIALS]: INITIAL_TESTIMONIALS,
  [STORAGE_KEYS.INVOICES]: INITIAL_INVOICES,
  [STORAGE_KEYS.ATTENDANCE]: INITIAL_ATTENDANCE,
  [STORAGE_KEYS.GOALS]: INITIAL_GOALS,
  [STORAGE_KEYS.MEASUREMENTS]: INITIAL_MEASUREMENTS,
  [STORAGE_KEYS.LEADS]: INITIAL_LEADS,
  [STORAGE_KEYS.BRANCHES]: INITIAL_BRANCHES,
  [STORAGE_KEYS.SETTINGS]: INITIAL_SETTINGS,
  [STORAGE_KEYS.NOTIFICATION_LOGS]: INITIAL_NOTIFICATION_LOGS,
};

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  }
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  memoryStore[key] = value;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function initializeStorage() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) setStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) setStoredItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) setStoredItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIP_RECORDS);
  setStoredItem(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
  setStoredItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) setStoredItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  const updatedExercises = INITIAL_EXERCISES.map((initEx) => ({
    ...initEx,
    imageUrl: initEx.imageUrl,
  }));
  setStoredItem(STORAGE_KEYS.EXERCISES, updatedExercises);
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS)) setStoredItem(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_WORKOUT_PLANS);
  if (!localStorage.getItem(STORAGE_KEYS.NUTRITION_PLANS)) setStoredItem(STORAGE_KEYS.NUTRITION_PLANS, INITIAL_NUTRITION_PLANS);
  if (!localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)) setStoredItem(STORAGE_KEYS.BLOG_POSTS, INITIAL_BLOG_POSTS);
  if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) setStoredItem(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) setStoredItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) setStoredItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) setStoredItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  if (!localStorage.getItem(STORAGE_KEYS.MEASUREMENTS)) setStoredItem(STORAGE_KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS);
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) setStoredItem(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) setStoredItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) setStoredItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATION_LOGS)) setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, INITIAL_NOTIFICATION_LOGS);

  // Sync updated initial trainer names, avatars & phone numbers into localStorage
  const storedTrainers = getStoredItem<TrainerProfile[]>(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS);
  const updatedTrainers = INITIAL_TRAINERS.map((initT) => {
    const existing = storedTrainers.find((t) => t.id === initT.id || t.name === initT.name);
    return existing
      ? { ...initT, ...existing, name: initT.name, avatar: initT.avatar, phone: initT.phone, experienceYears: initT.experienceYears, bio: initT.bio, specialization: initT.specialization }
      : initT;
  });
  const extraTrainers = storedTrainers.filter((st) => !INITIAL_TRAINERS.some((initT) => initT.id === st.id || initT.name === st.name));
  setStoredItem(STORAGE_KEYS.TRAINERS, [...updatedTrainers, ...extraTrainers]);

  const storedUsers = getStoredItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const updatedUsers = INITIAL_USERS.map((initU) => {
    const existing = storedUsers.find((u) => u.id === initU.id || u.email.toLowerCase() === initU.email.toLowerCase());
    return existing
      ? { ...initU, ...existing, name: initU.name, avatar: initU.avatar, email: initU.email, phone: initU.phone }
      : initU;
  });
  const extraUsers = storedUsers.filter((su) => !INITIAL_USERS.some((initU) => initU.id === su.id || initU.email.toLowerCase() === su.email.toLowerCase()));
  setStoredItem(STORAGE_KEYS.USERS, [...updatedUsers, ...extraUsers]);
}

export function getStoredUsers(): User[] { return getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS); }
export function saveUsers(users: User[]) { setStoredItem(STORAGE_KEYS.USERS, users); }

export function getStoredMembers(): MemberProfile[] { return getStoredItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS); }
export function saveMembers(members: MemberProfile[]) { setStoredItem(STORAGE_KEYS.MEMBERS, members); }

export function getStoredMembershipRecords(): MembershipRecord[] { return getStoredItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIP_RECORDS); }
export function saveMembershipRecords(records: MembershipRecord[]) { setStoredItem(STORAGE_KEYS.MEMBERSHIPS, records); }

export function getStoredTrainers(): TrainerProfile[] { return getStoredItem(STORAGE_KEYS.TRAINERS, INITIAL_TRAINERS); }
export function saveTrainers(trainers: TrainerProfile[]) { setStoredItem(STORAGE_KEYS.TRAINERS, trainers); }

export function getStoredPlans(): MembershipPlan[] { return getStoredItem(STORAGE_KEYS.PLANS, INITIAL_PLANS); }
export function savePlans(plans: MembershipPlan[]) { setStoredItem(STORAGE_KEYS.PLANS, plans); }

export function getStoredClasses(): ClassItem[] { return getStoredItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES); }
export function saveClasses(classes: ClassItem[]) { setStoredItem(STORAGE_KEYS.CLASSES, classes); }

export function getStoredBookings(): ClassBooking[] { return getStoredItem(STORAGE_KEYS.BOOKINGS, []); }
export function saveBookings(bookings: ClassBooking[]) { setStoredItem(STORAGE_KEYS.BOOKINGS, bookings); }

export function getStoredExercises(): Exercise[] { return getStoredItem(STORAGE_KEYS.EXERCISES, INITIAL_EXERCISES); }
export function saveExercises(exercises: Exercise[]) { setStoredItem(STORAGE_KEYS.EXERCISES, exercises); }

export function getStoredInvoices(): Invoice[] { return getStoredItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES); }
export function saveInvoices(invoices: Invoice[]) { setStoredItem(STORAGE_KEYS.INVOICES, invoices); }

export function getStoredAttendance(): AttendanceRecord[] { return getStoredItem(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE); }
export function saveAttendance(records: AttendanceRecord[]) { setStoredItem(STORAGE_KEYS.ATTENDANCE, records); }

export function getStoredLeads(): Lead[] { return getStoredItem(STORAGE_KEYS.LEADS, INITIAL_LEADS); }
export function saveLeads(leads: Lead[]) { setStoredItem(STORAGE_KEYS.LEADS, leads); }

export function getStoredEnquiries(): Enquiry[] { return getStoredItem(STORAGE_KEYS.ENQUIRIES, []); }
export function saveEnquiries(enquiries: Enquiry[]) { setStoredItem(STORAGE_KEYS.ENQUIRIES, enquiries); }

export function getStoredWorkouts(): WorkoutPlan[] { return getStoredItem(STORAGE_KEYS.WORKOUT_PLANS, INITIAL_WORKOUT_PLANS); }
export function saveWorkouts(workouts: WorkoutPlan[]) { setStoredItem(STORAGE_KEYS.WORKOUT_PLANS, workouts); }

export function getStoredNutrition(): NutritionPlan[] { return getStoredItem(STORAGE_KEYS.NUTRITION_PLANS, INITIAL_NUTRITION_PLANS); }
export function saveNutrition(nutrition: NutritionPlan[]) { setStoredItem(STORAGE_KEYS.NUTRITION_PLANS, nutrition); }

export function getStoredBlogPosts(): BlogPost[] { return getStoredItem(STORAGE_KEYS.BLOG_POSTS, INITIAL_BLOG_POSTS); }
export function saveBlogPosts(posts: BlogPost[]) { setStoredItem(STORAGE_KEYS.BLOG_POSTS, posts); }

export function getStoredTestimonials(): Testimonial[] { return getStoredItem(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS); }
export function saveTestimonials(testimonials: Testimonial[]) { setStoredItem(STORAGE_KEYS.TESTIMONIALS, testimonials); }

export function getStoredGoals(): Goal[] { return getStoredItem(STORAGE_KEYS.GOALS, INITIAL_GOALS); }
export function saveGoals(goals: Goal[]) { setStoredItem(STORAGE_KEYS.GOALS, goals); }

export function getStoredMeasurements(): ProgressMeasurement[] { return getStoredItem(STORAGE_KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS); }
export function saveMeasurements(measurements: ProgressMeasurement[]) { setStoredItem(STORAGE_KEYS.MEASUREMENTS, measurements); }

export function getStoredSettings(): GymSettings { return getStoredItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS); }
export function saveSettings(settings: GymSettings) { setStoredItem(STORAGE_KEYS.SETTINGS, settings); }

export function getStoredNotificationLogs(): NotificationLog[] { return getStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, INITIAL_NOTIFICATION_LOGS); }
export function saveNotificationLogs(logs: NotificationLog[]) { setStoredItem(STORAGE_KEYS.NOTIFICATION_LOGS, logs); }

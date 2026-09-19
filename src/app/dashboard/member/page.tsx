"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getStoredWorkouts,
  getStoredAttendance,
  getStoredMeasurements,
  getStoredInvoices,
  saveWorkouts,
  saveMeasurements,
  getStoredPlans
} from "@/lib/storage";
import {
  MembershipPlan,
  GeneratedWorkoutPlan,
  GeneratedDietPlan,
  WorkoutDayPlan,
  DietDayPlan,
  FoodPreference,
  DietGoal,
  DietBudgetPeriod,
} from "@/types";
import {
  calculateDaysRemaining,
  getTodayFormatted,
  runMembershipExpiryCheck
} from "@/lib/reminderEngine";
import { generateWorkoutPlan } from "@/lib/workoutGenerator";
import { generateDietPlan } from "@/lib/dietGenerator";
import { downloadWorkoutPlanPdf, downloadDietPlanPdf, downloadCombinedFitnessPlanPdf } from "@/lib/pdfGenerator";
import { MembershipPassCard } from "@/components/membership/MembershipPassCard";
import { ManualPaymentModal } from "@/components/membership/ManualPaymentModal";
import {
  Dumbbell,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  ShieldAlert,
  Sparkles,
  QrCode,
  AlertTriangle,
  RefreshCw,
  FileText,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  Plus,
  Send,
  UserCheck,
  Activity,
  HeartPulse,
  ArrowRight,
  Scale,
  Target,
  Droplets,
  Utensils,
  Download,
  Wallet,
  CheckSquare,
  Info,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useNotification } from "@/context/NotificationContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintableInvoice } from "@/components/checkout/PrintableInvoice";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { FitnessOnboardingModal } from "@/components/onboarding/FitnessOnboardingModal";

export default function MemberDashboard() {
  const { user, memberProfile, updateProfile, logout } = useAuth();
  const { showToast } = useNotification();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  const [workouts, setWorkouts] = useState(getStoredWorkouts());
  const [measurements, setMeasurements] = useState(getStoredMeasurements());
  const [attendanceLogs] = useState(getStoredAttendance());
  const [invoices] = useState(getStoredInvoices());
  const [plans] = useState(getStoredPlans());

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MEMBERSHIP" | "NUTRITION" | "WORKOUT" | "PROGRESS" | "MESSAGES" | "INVOICES" | "PAYMENTS">("OVERVIEW");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState<any>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // Verification Requests & Membership Pass State
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [latestRequest, setLatestRequest] = useState<any>(null);
  const [activePassData, setActivePassData] = useState<any>(null);
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [isLoadingPass, setIsLoadingPass] = useState<boolean>(false);

  const fetchVerificationRequests = async () => {
    try {
      const res = await fetch("/api/memberships/verify-request");
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationRequests(data.requests || []);
        setLatestRequest(data.latestRequest || null);
      }
    } catch (err) {
      console.error("Failed to fetch verification requests:", err);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
  }, [user]);

  const handleGeneratePass = async () => {
    setIsLoadingPass(true);
    try {
      const passIdToFetch = latestRequest?.id || memberProfile?.id || user?.id;
      const res = await fetch(`/api/memberships/pass/${encodeURIComponent(passIdToFetch)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setActivePassData(data.pass);
        setShowPassModal(true);
      } else {
        showToast("Pass Unavailable", data.message || "Pass generation restricted until admin approval.", "error");
      }
    } catch (err: any) {
      showToast("Error", err?.message || "Failed to fetch pass", "error");
    } finally {
      setIsLoadingPass(false);
    }
  };

  // Real Backend Razorpay Payment History State
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);

  const fetchPaymentHistory = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch("/api/payments/history");
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentHistory(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "PAYMENTS") {
      fetchPaymentHistory();
    }
  }, [activeTab]);

  // Personalized Workout & Diet Plans State
  const [workoutPlan, setWorkoutPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [dietPlan, setDietPlan] = useState<GeneratedDietPlan | null>(null);

  // Tab selections
  const [selectedWorkoutDayNumber, setSelectedWorkoutDayNumber] = useState<number>(1);
  const [dietViewMode, setDietViewMode] = useState<"WEEKLY" | "MONTHLY">("WEEKLY");
  const [selectedDietDayNumber, setSelectedDietDayNumber] = useState<number>(1);

  // Regenerate Plan Modal State
  const [showRegenerateModal, setShowRegenerateModal] = useState<boolean>(false);
  const [regenDays, setRegenDays] = useState<number>(4);
  const [regenFoodPref, setRegenFoodPref] = useState<FoodPreference>("Non-Vegetarian");
  const [regenGoal, setRegenGoal] = useState<DietGoal>("Muscle Gain");
  const [regenBudget, setRegenBudget] = useState<number>(7000);
  const [regenBudgetPeriod, setRegenBudgetPeriod] = useState<DietBudgetPeriod>("MONTHLY");
  const [regenExperience, setRegenExperience] = useState<string>("Intermediate");
  const [regenEquipment, setRegenEquipment] = useState<string>("Full Gym");
  const [regenWorkoutType, setRegenWorkoutType] = useState<string>("Hypertrophy");
  const [regenLimitations, setRegenLimitations] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // New weight log form state
  const [newWeight, setNewWeight] = useState(memberProfile?.currentWeightKg || 75.0);
  const [newBodyFat, setNewBodyFat] = useState(15.0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    runMembershipExpiryCheck();
    if (memberProfile && !memberProfile.hasCompletedOnboarding) {
      setShowOnboardingModal(true);
    }
  }, [memberProfile]);

  // Load/Generate Workout & Diet Plans
  useEffect(() => {
    if (!user) return;

    let wp: GeneratedWorkoutPlan | null = null;
    let dp: GeneratedDietPlan | null = null;

    if (memberProfile?.workoutPlanJson) {
      try {
        wp = typeof memberProfile.workoutPlanJson === "string"
          ? JSON.parse(memberProfile.workoutPlanJson)
          : memberProfile.workoutPlanJson;
      } catch (err) {
        console.error("Failed to parse workoutPlanJson:", err);
      }
    }

    if (memberProfile?.dietPlanJson) {
      try {
        dp = typeof memberProfile.dietPlanJson === "string"
          ? JSON.parse(memberProfile.dietPlanJson)
          : memberProfile.dietPlanJson;
      } catch (err) {
        console.error("Failed to parse dietPlanJson:", err);
      }
    }

    if (!wp) {
      wp = generateWorkoutPlan(user.id, memberProfile?.workoutDays || 4, {
        fitnessGoal: memberProfile?.dietGoal || "Muscle Gain",
        age: memberProfile?.age || 25,
        gender: memberProfile?.gender || "Male",
        weightKg: memberProfile?.currentWeightKg || (memberProfile as any)?.weightKg || 70,
        heightCm: memberProfile?.heightCm || 175,
      });
    }

    if (!dp) {
      dp = generateDietPlan(
        {
          age: memberProfile?.age || 25,
          gender: memberProfile?.gender || "Male",
          heightCm: memberProfile?.heightCm || 175,
          weightKg: memberProfile?.currentWeightKg || (memberProfile as any)?.weightKg || 70,
          workoutDays: memberProfile?.workoutDays || 4,
        },
        memberProfile?.foodPreference || "Non-Vegetarian",
        memberProfile?.dietGoal || "Muscle Gain",
        memberProfile?.dietBudget || 7000,
        memberProfile?.dietBudgetPeriod || "MONTHLY"
      );
    }

    setWorkoutPlan(wp);
    setDietPlan(dp);

    // Preset regeneration modal state
    setRegenDays(memberProfile?.workoutDays || 4);
    setRegenFoodPref(memberProfile?.foodPreference || "Non-Vegetarian");
    setRegenGoal(memberProfile?.dietGoal || "Muscle Gain");
    setRegenBudget(memberProfile?.dietBudget || 7000);
    setRegenBudgetPeriod(memberProfile?.dietBudgetPeriod || "MONTHLY");
  }, [user, memberProfile]);

  // Attendance count calculation
  const memberVisitsCount = attendanceLogs.filter(
    (a) => a.memberId === memberProfile?.id
  ).length;

  const expiryDateStr = memberProfile?.expiryDate || "2026-09-01";
  const todayStr = getTodayFormatted();
  const daysRemaining = calculateDaysRemaining(expiryDateStr, todayStr);
  const isMembershipActive = memberProfile?.membershipStatus === "ACTIVE" && daysRemaining > 0;

  const currentPlan = plans.find((p: MembershipPlan) => p.id === memberProfile?.currentPlanId) || plans[0] || {
    name: "Strength Training Pass",
    priceMonthly: 800,
  };

  // Toggle Exercise Completion
  const handleToggleExerciseCompletion = async (dayNum: number, exerciseId: string) => {
    if (!workoutPlan || !user) return;

    const updatedPlan = { ...workoutPlan };
    const targetDay = updatedPlan.days.find((d) => d.dayNumber === dayNum);
    if (!targetDay) return;

    const ex = targetDay.exercises.find((e) => e.id === exerciseId || e.exerciseId === exerciseId);
    if (ex) {
      ex.completed = !ex.completed;
    }

    setWorkoutPlan(updatedPlan);
    updateProfile({ workoutPlanJson: JSON.stringify(updatedPlan) });

    // Sync backend progress API
    try {
      await fetch("/api/plans/workout/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          dayNumber: dayNum,
          exerciseId,
          completed: ex?.completed,
        }),
      });
    } catch (err) {
      console.error("Failed to sync exercise progress to server:", err);
    }
  };

  // Toggle Entire Day Completion
  const handleToggleDayCompletion = async (dayNum: number) => {
    if (!workoutPlan || !user) return;

    const updatedPlan = { ...workoutPlan };
    const targetDay = updatedPlan.days.find((d) => d.dayNumber === dayNum);
    if (!targetDay) return;

    const isNowDone = !targetDay.isCompleted;
    targetDay.isCompleted = isNowDone;
    targetDay.exercises.forEach((ex) => {
      ex.completed = isNowDone;
    });

    setWorkoutPlan(updatedPlan);
    updateProfile({ workoutPlanJson: JSON.stringify(updatedPlan) });
    showToast(isNowDone ? "Day Completed!" : "Day Unmarked", `${targetDay.dayName} marked as ${isNowDone ? "complete" : "incomplete"}.`, "success");

    try {
      await fetch("/api/plans/workout/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          dayNumber: dayNum,
          completed: isNowDone,
        }),
      });
    } catch (err) {
      console.error("Failed to sync day progress to server:", err);
    }
  };

  // Handle Regenerate Plans Submission
  const handleConfirmRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsRegenerating(true);
    try {
      const res = await fetch("/api/plans/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          workoutDays: regenDays,
          foodPreference: regenFoodPref,
          dietGoal: regenGoal,
          dietBudget: regenBudget,
          dietBudgetPeriod: regenBudgetPeriod,
          workoutExperience: regenExperience,
          equipment: regenEquipment,
          workoutType: regenWorkoutType,
          limitations: regenLimitations,
          age: memberProfile?.age || 25,
          gender: memberProfile?.gender || "Male",
          heightCm: memberProfile?.heightCm || 175,
          weightKg: memberProfile?.currentWeightKg || (memberProfile as any)?.weightKg || 70,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWorkoutPlan(data.workoutPlan);
        setDietPlan(data.dietPlan);
        updateProfile({
          workoutDays: regenDays,
          foodPreference: regenFoodPref,
          dietGoal: regenGoal,
          dietBudget: regenBudget,
          dietBudgetPeriod: regenBudgetPeriod,
          workoutPlanJson: JSON.stringify(data.workoutPlan),
          dietPlanJson: JSON.stringify(data.dietPlan),
        });
        showToast("Plans Regenerated!", "Your Workout and Diet plans have been updated dynamically.", "success");
        setShowRegenerateModal(false);
      } else {
        showToast("Regeneration Error", data.message || "Failed to regenerate plans.", "error");
      }
    } catch (err: any) {
      showToast("Regeneration Failed", err?.message || "Network error while regenerating plans.", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWeight <= 0 || newWeight > 300) {
      showToast("Invalid Weight", "Please enter a valid weight between 1 kg and 300 kg.", "error");
      return;
    }

    const newEntry = {
      id: `m-${Date.now()}`,
      memberId: memberProfile ? memberProfile.id : "mem-1",
      date: new Date().toISOString().split("T")[0],
      weightKg: Number(newWeight),
      bodyFatPct: Number(newBodyFat),
      bmi: Number((newWeight / (1.75 * 1.75)).toFixed(1)),
    };
    const updated = [...measurements, newEntry];
    setMeasurements(updated);
    saveMeasurements(updated);

    updateProfile({ currentWeightKg: Number(newWeight) });
    showToast("Progress Logged!", "Added new body weight measurement.", "success");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "You",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages([...chatMessages, newMsg]);
    setInputMessage("");
  };

  const handleRenewalSuccess = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const newExpiry = d.toISOString().split("T")[0];
    updateProfile({ expiryDate: newExpiry, membershipStatus: "ACTIVE" });
    setSelectedPlanForRenewal(null);
    showToast("Membership Activated!", `Pass activated until ${newExpiry}`, "success");
  };

  // Member's invoices
  const memberInvoices = invoices.filter((i) => i.userId === user?.id);

  // Nutrition Macros
  const currentWeightVal = memberProfile?.currentWeightKg || 70;
  const targetWeightVal = memberProfile?.targetWeightKg || 68;
  const dailyCalories = dietPlan?.dailyCalorieTarget || 2200;
  const proteinGrams = dietPlan?.dailyProteinTarget || 150;
  const carbsGrams = dietPlan?.dailyCarbsTarget || 225;
  const fatsGrams = dietPlan?.dailyFatsTarget || 60;
  const waterLiters = memberProfile?.waterLitersTarget || 3.0;

  // Selected Day Workout Plan
  const selectedWorkoutDay = workoutPlan?.days.find((d) => d.dayNumber === selectedWorkoutDayNumber) || workoutPlan?.days[0];
  const totalWeeklyExercises = workoutPlan?.days.reduce((sum, d) => sum + d.exercises.length, 0) || 0;
  const completedWeeklyExercises = workoutPlan?.days.reduce((sum, d) => sum + d.exercises.filter((e) => e.completed).length, 0) || 0;
  const weeklyCompletionPct = totalWeeklyExercises > 0 ? Math.round((completedWeeklyExercises / totalWeeklyExercises) * 100) : 0;

  // Selected Day Diet Plan
  const activeDietDaysList = dietViewMode === "WEEKLY" ? (dietPlan?.weeklyPlan || []) : (dietPlan?.monthlyPlan || []);
  const selectedDietDay = activeDietDaysList.find((d) => d.dayNumber === selectedDietDayNumber) || activeDietDaysList[0];

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Onboarding Modal Trigger */}
      {showOnboardingModal && (
        <FitnessOnboardingModal onClose={() => setShowOnboardingModal(false)} />
      )}

      {/* MEMBER ACCOUNT PROFILE & LOGOUT HEADER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || "Member Avatar"}
                width={64}
                height={64}
                className="rounded-2xl border-2 border-cyan-500/40 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-2xl font-display">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Online" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                Welcome back, {user?.name || "Member"}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                Member Account
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
              <span>📧 {user?.email || "N/A"}</span>
              {user?.phone && <span>• 📞 {user.phone}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => logout()}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            title="Logout from Member Account"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>

      {/* MEMBERSHIP STATUS BANNER / PROMPT */}
      {(() => {
        if (latestRequest?.status === "PENDING_VERIFICATION") {
          return (
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black uppercase flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4 text-amber-400" />
                    🟡 Payment Verification Pending
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  Payment Verification Pending
                </h2>
                <p className="text-sm text-amber-200/90 max-w-xl">
                  Your membership payment request has been submitted and is waiting for Owner verification.
                </p>
                {latestRequest.transactionRef && (
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {latestRequest.transactionRef} • Submitted for {latestRequest.plan?.name || "Membership Plan"} ({latestRequest.billingCycle})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 animate-spin" />
                  Verification Pending
                </button>
              </div>
            </div>
          );
        }

        if (latestRequest?.status === "APPROVED" || isMembershipActive) {
          return (
            <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 Membership Active
                    </span>
                    <span className="text-xs text-slate-400">• {daysRemaining} Days Remaining</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{currentPlan.name} Pass</h3>
                  <p className="text-xs text-slate-400">Payment Status: Paid • Expires: {expiryDateStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRegenerateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate Plans
                </button>
                <button
                  onClick={handleGeneratePass}
                  disabled={isLoadingPass}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center gap-2"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  View Membership Pass
                </button>
              </div>
            </div>
          );
        }

        if (latestRequest?.status === "REJECTED") {
          return (
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.25)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-black uppercase flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    🔴 Payment Request Rejected
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  Payment Request Rejected
                </h2>
                <p className="text-sm text-rose-200 max-w-xl">
                  Your membership payment request was not approved by the Owner.
                </p>
                {latestRequest.rejectionReason && (
                  <div className="bg-rose-950/50 p-2.5 rounded-xl border border-rose-800/40 text-xs text-rose-300">
                    <strong>Reason:</strong> {latestRequest.rejectionReason}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowManualModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105 shrink-0 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Payment Request Again
              </button>
            </div>
          );
        }

        return (
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border-2 border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-black uppercase flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Membership Payment Required
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Membership Payment Required
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Please select a membership plan and submit a payment request for Owner verification.
              </p>
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Select Membership Plan
            </button>
          </div>
        );
      })()}

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
        {(["OVERVIEW", "MEMBERSHIP", "WORKOUT", "NUTRITION", "PROGRESS", "MESSAGES", "INVOICES", "PAYMENTS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab
                ? "bg-cyan-500 text-slate-950 shadow-neon font-black"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tab === "MEMBERSHIP" ? "MY MEMBERSHIP & PASS" : tab === "WORKOUT" ? "MY WORKOUT PLAN" : tab === "NUTRITION" ? "MY DIET PLAN" : tab === "PAYMENTS" ? "PAYMENT HISTORY" : tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Weight</span>
              <div className="text-3xl font-black text-cyan-400 font-display">
                {currentWeightVal} kg
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Goal: {targetWeightVal} kg</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Daily Calorie Target</span>
              <div className="text-3xl font-black text-emerald-400 font-display">
                {dailyCalories} kcal
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Goal: {memberProfile?.dietGoal || "Muscle Gain"}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Daily Protein Target</span>
              <div className="text-3xl font-black text-amber-400 font-display">
                {proteinGrams}g
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Food Pref: {memberProfile?.foodPreference || "Non-Vegetarian"}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Gym Turnstile Check-Ins</span>
              <div className="text-3xl font-black text-white font-display">{memberVisitsCount} Visits</div>
              <span className="text-[11px] text-cyan-400 font-semibold">Live Scanner Logs</span>
            </div>
          </div>

          {/* Quick Plan Summary Header Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Workout Split</span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    {workoutPlan?.workoutDays || 4} Days / Week
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-display">{workoutPlan?.splitTitle || "Personalized Split"}</h3>
                <p className="text-xs text-slate-400">
                  Weekly Progress: <strong className="text-cyan-400">{completedWeeklyExercises}/{totalWeeklyExercises} Exercises Done ({weeklyCompletionPct}%)</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("WORKOUT")}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon text-center"
                >
                  View Full Workout Plan →
                </button>
                {workoutPlan && (
                  <button
                    onClick={() => downloadWorkoutPlanPdf(user!, memberProfile, workoutPlan)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    title="Download Workout PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Diet Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Personalized Diet Plan</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    {dietPlan?.foodPreference || "Non-Vegetarian"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-display">
                  ₹{dietPlan?.dietBudget.toLocaleString("en-IN")} / {dietPlan?.dietBudgetPeriod}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: <strong className="text-emerald-400">{dailyCalories} kcal</strong> • Protein: <strong className="text-amber-400">{proteinGrams}g</strong> • Goal: <strong className="text-white">{dietPlan?.dietGoal}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("NUTRITION")}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase shadow-neon text-center"
                >
                  View Full Diet Plan →
                </button>
                {dietPlan && (
                  <button
                    onClick={() => downloadDietPlanPdf(user!, memberProfile, dietPlan)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    title="Download Diet PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Combined Master PDF Export Banner */}
          {(workoutPlan || dietPlan) && (
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Download Complete Master Fitness & Nutrition PDF</h4>
                  <p className="text-xs text-slate-400">
                    Get a single formatted document containing your personalized Workout Routine, Exercise Schedules, and Diet Plans.
                  </p>
                </div>
              </div>

              <button
                onClick={() => downloadCombinedFitnessPlanPdf(user!, memberProfile, workoutPlan, dietPlan)}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon shrink-0 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Master PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MY MEMBERSHIP & PASS TAB */}
      {activeTab === "MEMBERSHIP" && (
        <div className="space-y-8">
          {/* Main Membership Status Banner & Action Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Fitness Drive Gym Arena Membership Life-Cycle
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                  My Membership & Pass Verification
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Track your payment verification requests, admin approval status, active duration dates, and access your official digital reception pass.
                </p>
              </div>

              <button
                onClick={() => setShowManualModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105 shrink-0 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Verification Request
              </button>
            </div>

            {/* Verification Status Banners */}
            {!latestRequest && !isMembershipActive && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-400">
                  <Info className="w-5 h-5" />
                  <span>Membership Payment Required</span>
                </div>
                <p className="text-xs text-amber-200/90">
                  You have not submitted any membership payment request yet. Select a membership plan and submit your manual payment details to request Owner verification.
                </p>
                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Select Membership Plan
                </button>
              </div>
            )}

            {latestRequest?.status === "PENDING_VERIFICATION" && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-400">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>🟡 Payment Verification Pending</span>
                </div>
                <p className="text-xs text-amber-200/90">
                  Your membership payment request has been submitted and is waiting for Owner verification.
                </p>
                <div className="text-[11px] text-amber-300/70 font-mono bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 inline-block">
                  Plan: {latestRequest.plan?.name || "Gym Plan"} ({latestRequest.billingCycle}) • Amount: ₹{latestRequest.amount} • Ref: {latestRequest.transactionRef} • Submitted: {new Date(latestRequest.requestDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {(latestRequest?.status === "APPROVED" || isMembershipActive) && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-300 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>🟢 Membership Active</span>
                  </div>
                  <p className="text-xs text-emerald-200/90">
                    Your {latestRequest?.plan?.name || currentPlan.name} membership payment has been verified and your membership is now active.
                  </p>
                  <div className="text-[11px] text-emerald-300/80 font-mono bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 inline-block">
                    Payment Status: Paid • Ref: {latestRequest?.transactionRef || "VERIFIED"} • Expires: {expiryDateStr}
                  </div>
                </div>

                <button
                  onClick={handleGeneratePass}
                  disabled={isLoadingPass}
                  className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105 shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Membership Pass</span>
                </button>
              </div>
            )}

            {latestRequest?.status === "REJECTED" && (
              <div className="p-6 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-300 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-extrabold text-rose-400">
                  <XCircle className="w-5 h-5" />
                  <span>🔴 Payment Request Rejected</span>
                </div>
                <p className="text-xs text-rose-200">
                  Your membership payment request was not approved by the Owner.
                </p>
                {latestRequest.rejectionReason && (
                  <div className="bg-rose-950/50 p-3 rounded-xl border border-rose-800/50 text-xs text-rose-200">
                    <strong>Admin Rejection Reason:</strong> {latestRequest.rejectionReason}
                  </div>
                )}
                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-neon inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Payment Request Again
                </button>
              </div>
            )}

            {/* Current Active Plan Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Current Plan</span>
                <span className="text-base font-black text-white">{currentPlan.name}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Verification Status</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-block ${
                  latestRequest?.status === "APPROVED" || isMembershipActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : latestRequest?.status === "PENDING_VERIFICATION"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : latestRequest?.status === "REJECTED"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {latestRequest?.status || (isMembershipActive ? "ACTIVE" : "EXPIRED")}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Days Remaining</span>
                <span className="text-base font-black text-cyan-400">{daysRemaining} Days</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Expiry Date</span>
                <span className="text-base font-black text-emerald-400 font-mono">{expiryDateStr}</span>
              </div>
            </div>
          </div>

          {/* Verification Request History */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white font-display">Verification Request History</h3>
              <span className="text-xs text-slate-400 font-mono font-bold">{verificationRequests.length} Records</span>
            </div>

            {verificationRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <CreditCard className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">No payment verification requests submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Plan Name</th>
                      <th className="p-4">Billing Cycle</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Transaction Ref</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Request Date</th>
                      <th className="p-4 text-right">Pass Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {verificationRequests.map((reqItem) => (
                      <tr key={reqItem.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-extrabold text-white">{reqItem.plan?.name || "Gym Plan"}</td>
                        <td className="p-4 font-bold text-cyan-400">{reqItem.billingCycle}</td>
                        <td className="p-4 font-black text-white">₹{reqItem.amount}</td>
                        <td className="p-4 font-mono text-slate-400">{reqItem.transactionRef}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              reqItem.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : reqItem.status === "PENDING_VERIFICATION"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {reqItem.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(reqItem.requestDate).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          {reqItem.status === "APPROVED" ? (
                            <button
                              onClick={handleGeneratePass}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold text-[11px] transition-all inline-flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              View Pass
                            </button>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Pass Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY WORKOUT PLAN TAB */}
      {activeTab === "WORKOUT" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase">
                  {workoutPlan?.workoutDays || 4} Days / Week
                </span>
                <span className="text-xs text-slate-400">• Dynamic Exercise Selection Engine</span>
              </div>
              <h2 className="text-2xl font-black text-white font-display">{workoutPlan?.splitTitle || "My Workout Split"}</h2>
              <p className="text-xs text-slate-400">
                Exercises selected automatically from the Fitness Drive exercise database.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Plan
              </button>
              {workoutPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadWorkoutPlanPdf(user!, memberProfile, workoutPlan)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-2"
                    title="Download Workout Only PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Workout PDF</span>
                  </button>
                  <button
                    onClick={() => downloadCombinedFitnessPlanPdf(user!, memberProfile, workoutPlan, dietPlan)}
                    className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center gap-2"
                    title="Download Master Combined (Workout + Diet) PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Combined Master PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-bold text-white">Weekly Exercise Progress</span>
                <span className="text-slate-400 block text-[11px]">
                  {completedWeeklyExercises} of {totalWeeklyExercises} exercises completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-1/3">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${weeklyCompletionPct}%` }}
                />
              </div>
              <span className="font-black text-cyan-400 font-display">{weeklyCompletionPct}%</span>
            </div>
          </div>

          {/* Day Tabs Selector & Selected Day Content */}
          {!workoutPlan || !workoutPlan.days || workoutPlan.days.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <Dumbbell className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-bold text-white font-display">No Workout Plan Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your personalized workout plan can be generated dynamically based on your physical details and fitness goals.
              </p>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Dynamic Workout Plan</span>
              </button>
            </div>
          ) : (
            <>
              {/* Day Tabs Selector */}
              <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
                {workoutPlan.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedWorkoutDayNumber(day.dayNumber)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                      selectedWorkoutDayNumber === day.dayNumber
                        ? "bg-cyan-500 text-slate-950 font-black shadow-neon"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{day.dayName}</span>
                    {day.isRestDay ? (
                      <span className="text-[10px] opacity-75">(REST)</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/40 text-slate-200">
                        {day.exercises.filter((e) => e.completed).length}/{day.exercises.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Day Content */}
              {selectedWorkoutDay && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-cyan-400">{selectedWorkoutDay.dayName} Routine</span>
                  <h3 className="text-2xl font-black text-white font-display">{selectedWorkoutDay.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedWorkoutDay.muscleGroups.map((mg) => (
                      <span key={mg} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                        {mg}
                      </span>
                    ))}
                  </div>
                </div>

                {!selectedWorkoutDay.isRestDay && (
                  <button
                    onClick={() => handleToggleDayCompletion(selectedWorkoutDay.dayNumber)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                      selectedWorkoutDay.isCompleted
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-white hover:bg-cyan-500 hover:text-slate-950"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedWorkoutDay.isCompleted ? "Day Completed ✓" : "Mark Day Complete"}
                  </button>
                )}
              </div>

              {selectedWorkoutDay.isRestDay ? (
                <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <Flame className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                  <h4 className="text-xl font-bold text-white font-display">REST & RECOVERY DAY</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Rest days are crucial for muscle hypertrophy and central nervous system recovery. Hydrate well, maintain your protein intake, and aim for 8 hours of quality sleep.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedWorkoutDay.exercises.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                        ex.completed
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                          : "bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex gap-4 items-start">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                            {ex.imageUrl ? (
                              <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                            ) : (
                              <Dumbbell className="w-8 h-8 text-cyan-400 m-auto mt-6" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase block">Exercise #{idx + 1}</span>
                            <h4 className="text-base font-bold text-white">{ex.name}</h4>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
                              Target: {ex.targetMuscle}
                            </span>
                          </div>
                        </div>

                        {/* Sets / Reps / Rest Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Sets</span>
                            <span className="font-bold text-white">{ex.sets}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Reps</span>
                            <span className="font-bold text-cyan-400">{ex.reps}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Rest</span>
                            <span className="font-bold text-white">{ex.restSeconds}s</span>
                          </div>
                        </div>

                        {ex.instructions && (
                          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                            {ex.instructions}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleExerciseCompletion(selectedWorkoutDay.dayNumber, ex.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 mt-2 ${
                          ex.completed
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-slate-950"
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                        {ex.completed ? "Exercise Completed ✓" : "Mark Exercise Done"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )}

      {/* MY DIET PLAN TAB */}
      {activeTab === "NUTRITION" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
                  {dietPlan?.foodPreference || "Non-Vegetarian"}
                </span>
                <span className="text-xs text-slate-400">• Goal: {dietPlan?.dietGoal}</span>
              </div>
              <h2 className="text-2xl font-black text-white font-display">Personalized Nutrition & Diet Plan</h2>
              <p className="text-xs text-slate-400">
                Tailored for ₹{dietPlan?.dietBudget.toLocaleString("en-IN")} / {dietPlan?.dietBudgetPeriod} budget.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Diet
              </button>
              {dietPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadDietPlanPdf(user!, memberProfile, dietPlan)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold flex items-center gap-2"
                    title="Download Diet Only PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Diet PDF</span>
                  </button>
                  <button
                    onClick={() => downloadCombinedFitnessPlanPdf(user!, memberProfile, workoutPlan, dietPlan)}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center gap-2"
                    title="Download Master Combined (Workout + Diet) PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span>Combined Master PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Calculated Macro Targets Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <Flame className="w-6 h-6 text-emerald-400 mx-auto" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Calories</span>
              <span className="text-2xl font-black text-white font-display block">{dailyCalories} kcal</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Calculated TDEE</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <Dumbbell className="w-6 h-6 text-cyan-400 mx-auto" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Protein Target</span>
              <span className="text-2xl font-black text-cyan-400 font-display block">{proteinGrams} g</span>
              <span className="text-[10px] text-slate-400 font-semibold">1.8g / kg Body Weight</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <Activity className="w-6 h-6 text-amber-400 mx-auto" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Carbohydrates</span>
              <span className="text-2xl font-black text-amber-400 font-display block">{carbsGrams} g</span>
              <span className="text-[10px] text-slate-400 font-semibold">Complex Fuel</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <HeartPulse className="w-6 h-6 text-rose-400 mx-auto" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Healthy Fats</span>
              <span className="text-2xl font-black text-rose-400 font-display block">{fatsGrams} g</span>
              <span className="text-[10px] text-slate-400 font-semibold">Hormone Support</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
              <Wallet className="w-6 h-6 text-emerald-300 mx-auto" />
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Cost</span>
              <span className="text-2xl font-black text-emerald-300 font-display block">₹{dietPlan?.weeklyEstimatedCost} / wk</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Within Budget</span>
            </div>
          </div>

          {/* View Mode Selector (Weekly vs Monthly) */}
          <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDietViewMode("WEEKLY");
                  setSelectedDietDayNumber(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  dietViewMode === "WEEKLY" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Weekly Schedule (7 Days)
              </button>
              <button
                onClick={() => {
                  setDietViewMode("MONTHLY");
                  setSelectedDietDayNumber(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  dietViewMode === "MONTHLY" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Plan (30 Days)
              </button>
            </div>
          </div>

          {/* Day Selector Bar & Selected Day Meals Grid */}
          {!dietPlan || !activeDietDaysList || activeDietDaysList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <Utensils className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-bold text-white font-display">No Diet Plan Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your personalized nutrition plan can be generated dynamically based on your food preferences and daily caloric targets.
              </p>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Dynamic Diet Plan</span>
              </button>
            </div>
          ) : (
            <>
              {/* Day Selector Bar */}
              <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
                {activeDietDaysList.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDietDayNumber(day.dayNumber)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                      selectedDietDayNumber === day.dayNumber
                        ? "bg-emerald-500 text-slate-950 font-black shadow-neon"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {day.dayName}
                  </button>
                ))}
              </div>

              {/* Selected Day Meals Grid */}
              {selectedDietDay && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">{selectedDietDay.dayName} Meals</span>
                  <h3 className="text-xl font-black text-white font-display">Daily Meal Plan</h3>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-white block">Total: {selectedDietDay.totalCalories} kcal</span>
                  <span className="text-emerald-400 font-semibold">{selectedDietDay.totalProtein}g Protein • Est. ₹{selectedDietDay.totalCostInr}/day</span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedDietDay.meals.map((meal, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          {meal.mealType}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{meal.name}</h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-emerald-400">{meal.calories} kcal</span>
                        <span className="font-bold text-amber-400">{meal.proteinGrams}g Protein</span>
                        <span className="font-bold text-slate-300">₹{meal.approxCostInr}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Portion & Ingredients:</span>
                      <p className="text-slate-300 font-medium">{meal.items.join(" • ")}</p>
                      <span className="text-[11px] text-slate-400 font-semibold block">Serving Size: {meal.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )}

      {/* PROGRESS TAB */}
      {activeTab === "PROGRESS" && (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase">Body Mass Progression</span>
                <h3 className="text-xl font-bold text-white font-display">Weight Trend (kg)</h3>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={measurements}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="weightKg" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Record Body Metrics</h3>
            <form onSubmit={handleAddMeasurement} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Body Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon"
                >
                  Record Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === "MESSAGES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Direct Chat with Coach</h3>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-80 overflow-y-auto space-y-3 text-xs">
            {chatMessages.length === 0 ? (
              <div className="py-24 text-center text-slate-500 text-xs">
                No chat messages yet. Type your message below to consult your personal coach.
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-md ${
                    msg.sender === "You"
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 ml-auto"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-[10px] mb-1">
                    <span>{msg.sender}</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type message to trainer..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === "INVOICES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white">Membership Invoices & Receipts</h3>

          {memberInvoices.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Payment Receipts Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Payment invoices and printable receipts will appear here once membership fees are paid or renewed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {memberInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-cyan-400 block">{inv.invoiceNumber}</span>
                    <span className="text-white font-bold">{inv.planName}</span>
                    <span className="text-slate-500 block">Issued: {formatDate(inv.issuedDate)}</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-sm font-extrabold text-white block">{formatCurrency(inv.totalAmount)}</span>
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-cyan-400 text-[11px] font-bold"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedInvoice && (
            <div className="pt-4">
              <PrintableInvoice invoice={selectedInvoice} />
            </div>
          )}
        </div>
      )}

      {/* PAYMENTS TAB (Razorpay Integration) */}
      {activeTab === "PAYMENTS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                Razorpay Payment History
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time verified transaction history, Razorpay Order IDs, and payment status records.
              </p>
            </div>
            <button
              onClick={fetchPaymentHistory}
              disabled={isLoadingPayments}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPayments ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isLoadingPayments ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading payment records from server...</p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="py-16 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Razorpay Payments Recorded</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Once you purchase or renew a gym membership via Razorpay, your order receipt details will be displayed here.
              </p>
              <Link
                href="/membership"
                className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase shadow-neon"
              >
                Browse Membership Plans
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Plan / Item</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {paymentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono font-bold text-cyan-400">
                        {item.orderId}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {item.planName}
                      </td>
                      <td className="p-4 font-black text-white">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="p-4 font-semibold text-slate-400 uppercase text-[10px]">
                        {item.payment?.method || "Razorpay"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            item.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : item.status === "FAILED"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : item.status === "REFUNDED"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/payment/status?orderId=${encodeURIComponent(item.orderId)}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PLAN REGENERATION MODAL WITH CONFIRMATION */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden touch-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto relative z-10">
            <div className="space-y-2 pb-4 border-b border-slate-800 shrink-0">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <RefreshCw className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-white font-display">Regenerate Workout & Diet Plans</h3>
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                ⚠️ <strong>Confirmation Required:</strong> Generating new plans will replace your active schedules using your latest biometrics & preferences.
              </p>
            </div>

            <form onSubmit={handleConfirmRegenerate} className="space-y-4 text-xs overflow-y-auto overscroll-contain touch-pan-y flex-1 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Workout Days Per Week</label>
                  <select
                    value={regenDays}
                    onChange={(e) => setRegenDays(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value={3}>3 Days Per Week</option>
                    <option value={4}>4 Days Per Week</option>
                    <option value={5}>5 Days Per Week</option>
                    <option value={6}>6 Days Per Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Experience Level</label>
                  <select
                    value={regenExperience}
                    onChange={(e) => setRegenExperience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Beginner">Beginner (0-6 months)</option>
                    <option value="Intermediate">Intermediate (6-24 months)</option>
                    <option value="Advanced">Advanced (2+ years)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Equipment Availability</label>
                  <select
                    value={regenEquipment}
                    onChange={(e) => setRegenEquipment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Full Gym">Full Gym Access</option>
                    <option value="Dumbbells Only">Dumbbells & Bench Only</option>
                    <option value="Home / Bodyweight">Home / Bodyweight Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Preferred Workout Type</label>
                  <select
                    value={regenWorkoutType}
                    onChange={(e) => setRegenWorkoutType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Hypertrophy">Hypertrophy / Muscle Building</option>
                    <option value="Strength">Strength & Heavy Power</option>
                    <option value="Fat Loss / HIIT">Fat Loss & HIIT Circuits</option>
                    <option value="Calisthenics">Calisthenics & Bodyweight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Food Preference</label>
                  <select
                    value={regenFoodPref}
                    onChange={(e: any) => setRegenFoodPref(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Vegetarian">Vegetarian (No Eggs/Meat)</option>
                    <option value="Vegetarian + Eggs">Vegetarian + Eggs</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Fitness / Diet Goal</label>
                  <select
                    value={regenGoal}
                    onChange={(e: any) => setRegenGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Food Budget (₹)</label>
                  <input
                    type="number"
                    value={regenBudget}
                    onChange={(e) => setRegenBudget(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Budget Period</label>
                  <select
                    value={regenBudgetPeriod}
                    onChange={(e: any) => setRegenBudgetPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Physical Limitations / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. knee care, back sensitivity, no overhead presses"
                  value={regenLimitations}
                  onChange={(e) => setRegenLimitations(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-3 pt-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRegenerateModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegenerating}
                  className="w-2/3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRegenerating ? "Regenerating..." : "Confirm & Regenerate Plans"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Checkout Modal */}
      {selectedPlanForRenewal && (
        <PaymentModal
          plan={selectedPlanForRenewal}
          billingCycle="MONTHLY"
          onClose={() => setSelectedPlanForRenewal(null)}
          onSuccess={handleRenewalSuccess}
        />
      )}

      {/* Manual Payment Verification Request Modal */}
      {showManualModal && (
        <ManualPaymentModal
          plan={currentPlan}
          billingCycle="MONTHLY"
          onClose={() => setShowManualModal(false)}
          onSuccess={() => {
            setShowManualModal(false);
            fetchVerificationRequests();
          }}
        />
      )}

      {/* Official Membership Digital Pass Card Modal */}
      {showPassModal && activePassData && (
        <MembershipPassCard
          pass={activePassData}
          onClose={() => setShowPassModal(false)}
        />
      )}
    </div>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Ruler,
  Weight,
  Flame,
  Utensils,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { FoodPreference, DietGoal, DietBudgetPeriod } from "@/types";

export default function SignupPage() {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Account Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Biometrics
  const [age, setAge] = useState<number | "">(25);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [heightCm, setHeightCm] = useState<number | "">(175);
  const [weightKg, setWeightKg] = useState<number | "">(70);

  // Step 3: Workout Days
  const [workoutDays, setWorkoutDays] = useState<3 | 4 | 5 | 6>(4);

  // Step 4: Diet & Budget
  const [foodPreference, setFoodPreference] = useState<FoodPreference>("Non-Vegetarian");
  const [dietGoal, setDietGoal] = useState<DietGoal>("Muscle Gain");
  const [dietBudget, setDietBudget] = useState<number | "">(7000);
  const [dietBudgetPeriod, setDietBudgetPeriod] = useState<DietBudgetPeriod>("MONTHLY");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Full name must be at least 2 characters.";
    }
    if (!email || !emailRegex.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (phone && phone.replace(/\D/g, "").length < 10) {
      errs.phone = "Phone number must be at least 10 digits.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);

    if (!age || isNaN(ageNum) || ageNum < 12 || ageNum > 100) {
      errs.age = "Please enter a valid age between 12 and 100.";
    }
    if (!heightCm || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      errs.heightCm = "Please enter a valid height in cm (100 - 250).";
    }
    if (!weightKg || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      errs.weightKg = "Please enter a valid weight in kg (30 - 300).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    const budgetNum = Number(dietBudget);

    if (!dietBudget || isNaN(budgetNum) || budgetNum < 500) {
      errs.dietBudget = "Please enter a valid food budget (min ₹500).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as any);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) {
      showToast("Validation Error", "Please check your budget amount.", "error");
      return;
    }

    setIsSubmitting(true);

    const extraData = {
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      workoutDays: Number(workoutDays),
      foodPreference,
      dietGoal,
      dietBudget: Number(dietBudget),
      dietBudgetPeriod,
    };

    const result = await register(name.trim(), email.trim(), phone.trim(), password, extraData);

    if (result.success) {
      showToast("Registration Successful!", `Personalized Workout & Diet Plans generated for ${name}!`, "success");
      router.push("/dashboard/member");
    } else {
      setIsSubmitting(false);
      showToast("Registration Failed", result.message || "Registration failed. Account may already exist.", "error");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-xl w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit mx-auto">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Create Your Member Account</h2>
          <p className="text-xs text-slate-400">
            Fill in your details to automatically receive your personalized **Workout & Diet Plans**.
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-b border-slate-800 pb-4 text-center text-[10px] font-bold">
          <div className={`p-2 rounded-xl border transition-all ${step === 1 ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            1. Account
          </div>
          <div className={`p-2 rounded-xl border transition-all ${step === 2 ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            2. Biometrics
          </div>
          <div className={`p-2 rounded-xl border transition-all ${step === 3 ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            3. Workout
          </div>
          <div className={`p-2 rounded-xl border transition-all ${step === 4 ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
            4. Diet & Budget
          </div>
        </div>

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Full Name *</label>
              <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border transition-colors ${errors.name ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                <User className="w-4 h-4 text-slate-500 shrink-0 mr-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Harsha Vardhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-400 mt-1 block">{errors.name}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email Address *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border transition-colors ${errors.email ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Mail className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                {errors.email && <span className="text-[10px] text-rose-400 mt-1 block">{errors.email}</span>}
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Phone Number</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border transition-colors ${errors.phone ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Phone className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                {errors.phone && <span className="text-[10px] text-rose-400 mt-1 block">{errors.phone}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Password *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border transition-colors ${errors.password ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                {errors.password && <span className="text-[10px] text-rose-400 mt-1 block">{errors.password}</span>}
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Confirm Password *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border transition-colors ${errors.confirmPassword ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                {errors.confirmPassword && <span className="text-[10px] text-rose-400 mt-1 block">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all flex items-center justify-center gap-2 mt-4"
            >
              Continue to Biometrics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Body Biometrics */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Step 2: Enter Body Measurements</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Age (Years) *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border ${errors.age ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : "")}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
                {errors.age && <span className="text-[10px] text-rose-400 mt-1 block">{errors.age}</span>}
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Height (cm) *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border ${errors.heightCm ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Ruler className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? parseFloat(e.target.value) : "")}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
                {errors.heightCm && <span className="text-[10px] text-rose-400 mt-1 block">{errors.heightCm}</span>}
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Weight (kg) *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border ${errors.weightKg ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Weight className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : "")}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
                {errors.weightKg && <span className="text-[10px] text-rose-400 mt-1 block">{errors.weightKg}</span>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center justify-center gap-2"
              >
                Next: Workout Schedule <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Workout Days */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Step 3: Select Workout Frequency</h3>
            <p className="text-slate-400 text-[11px]">How many days do you work out per week?</p>

            <div className="grid grid-cols-2 gap-3">
              {[3, 4, 5, 6].map((daysCount) => (
                <button
                  key={daysCount}
                  type="button"
                  onClick={() => setWorkoutDays(daysCount as any)}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                    workoutDays === daysCount
                      ? "bg-cyan-500/10 border-cyan-400 text-white ring-2 ring-cyan-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-cyan-400">{daysCount} Days</span>
                    {workoutDays === daysCount && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {daysCount === 3 && "3-Day Full Body Foundation Split"}
                    {daysCount === 4 && "4-Day Hypertrophy & Power Split"}
                    {daysCount === 5 && "5-Day Advanced Bodybuilding Split"}
                    {daysCount === 6 && "6-Day High-Frequency Push/Pull/Legs"}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon flex items-center justify-center gap-2"
              >
                Next: Diet & Budget <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Diet Information & Budget */}
        {step === 4 && (
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Step 4: Personalized Diet & Budget</h3>

            {/* Food Preference */}
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Food Preference *</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Vegetarian", "Vegetarian + Eggs", "Non-Vegetarian"] as FoodPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFoodPreference(pref)}
                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                      foodPreference === pref
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Goal */}
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Fitness / Diet Goal *</label>
              <select
                value={dietGoal}
                onChange={(e: any) => setDietGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-400"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General Fitness">General Fitness</option>
              </select>
            </div>

            {/* Budget & Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Food Budget (INR ₹) *</label>
                <div className={`flex items-center px-4 py-3 rounded-xl bg-slate-950 border ${errors.dietBudget ? "border-rose-500" : "border-slate-800 focus-within:border-cyan-400"}`}>
                  <Wallet className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    type="number"
                    placeholder="e.g. 7000"
                    value={dietBudget}
                    onChange={(e) => setDietBudget(e.target.value ? parseFloat(e.target.value) : "")}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
                {errors.dietBudget && <span className="text-[10px] text-rose-400 mt-1 block">{errors.dietBudget}</span>}
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Budget Period</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDietBudgetPeriod("MONTHLY")}
                    className={`py-2 text-[10px] font-bold rounded-lg ${dietBudgetPeriod === "MONTHLY" ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietBudgetPeriod("WEEKLY")}
                    className={`py-2 text-[10px] font-bold rounded-lg ${dietBudgetPeriod === "WEEKLY" ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Budget Chips */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="text-slate-500 uppercase font-bold my-auto">Quick Presets:</span>
              {[5000, 7000, 10000, 15000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDietBudget(amt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-colors"
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Generating Plans..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Register & Access Plans
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-cyan-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

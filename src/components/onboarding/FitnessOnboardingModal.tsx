"use client";

import React, { useState } from "react";
import { Dumbbell, Scale, Target, Activity, HeartPulse, Flame, Droplets, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { getStoredMeasurements, saveMeasurements } from "@/lib/storage";

interface FitnessOnboardingModalProps {
  onClose: () => void;
}

export function FitnessOnboardingModal({ onClose }: FitnessOnboardingModalProps) {
  const { user, memberProfile, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [currentWeight, setCurrentWeight] = useState<string>(memberProfile?.currentWeightKg?.toString() || "75");
  const [targetWeight, setTargetWeight] = useState<string>(memberProfile?.targetWeightKg?.toString() || "70");
  const [heightCm, setHeightCm] = useState<string>(memberProfile?.heightCm?.toString() || "175");
  const [age, setAge] = useState<string>(memberProfile?.age?.toString() || "25");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">((memberProfile?.gender as any) || "Male");
  const [activityLevel, setActivityLevel] = useState<
    "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active"
  >((memberProfile?.activityLevel as any) || "Moderate");
  const [fitnessGoal, setFitnessGoal] = useState<"Weight Loss" | "Muscle Gain" | "Maintenance" | "Endurance">(
    (memberProfile?.fitnessGoal as any) || "Weight Loss"
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const w = parseFloat(currentWeight);
    const tw = parseFloat(targetWeight);
    const h = parseFloat(heightCm);
    const a = parseInt(age);

    if (isNaN(w) || w < 30 || w > 300) {
      errs.currentWeight = "Enter a valid current weight between 30 kg and 300 kg";
    }
    if (isNaN(tw) || tw < 30 || tw > 300) {
      errs.targetWeight = "Enter a valid target weight between 30 kg and 300 kg";
    }
    if (isNaN(h) || h < 100 || h > 250) {
      errs.heightCm = "Enter a valid height between 100 cm and 250 cm";
    }
    if (isNaN(a) || a < 12 || a > 100) {
      errs.age = "Enter a valid age between 12 and 100";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Validation Error", "Please correct the highlighted fields before submitting.", "error");
      return;
    }

    const weightKgNum = parseFloat(currentWeight);
    const targetWeightKgNum = parseFloat(targetWeight);
    const heightCmNum = parseFloat(heightCm);
    const ageNum = parseInt(age);

    // 1. Calculate BMR (Mifflin-St Jeor)
    const bmr =
      gender === "Male"
        ? 10 * weightKgNum + 6.25 * heightCmNum - 5 * ageNum + 5
        : 10 * weightKgNum + 6.25 * heightCmNum - 5 * ageNum - 161;

    // 2. Activity Multipliers
    const activityMultipliers = {
      Sedentary: 1.2,
      Light: 1.375,
      Moderate: 1.55,
      Active: 1.725,
      "Very Active": 1.9,
    };
    const tdee = bmr * activityMultipliers[activityLevel];

    // 3. Goal Calorie Adjustment
    let targetCalories = tdee;
    if (fitnessGoal === "Weight Loss") {
      targetCalories = tdee - 500;
    } else if (fitnessGoal === "Muscle Gain") {
      targetCalories = tdee + 350;
    }
    targetCalories = Math.max(1200, Math.round(targetCalories));

    // 4. Macro Calculation
    const proteinGrams = Math.round(weightKgNum * 2.0); // 2g per kg
    const fatCalories = targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);
    const carbCalories = targetCalories - proteinGrams * 4 - fatGrams * 9;
    const carbGrams = Math.max(50, Math.round(carbCalories / 4));
    const waterLiters = parseFloat((weightKgNum * 0.035).toFixed(1));

    // 5. Update Profile
    updateProfile({
      currentWeightKg: weightKgNum,
      targetWeightKg: targetWeightKgNum,
      heightCm: heightCmNum,
      age: ageNum,
      gender: gender,
      activityLevel: activityLevel,
      fitnessGoal: fitnessGoal,
      dailyCalorieTarget: targetCalories,
      proteinGramsTarget: proteinGrams,
      carbsGramsTarget: carbGrams,
      fatsGramsTarget: fatGrams,
      waterLitersTarget: waterLiters,
      hasCompletedOnboarding: true,
    });

    // 6. Log Initial Measurement in Progress Store
    if (memberProfile?.id) {
      const existing = getStoredMeasurements();
      const newMeasurement = {
        id: `meas-${Date.now()}`,
        memberId: memberProfile.id,
        date: new Date().toISOString().split("T")[0],
        weightKg: weightKgNum,
        bodyFatPct: 15.0,
      };
      saveMeasurements([newMeasurement, ...existing]);
    }

    showToast("Metrics Calculated!", `Daily target set: ${targetCalories} kcal & ${proteinGrams}g protein`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <HeartPulse className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">Personalized Fitness & Nutrition Setup</h3>
              <p className="text-xs text-slate-400">Calculate your exact daily caloric and macronutrient targets</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
          {/* Weight Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                Current Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="e.g. 75"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors ${
                  errors.currentWeight ? "border-rose-500" : "border-slate-800"
                }`}
              />
              {errors.currentWeight && <span className="text-[10px] text-rose-400 mt-1 block">{errors.currentWeight}</span>}
            </div>

            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Target Goal Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="e.g. 70"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors ${
                  errors.targetWeight ? "border-rose-500" : "border-slate-800"
                }`}
              />
              {errors.targetWeight && <span className="text-[10px] text-rose-400 mt-1 block">{errors.targetWeight}</span>}
            </div>
          </div>

          {/* Height & Age Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                Height (cm) *
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors ${
                  errors.heightCm ? "border-rose-500" : "border-slate-800"
                }`}
              />
              {errors.heightCm && <span className="text-[10px] text-rose-400 mt-1 block">{errors.heightCm}</span>}
            </div>

            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                Age (years) *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors ${
                  errors.age ? "border-rose-500" : "border-slate-800"
                }`}
              />
              {errors.age && <span className="text-[10px] text-rose-400 mt-1 block">{errors.age}</span>}
            </div>

            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Activity & Fitness Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Daily Activity Level *
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option value="Sedentary">Sedentary (Office job, minimal exercise)</option>
                <option value="Light">Light (Workout 1-3 days/week)</option>
                <option value="Moderate">Moderate (Workout 3-5 days/week)</option>
                <option value="Active">Active (Workout 6-7 days/week)</option>
                <option value="Very Active">Very Active (Heavy athletic training)</option>
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Primary Fitness Goal *
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option value="Weight Loss">Weight Loss (-500 kcal deficit)</option>
                <option value="Muscle Gain">Muscle Gain (+350 kcal surplus)</option>
                <option value="Maintenance">Maintain Weight & Recomp</option>
                <option value="Endurance">Athletic Endurance & Stamina</option>
              </select>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Your daily macronutrients (Calories, Protein, Carbs, Fats, and Water Intake) will be dynamically calculated and synced across your dashboard and nutrition plan.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-[1.01]"
          >
            Calculate & Save Nutrition Protocol
          </button>
        </form>
      </div>
    </div>
  );
}

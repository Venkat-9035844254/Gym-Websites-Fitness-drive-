"use client";

import React, { useState } from "react";
import { calculateBMI } from "@/lib/utils";
import { Calculator, Activity, HeartPulse, Sparkles, Scale, Info } from "lucide-react";

export function BMICalculator() {
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // Light activity

  const bmiResult = calculateBMI(heightCm, weightKg);

  // BMR Calculation (Mifflin-St Jeor)
  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * activityLevel);
  const proteinTargetGrams = Math.round(weightKg * 2.0); // 2g per kg

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Interactive Suite</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
            Fitness & Body Metric Calculator
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  gender === "male"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  gender === "female"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Height Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5"><Scale className="w-4 h-4 text-cyan-400" /> Height</span>
              <span className="text-cyan-400 font-mono text-sm font-bold">{heightCm} cm</span>
            </div>
            <input
              type="range"
              min="130"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-cyan-400" /> Weight</span>
              <span className="text-cyan-400 font-mono text-sm font-bold">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Age Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
              <span>Age</span>
              <span className="text-cyan-400 font-mono text-sm font-bold">{age} yrs</span>
            </div>
            <input
              type="range"
              min="16"
              max="80"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Daily Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-400 outline-none"
            >
              <option value={1.2}>Sedentary (Little or no workout)</option>
              <option value={1.375}>Lightly Active (1–3 gym sessions/wk)</option>
              <option value={1.55}>Moderately Active (3–5 heavy sessions/wk)</option>
              <option value={1.725}>Very Active (6–7 intense workouts/wk)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Metric Gauges */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Calculated BMI Score
            </div>
            <div className="text-5xl font-black font-display text-white tracking-tight">
              {bmiResult.bmi}
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold border" style={{ backgroundColor: "rgba(0,240,255,0.1)" }}>
              <span className={bmiResult.colorClass}>{bmiResult.category}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed px-2">
              {bmiResult.interpretation}
            </p>

            {/* BMI Bar Spectrum */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-amber-400 w-1/4 h-full" title="Underweight (<18.5)" />
              <div className="bg-emerald-400 w-1/3 h-full" title="Normal (18.5 - 24.9)" />
              <div className="bg-amber-500 w-1/4 h-full" title="Overweight (25 - 29.9)" />
              <div className="bg-rose-500 w-1/6 h-full" title="Obese (30+)" />
            </div>
          </div>

          {/* Caloric & Protein Recommendations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Maintenance TDEE</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{tdee} kcal</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Daily Protein</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{proteinTargetGrams}g</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>This calculation provides general informational estimates, not individualized medical advice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

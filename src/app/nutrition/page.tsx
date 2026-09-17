"use client";

import React from "react";
import { INITIAL_NUTRITION_PLANS } from "@/lib/seedData";
import { HeartPulse, Flame, PieChart, CheckCircle2, ShieldAlert, Droplets, Dumbbell, Activity, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function NutritionPage() {
  const { user, memberProfile } = useAuth();

  const calories = memberProfile?.dailyCalorieTarget || 2200;
  const protein = memberProfile?.proteinGramsTarget || 150;
  const carbs = memberProfile?.carbsGramsTarget || 225;
  const fats = memberProfile?.fatsGramsTarget || 60;
  const water = memberProfile?.waterLitersTarget || 2.6;

  const sampleMeals = [
    {
      mealType: "Breakfast",
      name: "High Protein Muscle Oats",
      calories: Math.round(calories * 0.25),
      protein: Math.round(protein * 0.25),
      carbs: Math.round(carbs * 0.35),
      fats: Math.round(fats * 0.2),
      description: "Rolled oats, whey isolate, sliced banana, crushed almonds, and chia seeds.",
    },
    {
      mealType: "Lunch",
      name: "Grilled Chicken & Quinoa Bowl",
      calories: Math.round(calories * 0.35),
      protein: Math.round(protein * 0.35),
      carbs: Math.round(carbs * 0.35),
      fats: Math.round(fats * 0.3),
      description: "Lean chicken breast, organic quinoa, steamed broccoli, olive oil dressing, and sweet potato.",
    },
    {
      mealType: "Pre-Workout Fuel",
      name: "Complex Energy Shake",
      calories: Math.round(calories * 0.15),
      protein: Math.round(protein * 0.15),
      carbs: Math.round(carbs * 0.2),
      fats: Math.round(fats * 0.1),
      description: "Rice cakes, almond butter, berries, and BCAA electrolyte hydration blend.",
    },
    {
      mealType: "Dinner",
      name: "Baked Salmon & Asparagus Speared Meal",
      calories: Math.round(calories * 0.25),
      protein: Math.round(protein * 0.25),
      carbs: Math.round(carbs * 0.1),
      fats: Math.round(fats * 0.4),
      description: "Wild salmon fillet, roasted asparagus, avocado slices, and leafy green salad.",
    },
  ];

  return (
    <div className="w-full space-y-16 pb-20">
      <section className="bg-slate-900/60 border-b border-slate-800 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Nutritional Science Protocol</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
            MACRO & NUTRITION ENGINE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Optimal protein synthesis, glycemic index control, and caloric distribution engineered to fuel your training sessions.
          </p>
        </div>
      </section>

      {/* Protocol Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase text-cyan-400">
                {user ? `Personalized Protocol for ${user.name}` : "General Fitness Nutrition Standard"}
              </span>
              <h2 className="text-2xl font-black text-white font-display mt-1">
                {memberProfile?.fitnessGoal ? `${memberProfile.fitnessGoal} Nutrition Plan` : "High Performance Fuel Protocol"}
              </h2>
            </div>

            {user ? (
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Daily Energy</span>
                  <span className="text-base font-bold text-white">{calories} kcal</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                  <span className="text-cyan-400 block text-[10px]">Protein Target</span>
                  <span className="text-base font-bold text-cyan-400">{protein}g</span>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase shadow-neon"
              >
                Log In for Custom Macros →
              </Link>
            )}
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Flame className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Energy</span>
              <span className="text-lg font-black text-white">{calories} kcal</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Dumbbell className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Protein</span>
              <span className="text-lg font-black text-cyan-400">{protein}g</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Activity className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Carbs</span>
              <span className="text-lg font-black text-amber-400">{carbs}g</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Water</span>
              <span className="text-lg font-black text-blue-400">{water} L</span>
            </div>
          </div>

          {/* Meals List */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white font-display">Calculated Daily Meal Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleMeals.map((meal, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-cyan-400">{meal.mealType}</span>
                    <span className="text-xs font-mono text-slate-400">{meal.calories} kcal</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{meal.name}</h4>
                  <p className="text-xs text-slate-400">{meal.description}</p>
                  <div className="flex gap-4 text-[11px] pt-2 border-t border-slate-800/80 font-mono text-slate-300">
                    <span>P: <strong className="text-cyan-400">{meal.protein}g</strong></span>
                    <span>C: <strong className="text-amber-400">{meal.carbs}g</strong></span>
                    <span>F: <strong className="text-rose-400">{meal.fats}g</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Informational disclaimer: Nutrition protocols are general performance guidance calculated from personal body metrics. Consult a medical professional or registered dietitian for specific dietary requirements.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

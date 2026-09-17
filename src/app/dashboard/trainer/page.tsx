"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getStoredMembers,
  getStoredUsers,
  getStoredWorkouts,
  getStoredExercises,
  getStoredNutrition,
  saveWorkouts,
  saveNutrition
} from "@/lib/storage";
import {
  MemberProfile,
  WorkoutPlan,
  NutritionPlan,
  Exercise,
  WorkoutExerciseItem
} from "@/types";
import {
  Dumbbell,
  Users,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Apple,
  TrendingUp,
  FileText,
  UserCheck
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [exercises] = useState<Exercise[]>(getStoredExercises());
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(getStoredNutrition());

  const [activeTab, setActiveTab] = useState<"ROSTER" | "WORKOUT_BUILDER" | "NUTRITION_BUILDER">("ROSTER");

  // Workout builder form state
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutGoal, setWorkoutGoal] = useState<any>("Muscle Gain");
  const [workoutDesc, setWorkoutDesc] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [targetWeight, setTargetWeight] = useState(80);
  const [routineExercises, setRoutineExercises] = useState<WorkoutExerciseItem[]>([]);

  // Nutrition builder form state
  const [nutMemberId, setNutMemberId] = useState("");
  const [nutTitle, setNutTitle] = useState("");
  const [calories, setCalories] = useState(2850);
  const [protein, setProtein] = useState(195);
  const [carbs, setCarbs] = useState(320);
  const [fats, setFats] = useState(75);

  const loadData = () => {
    setMembers(getStoredMembers());
    setUsers(getStoredUsers());
    setWorkouts(getStoredWorkouts());
    setNutritionPlans(getStoredNutrition());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExerciseToRoutine = () => {
    const exObj = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];
    if (!exObj) return;

    const newItem: WorkoutExerciseItem = {
      exerciseId: exObj.id,
      exerciseName: exObj.name,
      sets: Number(sets),
      reps: Number(reps),
      restSeconds: 90,
      targetWeightKg: Number(targetWeight),
      isCompleted: false,
    };

    setRoutineExercises([...routineExercises, newItem]);
    showToast("Exercise Added", `Added ${exObj.name} to routine builder.`, "info");
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle || routineExercises.length === 0) {
      showToast("Missing Details", "Please specify a routine title and add at least 1 exercise.", "error");
      return;
    }

    const assignedMem = members.find((m) => m.id === selectedMemberId) || members[0];
    const newWp: WorkoutPlan = {
      id: `wp-${Date.now()}`,
      title: workoutTitle,
      description: workoutDesc || "Coach prescribed hypertrophy and strength routine.",
      trainerId: user?.id || "tr-1",
      trainerName: user?.name || "Marcus Vance",
      memberId: assignedMem ? assignedMem.id : undefined,
      targetGoal: workoutGoal,
      assignedDate: new Date().toISOString().split("T")[0],
      exercises: routineExercises,
    };

    const updated = [newWp, ...workouts];
    setWorkouts(updated);
    saveWorkouts(updated);

    showToast("Workout Program Assigned!", `Assigned "${workoutTitle}" to member.`, "success");
    setWorkoutTitle("");
    setRoutineExercises([]);
    loadData();
  };

  const handleCreateNutrition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutTitle) return;

    const assignedMem = members.find((m) => m.id === nutMemberId) || members[0];
    const newNp: NutritionPlan = {
      id: `np-${Date.now()}`,
      title: nutTitle,
      trainerId: user?.id || "tr-1",
      memberId: assignedMem ? assignedMem.id : undefined,
      calories: Number(calories),
      proteinGrams: Number(protein),
      carbsGrams: Number(carbs),
      fatsGrams: Number(fats),
      meals: [
        {
          mealType: "Breakfast",
          name: "High Protein Oats & Whey",
          description: "100g Oats, 1.5 scoops whey isolate, 30g blueberries.",
          calories: 600,
          protein: 45,
          carbs: 70,
          fats: 12,
        },
      ],
    };

    const updated = [newNp, ...nutritionPlans];
    setNutritionPlans(updated);
    saveNutrition(updated);

    showToast("Nutrition Protocol Assigned!", `Created "${nutTitle}" meal plan.`, "success");
    setNutTitle("");
    loadData();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Coach Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {user?.name || "Marcus Vance"}'s Coaching Hub
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("WORKOUT_BUILDER")}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Workout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {(["ROSTER", "WORKOUT_BUILDER", "NUTRITION_BUILDER"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-cyan-500 text-slate-950 shadow-neon"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* ROSTER TAB */}
      {activeTab === "ROSTER" && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Assigned Member Roster (Live Database)</h3>

          {members.length === 0 ? (
            <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Members Assigned to Your Roster</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Once members register or admins assign clients to your coaching profile, they will appear here for personal workout and nutrition prescription.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => {
                const uObj = users.find((u) => u.id === m.userId);
                const assignedWp = workouts.find((w) => w.memberId === m.id);
                return (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-base">
                        {uObj?.name ? uObj.name.charAt(0) : "M"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{uObj?.name || "Harsha Vardhan"}</h4>
                        <span className="text-[10px] text-cyan-400 font-mono">QR: {m.qrCode}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <span className="text-slate-400 text-[10px] block">Assigned Program:</span>
                      <span className="font-bold text-white block">
                        {assignedWp ? assignedWp.title : "No Program Prescribed Yet"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMemberId(m.id);
                        setActiveTab("WORKOUT_BUILDER");
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-bold transition-all"
                    >
                      Assign Custom Routine →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WORKOUT BUILDER TAB */}
      {activeTab === "WORKOUT_BUILDER" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase">Interactive Routine Designer</span>
            <h3 className="text-xl font-bold text-white font-display">Build & Assign Custom Workout</h3>
          </div>

          <form onSubmit={handleCreateWorkout} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                >
                  <option value="">Select Member from Roster</option>
                  {members.map((m) => {
                    const uObj = users.find((u) => u.id === m.userId);
                    return (
                      <option key={m.id} value={m.id}>
                        {uObj?.name || m.id} ({m.qrCode})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hypertrophy Blueprint"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>
            </div>

            {/* Exercise Selector Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <span className="font-bold text-white block">Add Movement to Routine</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="">Select Exercise from Library</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.muscleGroup})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Sets"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddExerciseToRoutine}
                    className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40"
                  >
                    + Add Movement
                  </button>
                </div>
              </div>

              {/* Added movements preview */}
              {routineExercises.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {routineExercises.map((re, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 flex justify-between items-center text-slate-300">
                      <span className="font-bold text-white">{re.exerciseName}</span>
                      <span>{re.sets} Sets × {re.reps} Reps • {re.targetWeightKg}kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon"
            >
              Assign Program to Database Member
            </button>
          </form>
        </div>
      )}

      {/* NUTRITION BUILDER TAB */}
      {activeTab === "NUTRITION_BUILDER" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase">Macronutrient Protocol</span>
            <h3 className="text-xl font-bold text-white font-display">Build Custom Diet & Meal Plan</h3>
          </div>

          <form onSubmit={handleCreateNutrition} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Nutrition Plan Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lean Mass Hypertrophy Protocol"
                value={nutTitle}
                onChange={(e) => setNutTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon"
            >
              Assign Nutrition Plan to Member
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getStoredExercises, getStoredWorkouts, saveWorkouts, initializeStorage } from "@/lib/storage";
import { Exercise } from "@/types";
import {
  Dumbbell,
  Search,
  X,
  Sparkles,
  ChevronRight,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { EXERCISE_IMAGE_CATALOG } from "@/lib/exerciseImageCatalog";

const PHYSICAL_LOCAL_FILES = new Set([
  "/images/exercises/chest/barbell_bench_press.webp",
  "/images/exercises/chest/incline_barbell_bench_press.webp",
  "/images/exercises/chest/dumbbell_chest_fly.webp",
  "/images/exercises/chest/cable_crossover.webp",
  "/images/exercises/chest/push_ups.webp",
  "/images/exercises/back/lat_pulldown.webp",
  "/images/exercises/back/bent_over_barbell_row.webp",
  "/images/exercises/back/seated_cable_row.webp",
  "/images/exercises/quadriceps/45_degree_leg_press.webp",
  "/images/exercises/quadriceps/barbell_back_squat.webp",
  "/images/exercises/quadriceps/bulgarian_split_squat.webp",
  "/images/exercises/quadriceps/dumbbell_goblet_squat.webp",
  "/images/exercises/quadriceps/seated_leg_extension.webp",
]);

function getExerciseImageUrl(ex: Exercise): string {
  const catalogItem = EXERCISE_IMAGE_CATALOG[ex.name];
  if (ex.imageUrl && ex.imageUrl.trim().length > 0) {
    return ex.imageUrl;
  }
  if (catalogItem) {
    return catalogItem.assetPath || catalogItem.fallbackUrl;
  }
  return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80";
}

// Map frontend body parts to Cloudinary category API endpoints
const BODY_PART_TO_CLOUDINARY_SLUG: Record<string, string> = {
  Chest: "chest",
  Back: "back",
  Shoulders: "shoulders",
  Biceps: "biceps",
  Triceps: "triceps",
  Abs: "core",
  Obliques: "core",
  "Lower Back": "core",
  Quadriceps: "quads",
  Hamstrings: "hamstrings",
  Glutes: "hamstrings",
  Calves: "calves",
  Adductors: "hips",
  Abductors: "hips",
  "Full Body": "full-body",
};

export default function ExerciseLibraryPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("ALL");

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    initializeStorage();
    const localExercises = getStoredExercises();
    setExercises(localExercises);

    // Fetch dynamic Cloudinary images from Backend API
    fetchCloudinaryExercises();
  }, []);

  const fetchCloudinaryExercises = async (bodyPart: string = "ALL") => {
    setIsLoading(true);
    try {
      let endpoint = "/api/exercises";
      const slug = BODY_PART_TO_CLOUDINARY_SLUG[bodyPart];

      if (bodyPart !== "ALL" && slug) {
        endpoint = `/api/exercises/${slug}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

      const data = await res.json();

      let fetchedCloudinaryItems: any[] = [];
      if (data.categories) {
        // From /api/exercises
        data.categories.forEach((cat: any) => {
          fetchedCloudinaryItems = [...fetchedCloudinaryItems, ...cat.exercises];
        });
      } else if (data.exercises) {
        // From /api/exercises/:category
        fetchedCloudinaryItems = data.exercises;
      }

      if (fetchedCloudinaryItems.length > 0) {
        setExercises((prev) => {
          const map = new Map<string, Exercise>();
          // Base local exercises
          prev.forEach((item) => map.set(item.name.toLowerCase(), item));

          // Merge/Update with Cloudinary returned exercises
          fetchedCloudinaryItems.forEach((cItem: any) => {
            const normName = cItem.name.toLowerCase();
            const existing = map.get(normName);
            if (existing) {
              map.set(normName, {
                ...existing,
                imageUrl: cItem.imageUrl,
              });
            } else {
              map.set(normName, {
                id: cItem.id,
                name: cItem.name,
                muscleGroup: "Chest",
                primaryBodyPart: "Chest",
                equipment: cItem.equipment || "Machine",
                difficulty: cItem.difficulty || "Intermediate",
                instructions: cItem.instructions || ["Perform exercise under proper guidance."],
                imageUrl: cItem.imageUrl,
              });
            }
          });

          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn("Could not load Cloudinary API, defaulting to storage:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBodyPartClick = (part: string) => {
    const nextPart = selectedBodyPart === part ? "ALL" : part;
    setSelectedBodyPart(nextPart);
    fetchCloudinaryExercises(nextPart);
  };

  const bodyPartGroups = [
    {
      group: "Upper Body",
      parts: ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms"],
    },
    {
      group: "Core",
      parts: ["Abs", "Obliques", "Lower Back"],
    },
    {
      group: "Lower Body",
      parts: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors"],
    },
    {
      group: "Full Body",
      parts: ["Full Body"],
    },
  ];

  const allBodyParts = [
    "ALL",
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Abs",
    "Obliques",
    "Lower Back",
    "Quadriceps",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Adductors",
    "Abductors",
    "Full Body",
  ];

  const filteredExercises = exercises.filter((ex) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ex.name.toLowerCase().includes(query) ||
      ex.primaryBodyPart.toLowerCase().includes(query) ||
      ex.equipment.toLowerCase().includes(query) ||
      (ex.secondaryMuscles && ex.secondaryMuscles.some((m) => m.toLowerCase().includes(query)));

    const matchesBodyPart = selectedBodyPart === "ALL" || ex.primaryBodyPart.toLowerCase() === selectedBodyPart.toLowerCase();
    const matchesDifficulty = selectedDifficulty === "ALL" || ex.difficulty === selectedDifficulty;
    const matchesEquipment = selectedEquipment === "ALL" || ex.equipment === selectedEquipment;

    return matchesSearch && matchesBodyPart && matchesDifficulty && matchesEquipment;
  });

  const handleAddExerciseToRoutine = () => {
    if (!selectedExercise) return;
    if (!user) {
      showToast("Authentication Required", "Please log in to add exercises to your workout.", "info");
      return;
    }

    const currentWorkouts = getStoredWorkouts();
    const userWorkout = currentWorkouts[0];

    const newItem = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      sets: selectedExercise.setsDefault || 4,
      reps: selectedExercise.repsDefault || 10,
      restSeconds: 90,
      targetWeightKg: 50,
      isCompleted: false,
    };

    if (userWorkout) {
      userWorkout.exercises.push(newItem);
      saveWorkouts([userWorkout, ...currentWorkouts.slice(1)]);
    } else {
      const newWp = {
        id: `wp-${Date.now()}`,
        title: "Custom Transformation Routine",
        description: "Personal workout program",
        trainerId: "tr-1",
        trainerName: "Coach Venki",
        memberId: user.id,
        targetGoal: "Muscle Gain" as const,
        assignedDate: new Date().toISOString().split("T")[0],
        exercises: [newItem],
      };
      saveWorkouts([newWp, ...currentWorkouts]);
    }

    showToast("Added to Workout!", `Added ${selectedExercise.name} to your active workout program.`, "success");
    setSelectedExercise(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 w-fit mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          FITNESS DRIVE Cloudinary Exercise Hub
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          TARGET EVERY MUSCLE. BUILD EVERY GOAL.
        </h1>
        <p className="text-sm text-slate-400">
          Explore our comprehensive body-part exercise library powered by Cloudinary CDN. Select a muscle group to view step-by-step performance mechanics, target muscles, and HD movement assets.
        </p>
      </div>

      {/* Body Part Categories Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <span>Select Target Muscle Group</span>
          {isLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bodyPartGroups.map((groupObj) => (
            <div key={groupObj.group} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
                  {groupObj.group}
                </span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex flex-wrap gap-2">
                {groupObj.parts.map((part) => {
                  const count = exercises.filter(
                    (e) => e.primaryBodyPart.toLowerCase() === part.toLowerCase()
                  ).length;
                  const isSelected = selectedBodyPart === part;
                  return (
                    <button
                      key={part}
                      onClick={() => handleBodyPartClick(part)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 w-full ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 shadow-neon"
                          : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span>{part}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                        isSelected ? "bg-slate-950 text-cyan-400" : "bg-slate-900 text-slate-400"
                      }`}>
                        {count} Exercises
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white max-w-md w-full">
            <Search className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search exercise name, target muscle, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full placeholder-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
            <div>
              <select
                value={selectedBodyPart}
                onChange={(e) => handleBodyPartClick(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none font-bold"
              >
                {allBodyParts.map((bp) => (
                  <option key={bp} value={bp}>
                    Body Part: {bp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none font-bold"
              >
                <option value="ALL">Difficulty: All</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none font-bold"
              >
                <option value="ALL">Equipment: All</option>
                <option value="Barbell">Barbell</option>
                <option value="Dumbbell">Dumbbell</option>
                <option value="Cable">Cable</option>
                <option value="Machine">Machine</option>
                <option value="Bodyweight">Bodyweight</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="w-full h-48 bg-slate-800 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-700" />
              </div>
              <div className="h-5 bg-slate-800 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded-lg w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded-2xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-3 shadow-xl">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Matching Exercises Found</h3>
          <p className="text-xs text-slate-400">
            No movements match your selected body part or search filters in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((ex) => {
            const imgUrl = getExerciseImageUrl(ex);
            const isCloudinary = imgUrl.includes("res.cloudinary.com");

            return (
              <div
                key={ex.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={imgUrl}
                      alt={ex.name}
                      onError={(e) => {
                        const catalogItem = EXERCISE_IMAGE_CATALOG[ex.name];
                        if (catalogItem?.fallbackUrl && e.currentTarget.src !== catalogItem.fallbackUrl) {
                          e.currentTarget.src = catalogItem.fallbackUrl;
                        } else {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80";
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 font-bold text-[10px] uppercase border border-slate-800 flex items-center gap-1">
                      {isCloudinary && <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{ex.primaryBodyPart}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white font-display group-hover:text-cyan-400 transition-colors">
                        {ex.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-semibold border border-slate-800">
                        Eq: {ex.equipment}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>

                  {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Secondary: <strong className="text-slate-300">{ex.secondaryMuscles.join(", ")}</strong>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedExercise(ex)}
                  className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>View Exercise</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:text-slate-950" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase">
                  {selectedExercise.primaryBodyPart} Target
                </span>
                <h2 className="text-2xl font-black text-white font-display mt-2">{selectedExercise.name}</h2>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="text-slate-400 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={getExerciseImageUrl(selectedExercise)}
                alt={selectedExercise.name}
                onError={(e) => {
                  const catalogItem = EXERCISE_IMAGE_CATALOG[selectedExercise.name];
                  if (catalogItem?.fallbackUrl && e.currentTarget.src !== catalogItem.fallbackUrl) {
                    e.currentTarget.src = catalogItem.fallbackUrl;
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Primary Muscle</span>
                <span className="font-bold text-cyan-400">{selectedExercise.primaryBodyPart}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Equipment</span>
                <span className="font-bold text-white">{selectedExercise.equipment}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Difficulty</span>
                <span className="font-bold text-emerald-400">{selectedExercise.difficulty}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Prescription</span>
                <span className="font-bold text-white">{selectedExercise.setsDefault || 4} Sets × {selectedExercise.repsDefault || 10} Reps</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">How to Perform:</h4>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                {selectedExercise.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">{inst}</li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-1/2 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Close Window
              </button>
              <button
                onClick={handleAddExerciseToRoutine}
                className="w-1/2 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon"
              >
                + Add To Workout Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

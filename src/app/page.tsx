"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Dumbbell,
  Zap,
  Flame,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Activity,
  Shield,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Building,
  Phone
} from "lucide-react";

import {
  getStoredPlans,
  getStoredTrainers,
  getStoredClasses,
  getStoredTestimonials,
  getStoredMembers,
  initializeStorage
} from "@/lib/storage";
import { MembershipPlan, TrainerProfile, ClassItem, Testimonial } from "@/types";
import { BMICalculator } from "@/components/calculator/BMICalculator";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function HomePage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);

  useEffect(() => {
    initializeStorage();
    setPlans(getStoredPlans());
    setTrainers(getStoredTrainers());
    setClasses(getStoredClasses());
    setMembersCount(getStoredMembers().length);
  }, []);

  const bodyPartCategoryHighlights = [
    { title: "Chest & Upper Body", count: "5+ Exercises", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80" },
    { title: "Back & Lats", count: "5+ Exercises", img: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80" },
    { title: "Shoulders & Delts", count: "5+ Exercises", img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80" },
    { title: "Arms & Biceps/Triceps", count: "10+ Exercises", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" },
    { title: "Core & Abs", count: "15+ Exercises", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" },
    { title: "Legs & Quadriceps", count: "25+ Exercises", img: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80" },
  ];

  const stats = [
    { label: "Active Members", value: `${membersCount || 1}+`, icon: <Users className="w-5 h-5 text-cyan-400" /> },
    { label: "Master Trainers", value: `${trainers.length || 4}`, icon: <Award className="w-5 h-5 text-emerald-400" /> },
    { label: "Weekly Classes", value: `${classes.length || 1}`, icon: <Calendar className="w-5 h-5 text-purple-400" /> },
    { label: "Years Experience", value: "3+", icon: <Zap className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <div className="w-full space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
            alt="FITNESS DRIVE Arena"
            fill
            className="object-cover opacity-20 filter brightness-75 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-neon">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>FITNESS DRIVE — Owner: Chetan (+91 88800 77188)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-display tracking-tight max-w-5xl mx-auto leading-tight">
            ENGINEER YOUR <span className="text-cyan-400">ULTIMATE PHYSICAL</span> POTENTIAL
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to FITNESS DRIVE. Experience world-class fitness equipment, Olympic lifting arenas, certified personal coaches (Chetan, Gavi Prakash, Venki, Shivu, Harsha), and targeted body-part training routines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/membership"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Join FITNESS DRIVE</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <a
              href="tel:+918880077188"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider backdrop-blur-md transition-all hover:border-cyan-500/40 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Call Chetan (+91 88800 77188)</span>
            </a>
          </div>

          {/* Configurable Live Statistics Counters */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl text-center space-y-1 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-white font-display">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW FEATURE SECTION: BODY-PART EXERCISE LIBRARY HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Complete Exercise Library</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Train Every Muscle. Build Every Goal.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Explore 75+ step-by-step movement guides categorized by muscle group with target biomechanics and workout prescriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bodyPartCategoryHighlights.map((cat, idx) => (
            <Link
              key={idx}
              href="/exercises"
              className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 h-64 flex flex-col justify-end p-6 hover:border-cyan-500/50 transition-all shadow-xl"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                fill
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase">
                  {cat.count}
                </span>
                <h3 className="text-xl font-bold text-white font-display group-hover:text-cyan-400 transition-colors">
                  {cat.title}
                </h3>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-300 group-hover:text-white">
                  <span>Explore Movements</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105"
          >
            <span>Explore Full Exercise Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* OFFICIAL TRAINERS ROSTER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Master Fitness Coaches</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Meet the FITNESS DRIVE Coaching Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Certified coaches dedicated to your strength conditioning, hypertrophy, and body transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {trainers.map((tr) => (
            <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800">
                  <Image src={tr.avatar} alt={tr.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display">{tr.name}</h3>
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                    {tr.experienceYears ? `${tr.experienceYears} Years Experience` : "3+ Years Experience"}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{tr.bio}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {tr.phone && (
                  <a
                    href={`tel:${tr.phone.replace(/ /g, "")}`}
                    className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {tr.name} ({tr.phone})</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BMI CALCULATOR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BMICalculator />
      </section>
    </div>
  );
}

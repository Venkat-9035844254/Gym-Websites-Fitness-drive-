"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Dumbbell, ShieldCheck, Award, Target, Flame, HeartPulse, CheckCircle2, ArrowRight } from "lucide-react";
import { INITIAL_TRAINERS } from "@/lib/seedData";

export default function AboutPage() {
  const timelineEvents = [
    { year: "2016", title: "Apex Founded", desc: "Started as a 4,000 sq.ft strength sanctuary in Koramangala with 12 Eleiko platforms." },
    { year: "2019", title: "Flagship Expansion", desc: "Moved to our 25,000 sq.ft flagship facility with hydrotherapy recovery pods and steam saunas." },
    { year: "2022", title: "Multi-Branch Launch", desc: "Opened Downtown Studio and Westside Athletic Hub, introducing app-based digital tracking." },
    { year: "2026", title: "5,000+ Active Members", desc: "Recognized as Bengaluru's #1 commercial hypertrophy and functional fitness destination." },
  ];

  return (
    <div className="w-full space-y-20 pb-20">
      {/* Header Banner */}
      <section className="bg-slate-900/60 border-b border-slate-800 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Our Story & Mission</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
            REDESIGNING COMMERCIAL FITNESS EXCELLENCE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Apex Athletics was built on a simple premise: create an uncompromised training facility where science-backed coaching meets elite physical conditioning.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Mission</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To provide individuals of all fitness levels with state-of-the-art training environments, master coaching, and digital tracking tools to unlock physical potential.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Vision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To build Asia's leading network of high-performance hybrid athletic clubs that blend strength sports, functional health, and active recovery.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Core Values</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uncompromising standards, sports science accuracy, sanitary pristine facilities, and an inclusive community culture.
          </p>
        </div>
      </section>

      {/* Timeline of Growth */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Decade of Momentum</span>
          <h2 className="text-3xl font-extrabold text-white font-display">Apex Growth Timeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {timelineEvents.map((ev, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative space-y-3">
              <span className="text-3xl font-black font-display text-cyan-400">{ev.year}</span>
              <h4 className="text-base font-bold text-white">{ev.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{ev.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facility & Equipment Showcase */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">World Class Arsenal</span>
            <h2 className="text-3xl font-extrabold text-white font-display">Commercial Facilities & Equipment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" alt="Iron Deck" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white">Eleiko Olympic Power Platforms</h3>
              <p className="text-xs text-slate-400">Calibrated competition plates, rogue barbells, and rubberized drop platforms.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" alt="Recovery Suite" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white">Steam Sauna & Hydro Pods</h3>
              <p className="text-xs text-slate-400">Finnish cedar wood steam rooms and contrast temperature recovery plunge baths.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" alt="Cardio Deck" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-bold text-white">High Intensity HIIT Arena</h3>
              <p className="text-xs text-slate-400">Assault airbikes,Concept2 rowers, SkiErgs, and turf sled tracks for metabolic conditioning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Master Coaches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Leadership Team</span>
          <h2 className="text-3xl font-extrabold text-white font-display">Meet Our Master Trainers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {INITIAL_TRAINERS.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-cyan-400">
                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{t.name}</h4>
                <span className="text-xs text-cyan-400 font-semibold block">{t.specialization}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{t.experienceYears ? `${t.experienceYears} Yrs Exp` : "3+ Yrs Exp"}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

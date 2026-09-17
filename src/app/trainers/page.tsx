"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getStoredTrainers, initializeStorage } from "@/lib/storage";
import { TrainerProfile } from "@/types";
import { Award, Star, Phone, Dumbbell, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function TrainersPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");

  useEffect(() => {
    initializeStorage();
    setTrainers(getStoredTrainers());
  }, []);

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Authentication Required", "Please log in to book 1-on-1 personal training.", "info");
      return;
    }
    showToast("Session Reserved!", `Booked 1-on-1 consultation with Coach ${selectedTrainer?.name}.`, "success");
    setSelectedTrainer(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          FITNESS DRIVE Master Coaches
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          WORLD-CLASS ATHLETIC COACHES
        </h1>
        <p className="text-sm text-slate-400">
          Our certified master coaches specialize in hypertrophy, strength conditioning, mobility, and personal transformation.
        </p>
      </div>

      {trainers.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-3 shadow-xl">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Trainers On Roster</h3>
          <p className="text-xs text-slate-400">
            There are currently no active coaches registered in the trainer roster database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {trainers.map((tr) => {
            const phoneNum = tr.phone || (
              tr.name === "Venki" ? "+91 95384 33663" :
              tr.name === "Gavi Prakash" ? "+91 97317 41627" :
              tr.name === "Harsha" ? "+91 80087 62399" :
              tr.name === "Chetan" ? "+91 88800 77188" : "+91 78468 30687"
            );

            return (
              <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-800">
                    <Image src={tr.avatar} alt={tr.name} fill className="object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-cyan-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>{tr.rating || 4.9}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white font-display">{tr.name}</h3>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block mt-1">
                      {tr.experienceYears ? `${tr.experienceYears} Years Experience` : "3+ Years Experience"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                      {tr.specialization}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tr.bio}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={`tel:${phoneNum.replace(/ /g, "")}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-bold text-xs hover:border-cyan-500/40 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{phoneNum}</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`tel:${phoneNum.replace(/ /g, "")}`}
                    className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>Call {tr.name} ({phoneNum})</span>
                  </a>

                  <button
                    onClick={() => setSelectedTrainer(tr)}
                    className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105"
                  >
                    Book 1-on-1 Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Book Session with Coach {selectedTrainer.name}</h3>
            <form onSubmit={handleBookSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Session Goals / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on deadlift technique & hypertrophy diet..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrainer(null)}
                  className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

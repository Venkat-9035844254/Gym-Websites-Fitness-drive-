"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { getStoredLeads, saveLeads } from "@/lib/storage";

export default function FreeTrialPage() {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    goal: "Weight Loss",
    preferredDate: "2026-08-28",
    preferredTime: "10:00 AM",
  });

  const handleRequestTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      showToast("Required Fields", "Please complete name, phone, and email.", "error");
      return;
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      interestedPlan: `1-Day Free Trial (${formData.goal})`,
      source: "Free Trial Form",
      status: "TRIAL_SCHEDULED" as const,
      notes: `Requested date: ${formData.preferredDate} at ${formData.preferredTime}`,
      createdAt: new Date().toISOString(),
    };

    saveLeads([newLead, ...getStoredLeads()]);
    showToast("Free Trial Pass Activated!", "Your 1-day pass code has been generated. Check in at the desk!", "success");
    setFormData({
      name: "",
      email: "",
      phone: "",
      goal: "Weight Loss",
      preferredDate: "2026-08-28",
      preferredTime: "10:00 AM",
    });
  };

  return (
    <div className="w-full space-y-16 pb-20">
      <section className="bg-slate-900/60 border-b border-slate-800 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase">
            <Sparkles className="w-4 h-4" /> 100% Free • No Credit Card Required
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
            CLAIM YOUR 1-DAY VIP TRIAL PASS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience our Olympic strength platforms, cardio deck, steam saunas, and group fitness classes free for 1 full day.
          </p>
        </div>
      </section>

      <section className="max-w-xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <h3 className="text-xl font-bold text-white font-display text-center">Register Trial Pass</h3>

          <form onSubmit={handleRequestTrial} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Enter full name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Fitness Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none"
                >
                  <option>Weight Loss</option>
                  <option>Muscle Hypertrophy</option>
                  <option>Powerlifting</option>
                  <option>General Fitness</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-[1.01]"
            >
              Generate Free Pass
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

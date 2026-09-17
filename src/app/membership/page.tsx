"use client";

import React, { useState, useEffect } from "react";
import { getStoredPlans, initializeStorage } from "@/lib/storage";
import { MembershipPlan } from "@/types";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { ManualPaymentModal } from "@/components/membership/ManualPaymentModal";
import { Check, Dumbbell, Shield, Sparkles, Utensils, Zap, FileCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function MembershipPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "SIX_MONTHS" | "YEARLY">("MONTHLY");
  const [hasDietPlan, setHasDietPlan] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [selectedManualPlan, setSelectedManualPlan] = useState<MembershipPlan | null>(null);

  useEffect(() => {
    initializeStorage();
    setPlans(getStoredPlans());
  }, []);

  // Multipliers for Diet Plan calculation: ₹500/month
  const durationMultiplier = billingCycle === "MONTHLY" ? 1 : billingCycle === "SIX_MONTHS" ? 6 : 12;
  const dietAddonPrice = 500 * durationMultiplier;

  const durationLabel =
    billingCycle === "MONTHLY"
      ? "Monthly"
      : billingCycle === "SIX_MONTHS"
      ? "6-Month"
      : "Yearly";

  const getBasePrice = (plan: MembershipPlan) => {
    if (billingCycle === "SIX_MONTHS") return plan.priceSixMonths;
    if (billingCycle === "YEARLY") return plan.priceYearly;
    return plan.priceMonthly;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          Fitness Drive Membership Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
          CHOOSE YOUR TRANSFORMATION PLAN
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Flexible membership packages designed for strength, endurance, and overall conditioning. Select your duration and optional personalized diet plan.
        </p>

        {/* Controls Container: Duration Selector & Diet Add-on Toggle */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Duration Selector */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold shadow-lg">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-5 py-2.5 rounded-xl transition-all ${
                billingCycle === "MONTHLY"
                  ? "bg-cyan-500 text-slate-950 shadow-neon font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("SIX_MONTHS")}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === "SIX_MONTHS"
                  ? "bg-cyan-500 text-slate-950 shadow-neon font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>6 Months</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-black uppercase">
                Popular
              </span>
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === "YEARLY"
                  ? "bg-cyan-500 text-slate-950 shadow-neon font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                Best Value
              </span>
            </button>
          </div>

          {/* Diet Plan Add-on Toggle */}
          <label className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-all select-none group shadow-lg">
            <input
              type="checkbox"
              checked={hasDietPlan}
              onChange={(e) => setHasDietPlan(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Utensils className={`w-4 h-4 transition-colors ${hasDietPlan ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span className="text-xs font-extrabold text-white">
                Add Diet Plan <span className="text-emerald-400">+₹500/mo</span>
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {plans.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-xl">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Membership Plans Available</h3>
          <p className="text-xs text-slate-400">
            There are currently no active membership packages listed in the database catalog. Admin can create new membership packages from the Executive Dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan) => {
            const basePrice = getBasePrice(plan);
            const finalPrice = basePrice + (hasDietPlan ? dietAddonPrice : 0);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-slate-900 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)] md:-translate-y-2 z-10"
                    : "bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:shadow-xl"
                }`}
              >
                {plan.badgeText && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-neon">
                    {plan.badgeText}
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-white font-display tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 min-h-[36px] leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price Section */}
                  <div className="border-y border-slate-800/80 py-5 space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-white font-display">
                        ₹{finalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        / {billingCycle === "MONTHLY" ? "month" : billingCycle === "SIX_MONTHS" ? "6 months" : "year"}
                      </span>
                    </div>

                    {/* Breakdown Details */}
                    <div className="text-[11px] space-y-1 font-medium">
                      <div className="text-slate-400 flex justify-between">
                        <span>Base plan ({durationLabel}):</span>
                        <span className="text-slate-200 font-bold">₹{basePrice.toLocaleString()}</span>
                      </div>
                      {hasDietPlan ? (
                        <div className="text-emerald-400 flex justify-between font-bold">
                          <span>Includes Diet Plan:</span>
                          <span>+₹{dietAddonPrice.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 flex justify-between italic text-[10px]">
                          <span>Diet Plan:</span>
                          <span>Not selected (+₹500/mo)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      Included Features:
                    </h4>
                    <ul className="space-y-3 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                      {hasDietPlan && (
                        <li className="flex items-start gap-2.5 text-emerald-300 font-semibold bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/50">
                          <Utensils className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Personalized Customized Diet & Nutrition Plan</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 mt-8">
                  <button
                    onClick={() => setSelectedManualPlan(plan)}
                    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Pay & Request Verification</span>
                  </button>
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white font-semibold text-[11px] uppercase tracking-wider transition-all"
                  >
                    Razorpay Online Payment (Standard)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedManualPlan && (
        <ManualPaymentModal
          plan={selectedManualPlan}
          billingCycle={billingCycle}
          hasDietPlan={hasDietPlan}
          onClose={() => setSelectedManualPlan(null)}
          onSuccess={() => {
            setSelectedManualPlan(null);
            showToast("Request Submitted!", `Admin verification request submitted for ${selectedManualPlan.name}!`, "success");
          }}
        />
      )}

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          hasDietPlan={hasDietPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            showToast("Subscription Successful!", `Welcome to ${selectedPlan.name} membership!`, "success");
          }}
        />
      )}
    </div>
  );
}

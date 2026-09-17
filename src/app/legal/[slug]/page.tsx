"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, FileText } from "lucide-react";

export default function LegalPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "privacy";

  const getTitle = () => {
    switch (slug) {
      case "terms": return "Terms & Conditions of Membership";
      case "refund": return "Membership Refund & Cancellation Policy";
      case "cookie": return "Cookie & Data Tracking Policy";
      default: return "Privacy & Personal Data Protection Policy";
    }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <section className="bg-slate-900/60 border-b border-slate-800 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Legal Documentation</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display uppercase">
            {getTitle()}
          </h1>
          <p className="text-xs text-slate-400">Last updated: August 27, 2026 • Apex Athletics Commercial Legal Framework</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>Apex Athletics Inc. complies with data protection regulations and transparent commercial membership policies.</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">1. Facility Usage & Code of Conduct</h3>
            <p>
              All members must check in via turnstile QR pass scanner prior to entering gym floors. Proper athletic attire and non-marking gym shoes are mandatory. Clean sanitary practices must be maintained at all times.
            </p>

            <h3 className="text-base font-bold text-white">2. Payments, Billing & Automatic Renewal</h3>
            <p>
              Membership subscriptions are billed monthly or annually as selected during checkout. Payments are processed securely via 256-bit SSL encrypted gateways (Razorpay / Stripe). Recurring invoices are generated and accessible via the Member Dashboard.
            </p>

            <h3 className="text-base font-bold text-white">3. Cancellation & Refund Terms</h3>
            <p>
              Members may request plan cancellation with 14-day notice via the Member Dashboard or Desk Staff. Refunds for annual passes are calculated pro-rata minus applicable administrative processing fees.
            </p>

            <h3 className="text-base font-bold text-white">4. Personal Data & Image Privacy</h3>
            <p>
              Progress measurements and optional transformation photos uploaded to the Member Dashboard remain strictly private and encrypted unless the member explicitly authorizes public feature spotlighting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

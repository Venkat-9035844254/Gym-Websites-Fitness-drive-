"use client";

import React, { useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Shield, Dumbbell, Calendar, CheckCircle2, Download, Printer, User, QrCode as QrIcon, Sparkles, X } from "lucide-react";

export interface PassData {
  id: string;
  passNumber: string;
  issueDate: string;
  qrCodeData: string;
  status: string;
  memberId: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  memberAvatar?: string | null;
  planId: string;
  planName: string;
  billingCycle: string;
  amountPaid: number;
  paymentRef: string;
  paymentMethod: string;
  startDateFormatted: string;
  endDateFormatted: string;
  daysRemaining: number;
  gymName: string;
}

export function MembershipPassCard({
  pass,
  onClose,
}: {
  pass: PassData;
  onClose?: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-sm font-extrabold text-white font-display">
              Official Gym Membership Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Pass</span>
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 overflow-y-auto space-y-6" ref={printRef}>
          {/* Main Pass Digital Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden space-y-6">
            {/* Background Graphic Watermark */}
            <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
              <Dumbbell className="w-72 h-72 text-cyan-400" />
            </div>

            {/* Header: Gym Logo & Badge */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-neon">
                  <Dumbbell className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display tracking-wider">
                    {pass.gymName || "FITNESS DRIVE GYM ARENA"}
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">
                    Verified Digital Reception Pass
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pass.status}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  #{pass.passNumber}
                </span>
              </div>
            </div>

            {/* Member Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-1">
              {/* Member Photo */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-2 border-cyan-400/40 overflow-hidden flex items-center justify-center shadow-lg">
                  {pass.memberAvatar ? (
                    <img
                      src={pass.memberAvatar}
                      alt={pass.memberName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-500" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-neon">
                  <Shield className="w-4 h-4" />
                </div>
              </div>

              {/* Details Grid */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <h4 className="text-xl font-black text-white font-display tracking-wide">
                    {pass.memberName}
                  </h4>
                  <p className="text-xs text-slate-400">ID: <span className="font-mono text-cyan-400 font-bold">{pass.memberId}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Membership Plan</span>
                    <span className="font-extrabold text-white">{pass.planName}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Duration</span>
                    <span className="font-extrabold text-cyan-400">{pass.billingCycle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Payment Bar */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Start Date</span>
                <span className="font-black text-white font-mono">{pass.startDateFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Expiry Date</span>
                <span className="font-black text-emerald-400 font-mono">{pass.endDateFormatted}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Days Remaining</span>
                <span className="font-black text-cyan-400 font-mono">{pass.daysRemaining} Days</span>
              </div>
            </div>

            {/* Footer QR & Reception Scanner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 space-y-0.5 text-center sm:text-left">
                <p><span className="font-bold text-slate-300">Amount Paid:</span> {formatCurrency(pass.amountPaid)}</p>
                <p><span className="font-bold text-slate-300">Payment Ref:</span> <span className="font-mono text-cyan-400">{pass.paymentRef}</span></p>
                <p className="text-[10px] text-slate-500">Issued Date: {new Date(pass.issueDate).toLocaleDateString()}</p>
              </div>

              {/* QR Code Graphics */}
              <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div className="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center">
                  {/* SVG QR Code Simulation Grid */}
                  <svg className="w-full h-full text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h4v2h-4v-2zm-4 4h2v4h-2v-4zm4 0h4v4h-4v-4zm-4-4h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-left text-[10px] text-slate-400">
                  <span className="font-bold text-white block">Reception QR</span>
                  <span>Scan at Turnstile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3 shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

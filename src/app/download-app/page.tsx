"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, Smartphone, Download, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function DownloadAppPage() {
  const handleDownload = () => {
    // Triggers download of fitnessdrive.apk if uploaded in public folder
    const link = document.createElement("a");
    link.href = "/fitnessdrive.apk";
    link.download = "FitnessDrive.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            Official Android Application
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Download <span className="text-cyan-400">FITNESS DRIVE</span> Mobile App
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Get instant access to your 24/7 Digital Membership Pass, QR check-in, real-time workout tracking, and personalized diet plans on your Android phone.
          </p>
        </div>

        {/* Hero Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 z-10">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">Fitness Drive APK for Android</h2>
              <p className="text-xs text-slate-400">
                Version 1.0.0 • Size ~5 MB • Compatible with Android 7.0+
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Digital QR Pass for Gym Turnstile Entrance</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Razorpay Membership Renewal & Receipts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized AI Workout & Diet Generator</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-neon transition-all hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Download APK File</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="w-64 h-96 rounded-[2.5rem] border-4 border-slate-700 bg-slate-950 p-4 shadow-2xl relative flex flex-col items-center justify-between">
              <div className="w-20 h-4 bg-slate-800 rounded-full mb-4" />
              <div className="text-center space-y-3 my-auto">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 inline-block">
                  <Dumbbell className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-lg font-black text-white font-display">FITNESS DRIVE</h3>
                <p className="text-[11px] text-cyan-400 font-semibold">High Performance App</p>
              </div>
              <div className="w-full py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 text-[10px] font-bold text-center">
                ✓ Ready for Installation
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">How to Install APK on Android</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Download APK</h4>
              <p className="text-xs text-slate-400">
                Tap the "Download APK File" button above to save the file to your Android Downloads folder.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Allow Unknown Sources</h4>
              <p className="text-xs text-slate-400">
                If prompted by Android, go to Settings ➔ Security ➔ Enable "Install from Unknown Sources" or "Allow from this browser".
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Install & Open</h4>
              <p className="text-xs text-slate-400">
                Tap the downloaded `FitnessDrive.apk` file in your notifications or Downloads folder to install and launch!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

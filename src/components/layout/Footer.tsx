"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dumbbell, Mail, Phone, MapPin, Clock, ArrowRight, Instagram, Facebook, Youtube, Twitter, ShieldCheck, User } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

export function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useNotification();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Invalid Email", "Please enter a valid email address.", "error");
      return;
    }
    showToast("VIP Subscribed!", "You will receive workout tips & gym updates.", "success");
    setEmail("");
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400">
      {/* Upper Newsletter Section */}
      <div className="border-b border-slate-800/80 py-12 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">FITNESS DRIVE Community</span>
            <h3 className="text-2xl font-extrabold text-white font-display mt-1">
              Join the FITNESS DRIVE Athletic Network
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Receive weekly hyper-targeted hypertrophy plans, nutrition protocols, and priority event invitations.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-md w-full">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-105 shrink-0 flex items-center gap-2"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Links Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-neon">
              <Dumbbell className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white font-display">
                FITNESS <span className="text-cyan-400">DRIVE</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                High Performance Fitness Club
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            FITNESS DRIVE is a premier commercial fitness ecosystem offering state-of-the-art hypertrophy equipment, Olympic lifting arenas, functional mobility suites, and expert personal coaching.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home Page</Link></li>
            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Gym Story</Link></li>
            <li><Link href="/membership" className="hover:text-cyan-400 transition-colors">Membership Plans</Link></li>
            <li><Link href="/classes" className="hover:text-cyan-400 transition-colors">Class Schedule</Link></li>
            <li><Link href="/trainers" className="hover:text-cyan-400 transition-colors">Expert Trainers</Link></li>
            <li><Link href="/exercises" className="hover:text-cyan-400 transition-colors">Exercise Library</Link></li>
            <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
            <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Member Login</Link></li>
          </ul>
        </div>

        {/* Portals */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Portals & Tools</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard/member" className="hover:text-cyan-400 transition-colors">Member Dashboard</Link></li>
            <li><Link href="/dashboard/trainer" className="hover:text-cyan-400 transition-colors">Trainer Portal</Link></li>
            <li><Link href="/dashboard/admin" className="hover:text-cyan-400 transition-colors">Admin Command Center</Link></li>
            <li><Link href="/qr-scanner" className="hover:text-cyan-400 transition-colors">QR Check-in Scanner</Link></li>
            <li><Link href="/reviews" className="hover:text-cyan-400 transition-colors">Verified Member Reviews</Link></li>
            <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Fitness Journal</Link></li>
          </ul>
        </div>

        {/* Gym Contact & Owner Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Gym Contact & Location</h4>
          <div className="space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Owner: <strong className="text-white font-semibold">Chetan</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <a href="tel:+918880077188" className="hover:text-cyan-400 font-bold text-white transition-colors">
                +91 88800 77188
              </a>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>108 Elite Towers, Outer Ring Road, Bengaluru, KA</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>contact@fitnessdrive.com</span>
            </div>
            <div className="flex items-start gap-2.5 pt-1 border-t border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-300 font-semibold">Hours:</span>
                <span>Mon-Sat: 5:00 AM - 11:00 PM</span>
                <span className="block text-cyan-400">24/7 VIP Access Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Legal */}
      <div className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>© {new Date().getFullYear()} FITNESS DRIVE Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/legal/refund" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

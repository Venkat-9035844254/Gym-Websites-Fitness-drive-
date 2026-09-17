"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, User, Send, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { getStoredEnquiries, saveEnquiries } from "@/lib/storage";

export default function ContactPage() {
  const { showToast } = useNotification();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast("Missing Fields", "Please complete all required fields.", "error");
      return;
    }

    const newEnquiry = {
      id: `enq-${Date.now()}`,
      name,
      email,
      phone: phone || "+91 88800 77188",
      subject: subject || "Gym Membership Inquiry",
      message,
      status: "NEW" as const,
      createdAt: new Date().toISOString(),
    };

    const enquiries = getStoredEnquiries();
    saveEnquiries([newEnquiry, ...enquiries]);

    setIsSubmitted(true);
    showToast("Enquiry Transmitted!", "Our team will contact you shortly.", "success");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          CONTACT FITNESS DRIVE
        </h1>
        <p className="text-sm text-slate-400">
          Have questions about memberships, personal coaching, or 1-day trial passes? Reach out to owner Chetan or our front desk team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white font-display">Official Contact Details</h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <User className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gym Owner</span>
                  <span className="text-sm font-bold text-white">Chetan</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Phone</span>
                  <a href="tel:+918880077188" className="text-sm font-bold text-cyan-400 hover:underline">
                    +91 88800 77188
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Official Email</span>
                  <span className="text-sm font-bold text-white">contact@fitnessdrive.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Flagship Arena</span>
                  <span className="text-sm font-bold text-white">108 Elite Towers, Outer Ring Road, Bengaluru, KA</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="tel:+918880077188"
                className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span>Call Chetan (+91 88800 77188)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase">Inbound Desk</span>
            <h3 className="text-xl font-bold text-white font-display mt-1">Send us a Message</h3>
          </div>

          {isSubmitted ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Message Transmitted Successfully!</h4>
              <p className="text-xs text-slate-400">
                Thank you for contacting FITNESS DRIVE. Owner Chetan or our desk support will get back to you shortly.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-cyan-400 font-bold text-xs"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Personal Training Rates"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can FITNESS DRIVE help you achieve your goals?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to FITNESS DRIVE</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

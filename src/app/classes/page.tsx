"use client";

import React, { useState, useEffect } from "react";
import { getStoredClasses, getStoredBookings, saveBookings, initializeStorage } from "@/lib/storage";
import { ClassItem, ClassBooking } from "@/types";
import { Calendar, Clock, MapPin, Users, CheckCircle2, Dumbbell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function ClassesPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    initializeStorage();
    setClasses(getStoredClasses());
    setBookings(getStoredBookings());
  }, []);

  const categories = ["ALL", "HIIT", "Yoga", "CrossFit", "Strength", "Boxing"];

  const filteredClasses = classes.filter(
    (c) => selectedCategory === "ALL" || c.category === selectedCategory
  );

  const handleBookClass = (classObj: ClassItem) => {
    if (!user) {
      showToast("Authentication Required", "Please log in to book group classes.", "info");
      return;
    }

    const alreadyBooked = bookings.some(
      (b) => b.classId === classObj.id && b.memberId === user.id && b.status === "CONFIRMED"
    );

    if (alreadyBooked) {
      showToast("Already Booked", "You have already reserved a spot in this class.", "info");
      return;
    }

    const newBooking: ClassBooking = {
      id: `bk-${Date.now()}`,
      classId: classObj.id,
      memberId: user.id,
      status: "CONFIRMED",
      bookedAt: new Date().toISOString(),
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    saveBookings(updatedBookings);

    // Increment booked count in classes
    const updatedClasses = classes.map((c) =>
      c.id === classObj.id ? { ...c, bookedCount: c.bookedCount + 1 } : c
    );
    setClasses(updatedClasses);

    showToast("Class Spot Reserved!", `Booked ${classObj.name}.`, "success");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          Class Schedule
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          HIGH-INTENSITY GROUP SESSIONS
        </h1>
        <p className="text-sm text-slate-400">
          Reserve your spot in our coach-led group training programs.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-slate-950 shadow-neon"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-3 shadow-xl">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Classes Scheduled</h3>
          <p className="text-xs text-slate-400">
            There are currently no upcoming group classes scheduled for the selected category in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const isBooked = user
              ? bookings.some((b) => b.classId === c.id && b.memberId === user.id && b.status === "CONFIRMED")
              : false;

            return (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{c.intensity}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-display">{c.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{c.durationMins} Mins • {new Date(c.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Coach: {c.trainerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{c.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    <strong className="text-cyan-400 font-mono">{c.capacity - c.bookedCount}</strong> spots left
                  </span>

                  <button
                    onClick={() => handleBookClass(c)}
                    disabled={isBooked || c.bookedCount >= c.capacity}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      isBooked
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                        : c.bookedCount >= c.capacity
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon"
                    }`}
                  >
                    {isBooked ? "Reserved ✓" : c.bookedCount >= c.capacity ? "Class Full" : "Book Spot"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

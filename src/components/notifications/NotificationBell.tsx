"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Clock, ShieldAlert, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStoredNotificationLogs, saveNotificationLogs, initializeStorage } from "@/lib/storage";
import { runMembershipExpiryCheck } from "@/lib/reminderEngine";
import { NotificationLog } from "@/types";

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  const loadLogs = () => {
    initializeStorage();
    if (typeof window === "undefined" || !user) return;

    // Run scheduler check automatically on mount / dashboard load
    runMembershipExpiryCheck().then(() => {
      const allLogs = getStoredNotificationLogs();
      const userLogs = allLogs.filter((l) => l.userId === user.id && l.channel === "IN_APP");
      setLogs(userLogs);
    });
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Poll every 10s for real-time update
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = logs.filter((l) => !l.readStatus).length;

  const handleMarkAsRead = (id: string) => {
    const allLogs = getStoredNotificationLogs();
    const updated = allLogs.map((l) => (l.id === id ? { ...l, readStatus: true } : l));
    saveNotificationLogs(updated);
    setLogs(logs.map((l) => (l.id === id ? { ...l, readStatus: true } : l)));
  };

  const handleMarkAllRead = () => {
    const allLogs = getStoredNotificationLogs();
    const updated = allLogs.map((l) => (l.userId === user?.id ? { ...l, readStatus: true } : l));
    saveNotificationLogs(updated);
    setLogs(logs.map((l) => ({ ...l, readStatus: true })));
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] shadow-neon-pink animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No notifications in your inbox.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all ${
                    log.readStatus
                      ? "bg-slate-950/60 border-slate-800 text-slate-400"
                      : "bg-slate-950 border-cyan-500/40 text-slate-200 ring-1 ring-cyan-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      {!log.readStatus && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                      {log.title}
                    </span>
                    {!log.readStatus && (
                      <button
                        onClick={() => handleMarkAsRead(log.id)}
                        className="text-[10px] text-slate-400 hover:text-cyan-400"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{log.message}</p>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>

                    {log.type === "MEMBERSHIP_EXPIRY_5_DAY" && (
                      <Link
                        href="/membership"
                        onClick={() => {
                          handleMarkAsRead(log.id);
                          setIsOpen(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <span>Renew Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

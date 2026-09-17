"use client";

import React, { useState } from "react";
import { QrCode, ShieldCheck, AlertCircle, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { getStoredMembers, getStoredUsers, getStoredAttendance, saveAttendance } from "@/lib/storage";
import { useNotification } from "@/context/NotificationContext";

export default function QRScannerPage() {
  const { showToast } = useNotification();

  const [inputQrCode, setInputQrCode] = useState("APEX-MEM-889410");
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState(getStoredAttendance());

  const handleSimulateScan = (qrToScan?: string) => {
    const code = qrToScan || inputQrCode;
    const members = getStoredMembers();
    const users = getStoredUsers();

    const member = members.find((m) => m.qrCode.toLowerCase() === code.trim().toLowerCase());
    if (!member) {
      setScanResult({
        status: "INVALID",
        message: "Invalid QR Pass Code! No matching member found in database.",
      });
      showToast("Access Denied", "Unrecognized Member QR Code", "error");
      return;
    }

    const userObj = users.find((u) => u.id === member.userId);
    const memberName = userObj ? userObj.name : "Gym Member";

    if (member.membershipStatus !== "ACTIVE") {
      setScanResult({
        status: "EXPIRED",
        memberName,
        qrCode: member.qrCode,
        message: `Membership status is ${member.membershipStatus}. Renewal required at desk.`,
      });
      showToast("Access Denied", `Membership for ${memberName} is ${member.membershipStatus}`, "warning");
      return;
    }

    // Valid check-in!
    const newRecord = {
      id: `att-${Date.now()}`,
      memberId: member.id,
      memberName,
      memberQr: member.qrCode,
      branchId: "branch-1",
      branchName: "Apex Flagship Club",
      checkInTime: new Date().toISOString(),
      method: "QR_CODE" as const,
      status: "VALID" as const,
    };

    const updatedLogs = [newRecord, ...recentLogs];
    setRecentLogs(updatedLogs);
    saveAttendance(updatedLogs);

    setScanResult({
      status: "VALID",
      memberName,
      qrCode: member.qrCode,
      plan: member.currentPlanId || "Pro Pass",
      message: "Check-in successful! Enjoy your workout session.",
    });

    showToast("Access Granted!", `Welcome to Apex, ${memberName}!`, "success");
  };

  return (
    <div className="w-full space-y-16 pb-20">
      <section className="bg-slate-900/60 border-b border-slate-800 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase">
            <QrCode className="w-4 h-4" /> Reception Scanner Terminal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display">
            MEMBER QR CHECK-IN STATION
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Scan member QR pass cards to validate real-time membership status and register daily turnstile entrance logs.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Scanner Terminal simulator */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Turnstile Scanner Simulator</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Enter / Scan Member QR Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputQrCode}
                  onChange={(e) => setInputQrCode(e.target.value)}
                  placeholder="e.g. APEX-MEM-889410"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono uppercase focus:border-cyan-400 outline-none"
                />
                <button
                  onClick={() => handleSimulateScan()}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon"
                >
                  Scan Pass
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Quick Demo Pass Codes</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => { setInputQrCode("APEX-MEM-889410"); handleSimulateScan("APEX-MEM-889410"); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 font-mono"
                >
                  Harsha (Active Pass)
                </button>
                <button
                  onClick={() => { setInputQrCode("APEX-MEM-EXPIRED"); handleSimulateScan("APEX-MEM-EXPIRED"); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-200 font-mono"
                >
                  Invalid Pass Code
                </button>
              </div>
            </div>
          </div>

          {/* Scanner Feedback Display */}
          {scanResult && (
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 animate-in fade-in duration-200 ${
                scanResult.status === "VALID"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                  : "bg-rose-500/10 border-rose-500/40 text-white"
              }`}
            >
              {scanResult.status === "VALID" ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              ) : (
                <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              )}

              <div>
                <h4 className="text-xl font-extrabold font-display">
                  {scanResult.status === "VALID" ? "ACCESS GRANTED" : "ACCESS DENIED"}
                </h4>
                {scanResult.memberName && (
                  <span className="text-sm font-bold text-slate-200 block mt-1">{scanResult.memberName}</span>
                )}
                <p className="text-xs text-slate-300 mt-2">{scanResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Attendance Stream */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Entrance Feed</h3>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">{recentLogs.length} Records</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{log.memberName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.memberQr}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 block">VALID</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { MembershipPlan } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { ShieldCheck, CreditCard, Lock, Loader2, X, QrCode, Smartphone, Building2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

export function ManualPaymentModal({
  plan,
  billingCycle = "MONTHLY",
  hasDietPlan = false,
  onClose,
  onSuccess,
}: {
  plan?: MembershipPlan;
  billingCycle?: "MONTHLY" | "SIX_MONTHS" | "YEARLY";
  hasDietPlan?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plan?.id || "plan-strength");
  const [selectedCycle, setSelectedCycle] = useState<"MONTHLY" | "SIX_MONTHS" | "YEARLY">(billingCycle);

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "BANK_TRANSFER" | "CASH" | "CARD">("UPI");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const durationMultiplier = selectedCycle === "MONTHLY" ? 1 : selectedCycle === "SIX_MONTHS" ? 6 : 12;
  const currentPlanName = plan?.name || (selectedPlanId === "plan-cardio-strength" ? "Cardio + Strength Training" : selectedPlanId === "plan-cardio-strength-core" ? "Cardio + Strength + Core" : "Strength Training");

  const planBasePrice =
    selectedCycle === "MONTHLY"
      ? (plan?.priceMonthly || 800)
      : selectedCycle === "SIX_MONTHS"
      ? (plan?.priceSixMonths || 4500)
      : (plan?.priceYearly || 9000);

  const dietPrice = hasDietPlan ? 500 * durationMultiplier : 0;
  const basePrice = planBasePrice + dietPrice;
  const taxAmount = Math.round(basePrice * 0.18); // 18% GST
  const totalAmount = basePrice + taxAmount;

  const cycleLabel =
    selectedCycle === "MONTHLY" ? "Monthly" : selectedCycle === "SIX_MONTHS" ? "6 Months" : "Yearly";

  React.useEffect(() => {
    // Lock background body scroll when modal opens to prevent background scrolling/jumping
    const scrollY = window.scrollY;
    const originalStyleOverflow = document.body.style.overflow;
    const originalStylePosition = document.body.style.position;
    const originalStyleTop = document.body.style.top;
    const originalStyleWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      // Restore background scroll cleanly when modal closes
      document.body.style.overflow = originalStyleOverflow;
      document.body.style.position = originalStylePosition;
      document.body.style.top = originalStyleTop;
      document.body.style.width = originalStyleWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      setErrorMsg("Please enter your payment Transaction ID / UTR reference number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch("/api/memberships/verify-request", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlanId,
          billingCycle: selectedCycle,
          amount: totalAmount,
          paymentMethod: paymentMethod,
          transactionRef: transactionRef.trim(),
          receiptUrl: receiptUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSubmitting(false);
        setErrorMsg(data.message || "Failed to submit verification request");
        showToast("Submission Error", data.message || "Request failed", "error");
        return;
      }

      setIsSubmitting(false);
      showToast(
        "Verification Request Submitted!",
        "Your payment record was received. Admin will verify and activate your membership pass shortly.",
        "success"
      );
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Network error submitting request");
      showToast("Error", err?.message || "Failed to connect to server", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-extrabold text-white font-display">
              Submit Membership Payment Verification
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmitVerification}
          className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain touch-pan-y flex-1"
        >
          {/* Membership Plan Selection Dropdown */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
              Membership Plan — Select Plan <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Package Tier</span>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="plan-strength">Strength Training</option>
                  <option value="plan-cardio-strength">Cardio + Strength</option>
                  <option value="plan-cardio-strength-core">Cardio + Strength + Core</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Plan Duration</span>
                <select
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value as "MONTHLY" | "SIX_MONTHS" | "YEARLY")}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-bold outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="MONTHLY">Monthly Plan</option>
                  <option value="SIX_MONTHS">6 Months Plan</option>
                  <option value="YEARLY">Yearly Plan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">{currentPlanName}</h4>
                <span className="text-xs text-cyan-400 font-semibold">{cycleLabel.toUpperCase()} DURATION</span>
              </div>
              <span className="text-lg font-black text-white">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Base Membership ({cycleLabel})</span>
                <span>{formatCurrency(planBasePrice)}</span>
              </div>
              {hasDietPlan && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Diet Plan Add-on (+₹500/mo)</span>
                  <span>+{formatCurrency(dietPrice)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-white text-sm">
                <span>Total Amount Paid</span>
                <span className="text-cyan-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Payment Method Used
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === "UPI"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-neon"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / GPay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-neon"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank NetBank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === "CASH"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-neon"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cash at Desk</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === "CARD"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-neon"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Debit/Credit</span>
              </button>
            </div>
          </div>

          {/* Payment Reference / UTR Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Transaction Ref / UTR Number <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UTR1234567890 or TXN987654"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Enter the transaction reference or receipt number from your payment app/bank.
            </p>
          </div>

          {/* Optional Receipt URL / Attachment Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Receipt / Payment Proof URL <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="https://drive.google.com/... or receipt link"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Upon submission, Admin will verify the transaction amount and activate your membership pass.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !transactionRef.trim()}
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            )}
            <span>Submit Request for Admin Verification</span>
          </button>
        </form>
      </div>
    </div>
  );
}

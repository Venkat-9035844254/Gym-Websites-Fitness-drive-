"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight, RefreshCw, Download, FileText } from "lucide-react";
import Link from "next/link";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

  const [loading, setLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchStatus = async () => {
    if (!orderId) {
      setLoading(false);
      setErrorMsg("No Order ID provided in URL parameters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        setOrderData(data.order);
      } else {
        setErrorMsg(data.message || "Unable to fetch payment status.");
      }
    } catch (err: any) {
      setErrorMsg("Network error checking payment status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-black text-white font-display">Verifying Payment Status...</h2>
        <p className="text-xs text-slate-400">Please wait while we confirm your payment details securely.</p>
      </div>
    );
  }

  if (errorMsg || !orderData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
          <XCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-display">Payment Status Error</h2>
          <p className="text-xs text-slate-400">{errorMsg || "Transaction could not be verified."}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Link
            href="/membership"
            className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all text-center"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard/member"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = orderData.status === "PAID";
  const isFailed = orderData.status === "FAILED";
  const isRefunded = orderData.status === "REFUNDED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {isPaid && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-neon">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                Payment Successful
              </span>
              <h1 className="text-3xl font-black text-white font-display mt-3">TRANSFORMATION UNLOCKED!</h1>
              <p className="text-xs text-slate-400 mt-1">
                Your payment was verified and your gym membership plan is now fully active.
              </p>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold uppercase tracking-wider">
                Payment Failed
              </span>
              <h1 className="text-3xl font-black text-white font-display mt-3">PAYMENT COULD NOT BE COMPLETED</h1>
              <p className="text-xs text-slate-400 mt-1">
                The payment attempt failed or was cancelled. No charges were made.
              </p>
            </div>
          </>
        )}

        {!isPaid && !isFailed && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                Payment {orderData.status}
              </span>
              <h1 className="text-3xl font-black text-white font-display mt-3">PROCESSING TRANSACTION</h1>
              <p className="text-xs text-slate-400 mt-1">
                We are checking with Razorpay for final payment settlement status.
              </p>
            </div>
          </>
        )}

        {/* Transaction Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-left space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 font-sans">
            <span className="text-slate-400 text-xs font-semibold">Purchased Item</span>
            <span className="text-white font-black text-sm">{orderData.plan?.name || "Fitness Drive Membership"}</span>
          </div>

          <div className="space-y-2.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Razorpay Order ID</span>
              <span className="text-cyan-400 font-bold">{orderData.razorpayOrderId}</span>
            </div>

            {orderData.payment?.razorpayPaymentId && (
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Payment ID</span>
                <span className="text-white">{orderData.payment.razorpayPaymentId}</span>
              </div>
            )}

            {orderData.payment?.invoice?.invoiceNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Official Invoice</span>
                <span className="text-emerald-400 font-bold">{orderData.payment.invoice.invoiceNumber}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Billing Cycle</span>
              <span className="text-slate-200 uppercase">{orderData.billingCycle || "MONTHLY"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time</span>
              <span className="text-slate-200">{new Date(orderData.createdAt).toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-800 font-sans text-sm font-black">
              <span className="text-white">Total Amount Paid</span>
              <span className="text-cyan-400">{formatCurrency(orderData.amount)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isPaid && (
            <Link
              href="/dashboard/member"
              className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Member Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {isFailed && (
            <Link
              href="/membership"
              className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all text-center"
            >
              Try Payment Again
            </Link>
          )}

          {!isPaid && !isFailed && (
            <button
              onClick={fetchStatus}
              className="flex-1 py-4 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Re-check Payment Status</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}

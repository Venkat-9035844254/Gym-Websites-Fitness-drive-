"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, Download, Dumbbell, CheckCircle2 } from "lucide-react";

export function PrintableInvoice({ invoice }: { invoice: Invoice }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-left space-y-6 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500 text-slate-950">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white font-display print:text-black">
              APEX ATHLETICS
            </span>
            <span className="block text-[10px] text-slate-400">Official Tax Receipt</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-cyan-400">{invoice.invoiceNumber}</span>
          <span className="block text-[10px] text-slate-400">Issued: {formatDate(invoice.issuedDate)}</span>
        </div>
      </div>

      {/* Member Details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Billed To:</span>
          <span className="font-bold text-white block">{invoice.userName}</span>
          <span className="text-slate-400 block">{invoice.userEmail}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Method:</span>
          <span className="font-bold text-white block">{invoice.paymentMethod}</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> PAID
          </span>
        </div>
      </div>

      {/* Table breakdown */}
      <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
        <div className="bg-slate-900 px-4 py-2 flex justify-between font-bold text-slate-300">
          <span>Description / Plan</span>
          <span>Amount</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex justify-between text-white">
            <span>{invoice.planName}</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>GST Tax (18%)</span>
            <span>{formatCurrency(invoice.taxAmount)}</span>
          </div>
        </div>
        <div className="bg-slate-900/60 px-4 py-3 flex justify-between font-bold text-sm text-cyan-400 border-t border-slate-800">
          <span>Total Paid</span>
          <span>{formatCurrency(invoice.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  );
}

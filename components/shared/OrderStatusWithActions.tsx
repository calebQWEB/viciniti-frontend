"use client";

import { Order } from "@/types/order";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  FileCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface OrderStatusWithActionsProps {
  order: Order;
  isSeller: boolean;
  isBuyer: boolean;
}

// Shared status pill styles
const badge = {
  green: "text-[#2D6A4F] bg-[#2D6A4F]/10 border-[#2D6A4F]/15",
  amber: "text-amber-700 bg-amber-50 border-amber-100",
  red: "text-red-700 bg-red-50 border-red-100",
  gray: "text-gray-500 bg-gray-100 border-gray-200",
};

const primaryButton =
  "block px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white rounded-xl font-bold text-xs text-center transition-all active:scale-[0.98]";

const outlineRedButton =
  "block px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs text-center transition-all border border-red-100";

export default function OrderStatusWithActions({
  order,
  isSeller,
  isBuyer,
}: OrderStatusWithActionsProps) {
  if (!order) return null;

  // Payment pending — waiting for payment confirmation
  if (order.status === "pending") {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.amber}`}
      >
        <Clock className="w-3.5 h-3.5" />
        Awaiting Payment
      </div>
    );
  }

  // Paid — payment confirmed, awaiting seller fulfillment
  if (order.status === "paid") {
    return (
      <div className="space-y-2.5">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.green}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Payment Confirmed
        </div>

        {isSeller && (
          <Link
            href={`/dashboard/sales/${order.id}/complete`}
            className={primaryButton}
          >
            Mark as Complete
          </Link>
        )}

        {isBuyer && (
          <div
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${badge.amber}`}
          >
            Waiting for seller to mark complete...
          </div>
        )}
      </div>
    );
  }

  // Fulfilled — seller marked complete, waiting for buyer confirmation
  if (order.status === "fulfilled") {
    return (
      <div className="space-y-2.5">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.gray}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Awaiting Confirmation
        </div>

        {isSeller && (
          <div
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${badge.amber}`}
          >
            Waiting for buyer to confirm...
          </div>
        )}

        {isBuyer && (
          <Link
            href={`/dashboard/purchases/${order.id}/confirm`}
            className={primaryButton}
          >
            Confirm Completion
          </Link>
        )}
      </div>
    );
  }

  // Completed — buyer confirmed receipt
  if (order.status === "completed") {
    if (isSeller) {
      // Payout already completed
      if (order.payout_completed_at) {
        return (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.green}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Paid Out
          </div>
        );
      }

      // Payout scheduled, still pending
      if (order.payout_due_at) {
        const payoutDate = new Date(order.payout_due_at).toLocaleDateString(
          "en-NG",
          { day: "numeric", month: "short", year: "numeric" },
        );
        return (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.amber}`}
          >
            <Clock className="w-3.5 h-3.5" />
            Payout on {payoutDate}
          </div>
        );
      }

      // No payout scheduled — seller needs to add a bank account
      return (
        <div className="space-y-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.red}`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Action Needed: Add Bank Account
          </div>
          <Link href="/dashboard/profile" className={primaryButton}>
            Add Bank Account
          </Link>
        </div>
      );
    }

    // Buyer view — unchanged
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.green}`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Completed
      </div>
    );
  }

  // Cancelled
  if (order.status === "cancelled") {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.red}`}
      >
        <XCircle className="w-3.5 h-3.5" />
        Cancelled
      </div>
    );
  }

  // Disputed
  if (order.status === "disputed") {
    return (
      <div className="space-y-2.5">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.red}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Dispute Filed
        </div>
        {isSeller && (
          <Link
            href={`/dashboard/sales/${order.id}/dispute`}
            className={outlineRedButton}
          >
            View Dispute Details
          </Link>
        )}
        {isBuyer && (
          <Link
            href={`/dashboard/purchases/${order.id}/dispute`}
            className={outlineRedButton}
          >
            Track Dispute Status
          </Link>
        )}
      </div>
    );
  }

  // Refunded — chargeback lost, buyer refunded
  if (order.status === "refunded") {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${badge.gray}`}
      >
        <XCircle className="w-3.5 h-3.5" />
        Refunded
      </div>
    );
  }

  return null;
}

// Helper component to show completion progress
export function CompletionProgress({ order }: { order: Order }) {
  const steps = [
    {
      id: 1,
      label: "Payment Made",
      completed: ["paid", "fulfilled", "completed"].includes(order.status),
      icon: <Home className="w-3.5 h-3.5" />,
    },
    {
      id: 2,
      label: "Seller Completes",
      completed: ["fulfilled", "completed"].includes(order.status),
      icon: <FileCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 3,
      label: "Buyer Confirms",
      completed: order.status === "completed",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-gray-50">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              step.completed
                ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step.icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 hidden sm:inline">
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`w-4 sm:w-6 h-0.5 rounded-full ${
                step.completed ? "bg-[#2D6A4F]/30" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

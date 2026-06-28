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

export default function OrderStatusWithActions({
  order,
  isSeller,
  isBuyer,
}: OrderStatusWithActionsProps) {
  // Payment pending
  if (order.status === "pending") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-sm font-medium border border-amber-200">
          <Clock className="w-4 h-4" />
          Payment Pending
        </div>

        {/* Seller waiting for seller to mark complete */}
        {isSeller && !order.completed_at && (
          <Link
            href={`/dashboard/sales/${order.id}/complete`}
            className="block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition text-center"
          >
            Mark as Complete
          </Link>
        )}

        {/* Seller completed, waiting for buyer */}
        {isSeller && order.completed_at && !order.buyer_accepted_at && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium">
            Waiting for buyer to confirm...
          </div>
        )}

        {/* Buyer waiting for seller to mark complete */}
        {isBuyer && !order.completed_at && (
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium">
            Waiting for seller to mark complete...
          </div>
        )}

        {/* Buyer can confirm */}
        {isBuyer && order.completed_at && !order.buyer_accepted_at && (
          <Link
            href={`/dashboard/purchases/${order.id}/confirm`}
            className="block px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition text-center"
          >
            Confirm Completion
          </Link>
        )}
      </div>
    );
  }

  // Completed
  if (order.status === "completed") {
    return (
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200">
        <CheckCircle className="w-4 h-4" />
        Completed
      </div>
    );
  }

  // Cancelled
  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium border border-red-200">
        <XCircle className="w-4 h-4" />
        Cancelled
      </div>
    );
  }

  // Disputed
  if (order.status === "disputed") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium border border-red-200">
          <AlertCircle className="w-4 h-4" />
          Dispute Filed
        </div>

        <Link
          href={`/dashboard/sales/${order.id}/dispute`}
          className="block px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium text-sm hover:bg-red-100 transition text-center border border-red-200"
        >
          View Dispute Details
        </Link>
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
      completed: order.status !== "pending" || order.completed_at,
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 2,
      label: "Seller Completes",
      completed: !!order.completed_at,
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      id: 3,
      label: "Buyer Confirms",
      completed: !!order.buyer_accepted_at,
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              step.completed
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {step.icon}
          </div>
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div
              className={`w-2 h-0.5 hidden sm:block ${
                step.completed ? "bg-green-400" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface BuyerDisputeDetails {
  transaction_id: string;
  reference: string;
  amount: number;
  chargeback_status: "chargeback_filed" | "chargeback_won" | "chargeback_lost";
  chargeback_reason: string | null;
  chargeback_filed_at: string | null;
  chargeback_resolved_at: string | null;
  listing_title: string;
}

const STATUS_CONFIG = {
  chargeback_filed: {
    label: "Dispute Under Investigation",
    description:
      "Your dispute has been filed and is currently being reviewed by the card issuer. This process typically takes 7-14 business days.",
    bannerClass: "bg-red-50 border-red-200",
    iconClass: "bg-red-100 text-red-600",
    labelClass: "text-red-900",
    descClass: "text-red-700",
    Icon: AlertTriangle,
  },
  chargeback_won: {
    label: "Dispute Won — Refund Issued",
    description:
      "Your dispute was successful. The transaction amount will be refunded to your bank account within 5-10 business days.",
    bannerClass: "bg-emerald-50 border-emerald-200",
    iconClass: "bg-emerald-100 text-emerald-600",
    labelClass: "text-emerald-900",
    descClass: "text-emerald-700",
    Icon: CheckCircle2,
  },
  chargeback_lost: {
    label: "Dispute Unsuccessful",
    description:
      "Unfortunately, the card issuer decided in favor of the seller. The transaction amount will not be refunded.",
    bannerClass: "bg-amber-50 border-amber-200",
    iconClass: "bg-amber-100 text-amber-600",
    labelClass: "text-amber-900",
    descClass: "text-amber-700",
    Icon: XCircle,
  },
};

export default function BuyerDisputePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: disputeData, isLoading } = useQuery({
    queryKey: ["buyer-dispute", id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}/dispute/buyer`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
        </div>
      </MainLayout>
    );
  }

  const dispute: BuyerDisputeDetails = disputeData?.dispute;

  if (!dispute) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-8 px-6">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/purchases"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Dispute Status</h1>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            {disputeData?.message || "No chargeback filed for this order."}
          </div>
        </div>
      </MainLayout>
    );
  }

  const cfg = STATUS_CONFIG[dispute.chargeback_status];
  const StatusIcon = cfg.Icon;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/purchases"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dispute Status</h1>
            <p className="text-xs text-gray-400">
              Order #{id?.toString().slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`flex items-start gap-4 rounded-xl p-5 border ${cfg.bannerClass}`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconClass}`}
          >
            <StatusIcon size={18} />
          </div>
          <div>
            <p className={`font-bold text-sm mb-1 ${cfg.labelClass}`}>
              {cfg.label}
            </p>
            <p className={`text-xs leading-relaxed ${cfg.descClass}`}>
              {cfg.description}
            </p>
          </div>
        </div>

        {/* Dispute Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center">
              <Package size={13} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Dispute Details
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
              <span className="text-xs text-gray-500 flex-1">Listing</span>
              <span className="text-xs font-semibold text-gray-900">
                {dispute.listing_title}
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
              <span className="text-xs text-gray-500 flex-1">Amount</span>
              <span className="text-xs font-bold text-gray-900">
                ₦{dispute.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
              <span className="text-xs text-gray-500 flex-1">Reference</span>
              <span className="text-xs font-mono font-semibold text-gray-900">
                {dispute.reference}
              </span>
            </div>
            {dispute.chargeback_reason && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                <span className="text-xs text-gray-500 flex-1">Reason</span>
                <span className="text-xs font-semibold text-gray-900">
                  {dispute.chargeback_reason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
              <Clock size={13} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Timeline
            </p>
          </div>

          <div className="space-y-1">
            {dispute.chargeback_filed_at && (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-600 whitespace-nowrap">
                  {new Date(dispute.chargeback_filed_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Dispute filed
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Chargeback initiated with card issuer
                  </p>
                </div>
              </div>
            )}

            {dispute.chargeback_resolved_at ? (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-600 whitespace-nowrap">
                  {new Date(dispute.chargeback_resolved_at).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Dispute resolved
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Decision issued by card issuer
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg opacity-50">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-400 whitespace-nowrap">
                  Pending
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Awaiting resolution
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Estimated 7-14 business days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard/purchases")}
          className="w-full py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition"
        >
          Back to Purchases
        </button>
      </div>
    </MainLayout>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Variants } from "framer-motion";
import api from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import PhotoUploader from "@/components/shared/PhotoUploader";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  User,
  Clock,
  Star,
  Camera,
  FileText,
  Hash,
  ChevronRight,
  Shield,
  MessageSquare,
  Loader2,
  ExternalLink,
  Calendar,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DisputeDetails {
  transaction_id: string;
  reference: string;
  amount: number;
  chargeback_status: "chargeback_filed" | "chargeback_won" | "chargeback_lost";
  chargeback_reason: string | null;
  chargeback_filed_at: string | null;
  chargeback_resolved_at: string | null;
  seller_response: string | null;
  evidence_photos: string[];
  buyer_name: string;
  listing_title: string;
}

interface Evidence {
  completion_photos: string[];
  completion_notes: string;
  completed_at: string;
  buyer_accepted_at: string | null;
  buyer_name: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  chargeback_filed: {
    label: "Dispute Filed — Under Review",
    description:
      "This chargeback is currently being reviewed. Submit your defense below to strengthen your case with the bank.",
    bannerClass:
      "bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-red-100/50",
    iconClass: "bg-red-100 text-red-600",
    labelClass: "text-red-900",
    descClass: "text-red-700",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    Icon: AlertTriangle,
    dot: "bg-red-500",
  },
  chargeback_won: {
    label: "Dispute Won — Resolved in Your Favor",
    description:
      "Congratulations — the bank ruled in your favor. The payment has been returned to your account.",
    bannerClass:
      "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-emerald-100/50",
    iconClass: "bg-emerald-100 text-emerald-600",
    labelClass: "text-emerald-900",
    descClass: "text-emerald-700",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Icon: CheckCircle2,
    dot: "bg-emerald-500",
  },
  chargeback_lost: {
    label: "Dispute Lost — Resolved Against You",
    description:
      "The bank decided in favor of the buyer. The transaction has been refunded.",
    bannerClass:
      "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-amber-100/50",
    iconClass: "bg-amber-100 text-amber-600",
    labelClass: "text-amber-900",
    descClass: "text-amber-700",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    Icon: XCircle,
    dot: "bg-amber-500",
  },
};

// ─── Timeline builder ──────────────────────────────────────────────────────────

function buildTimeline(dispute: DisputeDetails, evidence: Evidence) {
  const items: {
    date: string;
    title: string;
    sub: string;
    active: boolean;
    icon: React.ReactNode;
  }[] = [];

  if (dispute.chargeback_resolved_at) {
    items.push({
      date: new Date(dispute.chargeback_resolved_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      title:
        dispute.chargeback_status === "chargeback_won"
          ? "Dispute resolved — seller won"
          : "Dispute resolved — buyer won",
      sub: "Decision issued by card issuer",
      active: true,
      icon:
        dispute.chargeback_status === "chargeback_won" ? (
          <CheckCircle2 size={14} />
        ) : (
          <XCircle size={14} />
        ),
    });
  }

  if (dispute.chargeback_filed_at) {
    items.push({
      date: new Date(dispute.chargeback_filed_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      title: "Dispute filed by buyer",
      sub: "Chargeback initiated with card issuer",
      active: true,
      icon: <AlertTriangle size={14} />,
    });
  }

  if (evidence?.buyer_accepted_at) {
    items.push({
      date: new Date(evidence.buyer_accepted_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      title: "Buyer confirmed completion",
      sub: "Order accepted in-app by buyer",
      active: true,
      icon: <Star size={14} />,
    });
  }

  if (evidence?.completed_at) {
    items.push({
      date: new Date(evidence.completed_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      title: "Order marked as completed",
      sub: "Seller submitted delivery confirmation",
      active: true,
      icon: <Package size={14} />,
    });
  }

  if (!dispute.chargeback_resolved_at) {
    items.push({
      date: "Pending",
      title: "Awaiting resolution",
      sub: "Estimated 7–14 business days",
      active: false,
      icon: <Clock size={14} />,
    });
  }

  return items;
}

// ─── Animation variants ────────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DisputePage() {
  const { id } = useParams();
  const [responseText, setResponseText] = useState("");
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [showPhotos, setShowPhotos] = useState(false);

  const { data: disputeData, isLoading } = useQuery({
    queryKey: ["dispute", id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}/dispute`);
      return response.data;
    },
  });

  const { mutate: submitResponse, isPending } = useMutation({
    mutationFn: async () => {
      if (!responseText.trim()) throw new Error("Please enter your response");
      const response = await api.post(`/orders/${id}/chargeback-response`, {
        response_notes: responseText,
        evidence_photos: evidencePhotos,
      });
      return response.data;
    },
    onSuccess: () => {
      setResponseText("");
      setEvidencePhotos([]);
      window.location.reload();
    },
    onError: (err: any) => {
      setSubmitError(
        err.message ||
          err.response?.data?.message ||
          "Failed to submit response",
      );
    },
  });

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8 text-blue-500" />
          </motion.div>
          <p className="text-xs text-gray-500 font-medium">
            Loading dispute details...
          </p>
        </div>
      </MainLayout>
    );
  }

  const dispute: DisputeDetails = disputeData?.dispute;
  const evidence: Evidence = disputeData?.evidence;

  // ─── No chargeback ────────────────────────────────────────────────────────────

  if (!dispute) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <Link
              href="/dashboard/sales"
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Chargeback Dispute
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Order #{id}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm text-yellow-900">
                  No Active Dispute
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  {disputeData?.message ||
                    "No chargeback filed for this order."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  const cfg = STATUS_CONFIG[dispute.chargeback_status];
  const StatusIcon = cfg.Icon;
  const timeline = buildTimeline(dispute, evidence);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto py-10 px-6 space-y-6"
      >
        {/* Breadcrumb */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <Link
            href="/dashboard/sales"
            className="group flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 rounded-lg px-3 py-2"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Sales
          </Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-xs text-gray-500">Dashboard</span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-xs text-gray-500">Sales</span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-xs font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded-md border border-blue-100">
            Dispute #{dispute.transaction_id.slice(0, 8)}
          </span>
        </motion.div>

        {/* Status banner */}
        <motion.div variants={itemVariants}>
          <div
            className={`relative overflow-hidden flex items-start gap-4 rounded-xl p-5 border shadow-sm ${cfg.bannerClass}`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ring-4 ring-white/40 ${cfg.iconClass}`}
            >
              <StatusIcon size={18} />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-1">
                <p className={`font-semibold text-sm ${cfg.labelClass}`}>
                  {cfg.label}
                </p>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}
                >
                  {dispute.chargeback_status.replace(/_/g, " ")}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${cfg.descClass}`}>
                {cfg.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="group bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                <CreditCard size={12} />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Amount in Dispute
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              ₦{dispute.amount.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Full transaction value
            </p>
          </div>

          <div className="group bg-gradient-to-br from-white to-purple-50/30 border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-7 h-7 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center">
                <User size={12} />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Buyer
              </p>
            </div>
            <p className="text-base font-bold text-gray-900">
              {dispute.buyer_name}
            </p>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <Calendar size={10} />
              {dispute.chargeback_filed_at
                ? `Filed ${new Date(dispute.chargeback_filed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "—"}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-white to-amber-50/30 border border-gray-200 hover:border-amber-300 hover:shadow-md rounded-xl p-4 transition-all duration-200">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-md flex items-center justify-center">
                <Hash size={12} />
              </div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Reference
              </p>
            </div>
            <p className="text-xs font-mono font-semibold text-gray-900 break-all bg-gray-100 rounded-md px-2.5 py-1.5">
              {dispute.reference}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Transaction ID</p>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Order details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-7 h-7 bg-gray-100 text-gray-600 rounded-md flex items-center justify-center">
                <Package size={13} />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Order Details
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-500 flex-1">Listing</span>
                <span className="text-xs font-semibold text-gray-900 text-right max-w-[150px] truncate">
                  {dispute.listing_title}
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-500 flex-1">Buyer</span>
                <span className="text-xs font-semibold text-gray-900">
                  {dispute.buyer_name}
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-500 flex-1">Amount</span>
                <span className="text-xs font-bold text-gray-900">
                  ₦{dispute.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {dispute.chargeback_reason && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-7 h-7 bg-red-50 text-red-600 rounded-md flex items-center justify-center">
                    <Shield size={13} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Dispute Reason
                  </p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-2 border-red-400 rounded-r-lg px-3 py-2.5">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {dispute.chargeback_reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                <Clock size={13} />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Timeline
              </p>
            </div>

            <div className="space-y-1">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    item.active ? "hover:bg-gray-50" : "opacity-50"
                  }`}
                >
                  {/* Date badge */}
                  <div className="shrink-0 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap ${
                        item.active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {item.date}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        item.active ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Evidence */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200"
        >
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center">
              <FileText size={13} />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Evidence in Your Favor
            </p>
          </div>

          <div className="space-y-4">
            {/* Buyer confirmed */}
            {evidence?.buyer_accepted_at && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg"
              >
                <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0 ring-3 ring-purple-50">
                  <Star size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-bold text-purple-900">
                      Buyer Confirmed Completion
                    </p>
                    <span className="inline-flex text-[8px] font-bold uppercase tracking-wider bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                      Strongest
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    {evidence.buyer_name} accepted and confirmed the order on{" "}
                    {new Date(evidence.buyer_accepted_at).toLocaleString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Completion photos */}
            {evidence?.completion_photos?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg"
              >
                <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 ring-3 ring-emerald-50">
                  <Camera size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-bold text-emerald-900">
                      {evidence.completion_photos.length} Completion Photo
                      {evidence.completion_photos.length !== 1 ? "s" : ""}
                    </p>
                    <span className="inline-flex text-[8px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full">
                      Strong
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mb-2">
                    Photos uploaded at time of delivery
                  </p>
                  <button
                    onClick={() => setShowPhotos(!showPhotos)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-white/60 hover:bg-white px-2.5 py-1.5 rounded-md transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
                  >
                    {showPhotos ? "Hide Photos" : "View Photos"}
                    <ExternalLink size={11} />
                  </button>

                  <AnimatePresence>
                    {showPhotos && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2 mt-3"
                      >
                        {evidence.completion_photos.map((photo, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                          >
                            <Image
                              src={photo}
                              alt={`Completion photo ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Completion notes */}
            {evidence?.completion_notes && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg"
              >
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 ring-3 ring-blue-50">
                  <MessageSquare size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-900 mb-1">
                    Work Description on Record
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed bg-white/50 rounded-lg p-2.5">
                    {evidence.completion_notes}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Defense form */}
        {dispute.chargeback_status === "chargeback_filed" && (
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                <Shield size={13} />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Submit Your Defense
              </h2>
            </div>
            <p className="text-xs text-gray-500 ml-8.5 mb-4 leading-relaxed">
              Add further context, evidence, or explanation. This will be
              reviewed by the bank handling the chargeback.
            </p>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs mb-4 flex items-start gap-2"
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </motion.div>
            )}

            {dispute.seller_response && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Your Previous Response
                </p>
                <p className="text-xs text-gray-700 leading-relaxed mb-3">
                  {dispute.seller_response}
                </p>
                {dispute.evidence_photos &&
                  dispute.evidence_photos.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Evidence Photos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {dispute.evidence_photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200 hover:ring-gray-300 transition-all group"
                          >
                            <Image
                              src={photo}
                              alt={`Evidence photo ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitResponse();
              }}
              className="space-y-4"
            >
              {/* Evidence photos */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Evidence Photos (Optional)
                </label>
                <PhotoUploader
                  onPhotosChange={setEvidencePhotos}
                  maxPhotos={5}
                />
                {evidencePhotos.length > 0 && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    {evidencePhotos.length} photo
                    {evidencePhotos.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
              <div>
                {/* Text response */}
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Your Response <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => {
                    setResponseText(e.target.value);
                    setSubmitError("");
                  }}
                  placeholder="Provide additional context, reference specific evidence, or clarify any aspect of the transaction…"
                  rows={5}
                  maxLength={2000}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400 leading-relaxed transition-all duration-200"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-gray-400">
                    {responseText.length}/2000 characters
                  </p>
                  {responseText.length > 1800 && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      Approaching limit
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <Link
                  href="/dashboard/sales"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isPending || !responseText.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shield size={13} />
                      Submit Response
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}

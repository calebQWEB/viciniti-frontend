"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TransactionStatus, TransactionType } from "@/types/transaction";
import { formatPrice } from "@/lib/utils";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  reference: string;
  amount: number;
  fee: number;
  type: TransactionType;
  status: TransactionStatus;
  created_at: string;
  order_id: string | null;
  order_summary: { id: string; item_title: string } | null;
}

interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface Stats {
  total_spent: number;
  total_earned: number;
  total_fees: number;
  total_transactions: number;
}

const PAGE_SIZE = 15;

const STATUS_STYLES: Record<
  TransactionStatus,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200/50",
    dot: "bg-amber-400",
  },
  success: {
    label: "Success",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    classes: "bg-rose-50 text-rose-700 border-rose-200/50",
    dot: "bg-rose-400",
  },
  chargeback_filed: {
    label: "Chargeback Filed",
    classes: "bg-orange-50 text-orange-700 border-orange-200/50",
    dot: "bg-orange-400",
  },
  chargeback_won: {
    label: "Chargeback Won",
    classes: "bg-sky-50 text-sky-700 border-sky-200/50",
    dot: "bg-sky-400",
  },
  chargeback_lost: {
    label: "Chargeback Lost",
    classes: "bg-red-50 text-red-700 border-red-200/50",
    dot: "bg-red-400",
  },
};

const TYPE_FILTERS: { key: TransactionType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "payment", label: "Payments" },
  { key: "payout", label: "Payouts" },
];

const STATUS_FILTERS: (TransactionStatus | "all")[] = [
  "all",
  "pending",
  "success",
  "failed",
  "chargeback_filed",
  "chargeback_won",
  "chargeback_lost",
];

function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, classes, dot } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex items-center gap-3 sm:gap-5">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-md sm:text-xl font-black text-gray-900 italic tracking-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const date = new Date(transaction.created_at);
  const isPayment = transaction.type === "payment";

  return (
    <div className="group flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl p-5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
      <div className="flex items-center gap-5 min-w-0">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            isPayment
              ? "bg-rose-50 group-hover:bg-rose-100"
              : "bg-emerald-50 group-hover:bg-emerald-100"
          }`}
        >
          {isPayment ? (
            <ArrowUpRight className="w-5 h-5 text-rose-500" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <StatusBadge status={transaction.status} />
          <h4 className="text-xs font-bold text-gray-900 truncate">
            {transaction.order_summary?.item_title ??
              (isPayment ? "Payment" : "Payout")}
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium flex-wrap">
            <span>
              {date.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="uppercase tracking-wide font-bold text-gray-600 truncate max-w-[140px] sm:max-w-none">
              Ref: {transaction.reference}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full lg:w-auto">
        <div className="text-left lg:text-right flex-1 lg:flex-none">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Amount
          </p>
          <p
            className={`text-md font-black italic tracking-tight whitespace-nowrap ${isPayment ? "text-rose-500" : "text-emerald-500"}`}
          >
            {isPayment ? "-" : "+"}
            {formatPrice(transaction.amount)}
          </p>
        </div>
        <div className="w-px h-8 bg-gray-100 shrink-0" />
        <div className="text-left lg:text-right flex-1 lg:flex-none">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Fee
          </p>
          <p className="text-sm font-bold text-gray-400 whitespace-nowrap">
            {formatPrice(transaction.fee)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, typeFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get("/transactions/", {
        params: {
          page,
          limit: PAGE_SIZE,
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      return response.data as PaginatedTransactions;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["transaction-stats"],
    queryFn: async () => {
      const response = await api.get("/transactions/stats");
      return response.data as Stats;
    },
  });

  const transactions = data?.items;
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16">
        {/* Header */}
        <div className="space-y-2 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[8px] font-bold uppercase tracking-wider">
            <Wallet className="w-3 h-3" />
            Finances
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Payments & Earnings
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">
            A full overview of your financial activity on Viciniti.
          </p>
        </div>

        {/* Summary Stats */}
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-gray-50 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <StatCard
              label="Total Spent"
              value={formatPrice(stats.total_spent)}
              icon={<ArrowUpRight className="w-6 h-6 text-rose-500" />}
              accent="bg-rose-50"
            />
            <StatCard
              label="Total Earned"
              value={formatPrice(stats.total_earned)}
              icon={<ArrowDownLeft className="w-6 h-6 text-emerald-500" />}
              accent="bg-emerald-50"
            />
            <StatCard
              label="Fees Paid"
              value={formatPrice(stats.total_fees)}
              icon={
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D6A4F]" />
              }
              accent="bg-[#2D6A4F]/8"
            />
            <StatCard
              label="Transactions"
              value={String(stats.total_transactions)}
              icon={<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4A261]" />}
              accent="bg-[#F4A261]/10"
            />
          </div>
        ) : null}

        {/* Type tabs */}
        <div className="flex items-center gap-6 border-b border-gray-100 mb-4">
          {TYPE_FILTERS.map((f) => {
            const isActive = typeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`relative pb-3 pt-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#2D6A4F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#2D6A4F] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Status filter pills */}
        <div className="-mx-4 sm:-mx-6 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pb-1">
            {STATUS_FILTERS.map((key) => {
              const isActive = statusFilter === key;
              const label =
                key === "all" ? "All Statuses" : STATUS_STYLES[key].label;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#2D6A4F] border-[#2D6A4F] text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#2D6A4F]/40 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 sm:h-24 bg-gray-50 animate-pulse rounded-2xl sm:rounded-3xl"
              />
            ))
          ) : transactions && transactions.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Transaction History
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {total} transaction{total !== 1 ? "s" : ""}
                </p>
              </div>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-[40px] border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                No transactions yet
              </h3>
              <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium text-sm sm:text-base">
                Your payment history will appear here once you make or receive a
                payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

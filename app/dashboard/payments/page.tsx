"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Transaction, TransactionStatus } from "@/types/transaction";
import { formatPrice } from "@/lib/utils";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

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
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, classes, dot } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg border ${classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dot}`} />
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
    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-3 sm:gap-5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-lg sm:text-2xl font-black text-gray-900 italic tracking-tight">
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
      {/* Left — icon + info */}
      <div className="flex items-center gap-5 min-w-0">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
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
          <StatusBadge status={transaction.status as TransactionStatus} />
          <h4 className="text-sm font-bold text-gray-900">
            {isPayment ? "Payment" : "Payout"}
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium flex-wrap">
            <span>
              {date.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
            <span className="uppercase tracking-wide font-bold text-gray-400 truncate max-w-[140px] sm:max-w-none">
              Ref: {transaction.reference}
            </span>
          </div>
        </div>
      </div>

      {/* Right — amounts */}
      <div className="flex items-center gap-6 w-full lg:w-auto">
        <div className="text-left lg:text-right flex-1 lg:flex-none">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Amount
          </p>
          <p
            className={`text-lg font-black italic tracking-tight ${
              isPayment ? "text-rose-500" : "text-emerald-500"
            }`}
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
          <p className="text-sm font-bold text-gray-400">
            {formatPrice(transaction.fee)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get("/transactions/");
      return response.data as Transaction[];
    },
  });

  // Compute summary stats from transaction data
  const stats = transactions
    ? {
        totalSpent: transactions
          .filter((t) => t.type === "payment" && t.status === "success")
          .reduce((sum, t) => sum + t.amount, 0),
        totalEarned: transactions
          .filter((t) => t.type === "payout" && t.status === "success")
          .reduce((sum, t) => sum + t.amount, 0),
        totalFees: transactions
          .filter((t) => t.status === "success")
          .reduce((sum, t) => sum + t.fee, 0),
        totalTransactions: transactions.filter((t) => t.status === "success")
          .length,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-16">
        {/* Header */}
        <div className="space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
            <Wallet className="w-3 h-3" />
            Finances
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Payments & Earnings
          </h1>
          <p className="text-gray-500 font-medium">
            A full overview of your financial activity on Viciniti.
          </p>
        </div>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-gray-50 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard
              label="Total Spent"
              value={formatPrice(stats.totalSpent)}
              icon={<ArrowUpRight className="w-6 h-6 text-rose-500" />}
              accent="bg-rose-50"
            />
            <StatCard
              label="Total Earned"
              value={formatPrice(stats.totalEarned)}
              icon={<ArrowDownLeft className="w-6 h-6 text-emerald-500" />}
              accent="bg-emerald-50"
            />
            <StatCard
              label="Fees Paid"
              value={formatPrice(stats.totalFees)}
              icon={
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D6A4F]" />
              }
              accent="bg-[#2D6A4F]/8"
            />
            <StatCard
              label="Transactions"
              value={String(stats.totalTransactions)}
              icon={<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4A261]" />}
              accent="bg-[#F4A261]/10"
            />
          </div>
        ) : null}

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
                  {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </p>
              </div>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-[40px] border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
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

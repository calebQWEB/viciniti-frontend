"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/order";
import {
  ShoppingBag,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Tab = "purchases" | "sales";

interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface StatusCounts {
  all: number;
  pending: number;
  paid: number;
  fulfilled: number;
  completed: number;
  cancelled: number;
  disputed: number;
  refunded: number;
}

const PAGE_SIZE = 10;

// ─── Status display config ──────────────────────────────────────────────
const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "green" | "amber" | "red" | "gray" }
> = {
  pending: { label: "Pending", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  fulfilled: { label: "Fulfilled", tone: "gray" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  disputed: { label: "Disputed", tone: "red" },
  refunded: { label: "Refunded", tone: "gray" },
};

const TONE_CLASSES: Record<string, string> = {
  green: "text-[#2D6A4F] bg-[#2D6A4F]/10 border-[#2D6A4F]/15",
  amber: "text-amber-700 bg-amber-50 border-amber-100",
  red: "text-red-700 bg-red-50 border-red-100",
  gray: "text-gray-500 bg-gray-100 border-gray-200",
};

const FILTER_ORDER: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "paid",
  "fulfilled",
  "completed",
  "disputed",
  "refunded",
  "cancelled",
];

function StatusPill({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${TONE_CLASSES[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}

// ─── Row action logic ───────────────────────────────────────────────────
function getRowAction(
  order: Order,
  isSale: boolean,
): { label: string; href: string } | null {
  if (order.status === "paid" && isSale) {
    return {
      label: "Mark Complete",
      href: `/dashboard/sales/${order.id}/complete`,
    };
  }
  if (order.status === "fulfilled" && !isSale) {
    return {
      label: "Confirm",
      href: `/dashboard/purchases/${order.id}/confirm`,
    };
  }
  if (order.status === "disputed") {
    return isSale
      ? { label: "View Dispute", href: `/dashboard/sales/${order.id}/dispute` }
      : {
          label: "Track Dispute",
          href: `/dashboard/purchases/${order.id}/dispute`,
        };
  }
  return null;
}

function getWaitingText(order: Order, isSale: boolean): string | null {
  if (order.status === "pending") return "Awaiting payment";
  if (order.status === "paid" && !isSale) return "Waiting for seller";
  if (order.status === "fulfilled" && isSale) return "Waiting for buyer";
  return null;
}

function getPayoutIndicator(
  order: Order,
): { text: string; tone: "green" | "amber" | "red" } | null {
  if (order.status !== "completed") return null;
  if (order.payout_completed_at) return { text: "Paid out", tone: "green" };
  if (order.payout_due_at) {
    const date = new Date(order.payout_due_at).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });
    return { text: `Payout ${date}`, tone: "amber" };
  }
  return { text: "Add bank account", tone: "red" };
}

function itemDisplay(order: Order) {
  const image =
    order.listing?.images?.[0]?.url ?? order.service?.images?.[0]?.url ?? null;
  const title = order.listing?.title ?? order.service?.title ?? "Unknown Item";
  return { image, title };
}

// ─── Action cell (shared between table + mobile) ────────────────────────
function ActionCell({ order, isSale }: { order: Order; isSale: boolean }) {
  const action = getRowAction(order, isSale);
  const waiting = getWaitingText(order, isSale);
  const payout = isSale ? getPayoutIndicator(order) : null;

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5">
      {action ? (
        <Link
          href={action.href}
          className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white rounded-lg font-bold text-[11px] transition-all active:scale-[0.98] whitespace-nowrap"
        >
          {action.label}
        </Link>
      ) : waiting ? (
        <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap">
          {waiting}
        </span>
      ) : null}

      {payout && (
        <span
          className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${TONE_CLASSES[payout.tone]}`}
        >
          {payout.text}
        </span>
      )}
    </div>
  );
}

export default function MyPurchasesPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, searchQuery]);

  const isSale = activeTab === "sales";

  const { data: purchasesData, isLoading: loadingPurchases } = useQuery({
    queryKey: ["my-purchases", page, statusFilter, searchQuery],
    queryFn: async () => {
      const response = await api.get("/orders/my-purchases", {
        params: {
          page,
          limit: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: searchQuery || undefined,
        },
      });
      return response.data as PaginatedOrders;
    },
    enabled: activeTab === "purchases",
    placeholderData: (previousData) => previousData,
  });

  const { data: salesData, isLoading: loadingSales } = useQuery({
    queryKey: ["my-sales", page, statusFilter, searchQuery],
    queryFn: async () => {
      const response = await api.get("/orders/my-sales", {
        params: {
          page,
          limit: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: searchQuery || undefined,
        },
      });
      return response.data as PaginatedOrders;
    },
    enabled: activeTab === "sales",
    placeholderData: (previousData) => previousData,
  });

  const { data: purchaseCounts } = useQuery({
    queryKey: ["my-purchases-counts"],
    queryFn: async () => {
      const response = await api.get("/orders/my-purchases/counts");
      return response.data as StatusCounts;
    },
    enabled: activeTab === "purchases",
  });

  const { data: salesCounts } = useQuery({
    queryKey: ["my-sales-counts"],
    queryFn: async () => {
      const response = await api.get("/orders/my-sales/counts");
      return response.data as StatusCounts;
    },
    enabled: activeTab === "sales",
  });

  const activeData = isSale ? salesData : purchasesData;
  const isLoading = isSale ? loadingSales : loadingPurchases;
  const counts = isSale ? salesCounts : purchaseCounts;

  const orders = activeData?.items;
  const totalPages = activeData?.total_pages ?? 1;
  const total = activeData?.total ?? 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "purchases", label: "Purchases" },
    { key: "sales", label: "Sales" },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-2.5 h-2.5" />
            Orders
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track your purchases and manage your sales.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-100 mb-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setStatusFilter("all");
                }}
                className={`relative pb-3 pt-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#2D6A4F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#2D6A4F] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Status filter pills — breaks out to full viewport width to scroll independently */}
        <div className="-mx-4 sm:-mx-6 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_ORDER.map((key) => {
              const isActive = statusFilter === key;
              const label = key === "all" ? "All" : STATUS_META[key].label;
              const count = counts?.[key] ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#2D6A4F] border-[#2D6A4F] text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#2D6A4F]/40 hover:text-gray-700"
                  }`}
                >
                  {label}
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 ${
                      isActive ? "bg-white/20" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full bg-gray-50 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Item
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        {isSale ? "Buyer" : "Seller"}
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Amount
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Date
                      </th>
                      <th className="text-right text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const { image, title } = itemDisplay(order);
                      const counterparty = isSale
                        ? order.buyer?.name
                        : order.seller?.name;
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
                                {image ? (
                                  <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-xs truncate max-w-[160px]">
                                  {title}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                  #{order.id.slice(-8).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-gray-700">
                              {counterparty ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-gray-900 italic">
                              {formatPrice(order.amount)}
                            </span>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                              Net {formatPrice(order.amount - order.fee)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={order.status} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                              {new Date(order.created_at).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <ActionCell order={order} isSale={isSale} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile stacked rows */}
            <div className="sm:hidden space-y-2">
              {orders.map((order) => {
                const { image, title } = itemDisplay(order);
                const counterparty = isSale
                  ? order.buyer?.name
                  : order.seller?.name;
                return (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-100 rounded-xl p-3 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-xs truncate min-w-0">
                            {title}
                          </p>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          {counterparty ?? "—"} · {formatPrice(order.amount)}
                          <span className="text-gray-300">
                            {" "}
                            · Net {formatPrice(order.amount - order.fee)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <ActionCell order={order} isSale={isSale} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
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
                  Page {page} of {totalPages} · {total} total
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
          <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {isSale ? "No sales yet" : "No purchases yet"}
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs px-4">
              {isSale
                ? "When someone buys your listing, it will show up here."
                : "Browse items near you and make your first purchase."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

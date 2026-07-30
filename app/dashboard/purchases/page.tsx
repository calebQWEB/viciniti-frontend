"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/order";
import {
  ShoppingBag,
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import OrderStatusWithActions, {
  CompletionProgress,
} from "@/components/shared/OrderStatusWithActions";

type Tab = "purchases" | "sales";

interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const PAGE_SIZE = 10;

function OrderCard({ order, isSale }: { order: Order; isSale: boolean }) {
  const createdDate = new Date(order.created_at);
  const listingImage = order.listing?.images?.[0]?.url;
  const listingTitle = order.listing?.title ?? "Unknown Item";
  const isSeller = isSale;
  const isBuyer = !isSale;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:-translate-y-0.5">
      {/* Top row — image + title + meta */}
      <div className="flex items-start gap-3">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
          {listingImage ? (
            <Image
              src={listingImage}
              alt={listingTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-black text-gray-900 text-sm truncate">
              {listingTitle}
            </p>
            <span
              className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                isSale
                  ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
                  : "bg-[#F4A261]/10 text-[#F4A261]"
              }`}
            >
              {isSale ? "Sale" : "Purchase"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
            <span className="text-[10px] text-gray-400 font-medium">
              {createdDate.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Financial strip */}
      <div className="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-gray-50">
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Amount
          </p>
          <p className="text-sm font-black text-gray-900 italic tracking-tight">
            {formatPrice(order.amount)}
          </p>
        </div>
        <div className="flex-1 text-right sm:text-left">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Platform Fee
          </p>
          <p className="text-xs font-bold text-[#2D6A4F]">
            {formatPrice(order.fee)}
          </p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
            Net
          </p>
          <p className="text-xs font-bold text-gray-600">
            {formatPrice(order.amount - order.fee)}
          </p>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="mt-3.5 pt-3.5 border-t border-gray-50 space-y-3">
        <OrderStatusWithActions
          order={order}
          isSeller={isSeller}
          isBuyer={isBuyer}
        />
        {(order.status === "paid" || order.status === "fulfilled") && (
          <CompletionProgress order={order} />
        )}
      </div>
    </div>
  );
}

export default function MyPurchasesPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Reset to page 1 whenever the tab or filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, searchQuery]);

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

  const isSale = activeTab === "sales";
  const activeData = isSale ? salesData : purchasesData;
  const isLoading = isSale ? loadingSales : loadingPurchases;

  const orders = activeData?.items;
  const totalPages = activeData?.total_pages ?? 1;
  const total = activeData?.total ?? 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "purchases", label: "Purchases" },
    { key: "sales", label: "Sales" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
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

        {/* Tabs — underline style */}
        <div className="flex items-center gap-6 border-b border-gray-100 mb-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 pb-3 pt-1 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#2D6A4F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && total > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-[#2D6A4F]/10 text-[#2D6A4F]">
                    {total}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#2D6A4F] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-xs border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 w-full bg-gray-50 animate-pulse rounded-2xl"
              />
            ))
          ) : orders && orders.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  Transaction History
                </p>
                <p className="text-[9px] text-gray-400 font-medium">
                  {total} transaction{total !== 1 ? "s" : ""}
                </p>
              </div>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} isSale={isSale} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3">
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
            <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border border-dashed border-gray-200 mx-2 sm:mx-0">
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
    </div>
  );
}

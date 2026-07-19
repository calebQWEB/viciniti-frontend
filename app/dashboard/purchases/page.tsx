"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/order";
import {
  ShoppingBag,
  ArrowUpRight,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import OrderStatusWithActions, {
  CompletionProgress,
} from "@/components/shared/OrderStatusWithActions";

type Tab = "purchases" | "sales";

function OrderCard({
  order,
  isSale,
  currentUserId,
}: {
  order: Order;
  isSale: boolean;
  currentUserId: string;
}) {
  const createdDate = new Date(order.created_at);
  const listingImage = order.listing?.images?.[0]?.url;
  const listingTitle = order.listing?.title ?? "Unknown Item";
  const isSeller = isSale;
  const isBuyer = !isSale;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-3.5 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
      <div className="flex flex-col gap-3">
        {/* Top row — image + title + status */}
        <div className="flex items-center gap-3">
          {/* Listing image */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {listingImage ? (
              <Image
                src={listingImage}
                alt={listingTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-gray-900 text-xs truncate">
                  {listingTitle}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span className="text-[9px] text-gray-400 font-medium">
                    {createdDate.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#2D6A4F]">
                    {isSale ? "Sale" : "Purchase"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-gray-50/50 rounded-lg border border-gray-100/50">
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Amount
            </p>
            <p className="text-sm font-black text-gray-900 italic tracking-tight">
              {formatPrice(order.amount)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Platform Fee
            </p>
            <p className="text-xs font-bold text-[#2D6A4F]">
              {formatPrice(order.fee)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Net
            </p>
            <p className="text-xs font-bold text-gray-600">
              {formatPrice(order.amount - order.fee)}
            </p>
          </div>
        </div>

        {/* Status and Actions */}
        <OrderStatusWithActions
          order={order}
          isSeller={isSeller}
          isBuyer={isBuyer}
        />

        {/* Completion Progress */}
        {/* {order.status === "pending" && <CompletionProgress order={order} />} */}
        {(order.status === "paid" || order.status === "fulfilled") && (
          <CompletionProgress order={order} />
        )}
      </div>
    </div>
  );
}

export default function MyPurchasesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: purchases, isLoading: loadingPurchases } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const response = await api.get("/orders/my-purchases");
      return response.data as Order[];
    },
  });

  const { data: sales, isLoading: loadingSales } = useQuery({
    queryKey: ["my-sales"],
    queryFn: async () => {
      const response = await api.get("/orders/my-sales");
      return response.data as Order[];
    },
  });

  const isLoading = activeTab === "purchases" ? loadingPurchases : loadingSales;
  const orders = activeTab === "purchases" ? purchases : sales;
  const isSale = activeTab === "sales";

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider">
              <ShoppingBag className="w-2.5 h-2.5" />
              Orders
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Track your purchases and manage your sales.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50 shadow-inner w-full sm:w-auto">
            {[
              {
                key: "purchases",
                label: "Purchases",
                count: purchases?.length,
              },
              { key: "sales", label: "Sales", count: sales?.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex-1 sm:flex-none justify-center ${
                  activeTab === tab.key
                    ? "bg-white text-[#2D6A4F] shadow-sm shadow-gray-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.key === "purchases" ? "Buy" : "Sell"}
                </span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] ${
                      activeTab === tab.key
                        ? "bg-[#2D6A4F] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900"
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

        {/* Orders List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 w-full bg-gray-50 animate-pulse rounded-xl"
              />
            ))
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  Transaction History
                </p>
                <p className="text-[9px] text-gray-400 font-medium">
                  {filteredOrders.length} transaction
                  {filteredOrders.length !== 1 ? "s" : ""}
                </p>
              </div>
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSale={isSale}
                  currentUserId={user?.id || ""}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 mx-2 sm:mx-0">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
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

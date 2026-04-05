"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
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

type Tab = "purchases" | "sales";
type OrderStatus = "pending" | "completed" | "cancelled";

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  fee: number;
  status: OrderStatus;
  created_at: string;
  listing?: {
    id: string;
    title: string;
    images: { url: string; public_id: string }[];
  };
}

const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200/50",
    dot: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-rose-50 text-rose-700 border-rose-200/50",
    dot: "bg-rose-400",
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
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

function OrderCard({
  order,
  isSale,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  isSale: boolean;
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const createdDate = new Date(order.created_at);
  const listingImage = order.listing?.images?.[0]?.url;
  const listingTitle = order.listing?.title ?? "Unknown Item";

  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl p-5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1">
      <div className="flex flex-col gap-4">
        {/* Top row — image + title + status */}
        <div className="flex items-center gap-4">
          {/* Listing image */}
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
            {listingImage ? (
              <Image
                src={listingImage}
                alt={listingTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-300" />
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-gray-900 text-sm truncate">
                  {listingTitle}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    {createdDate.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#2D6A4F]">
                    {isSale ? "Sale" : "Purchase"}
                  </span>
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Amount
            </p>
            <p className="text-base font-black text-gray-900 italic tracking-tight">
              {formatPrice(order.amount)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Platform Fee
            </p>
            <p className="text-sm font-bold text-[#2D6A4F]">
              {formatPrice(order.fee)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Net
            </p>
            <p className="text-sm font-bold text-gray-600">
              {formatPrice(order.amount - order.fee)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {order.status === "pending" && onUpdateStatus && (
          <div className="flex items-center gap-2">
            {isSale ? (
              <>
                <button
                  onClick={() => onUpdateStatus(order.id, "completed")}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark Complete
                </button>
                <button
                  onClick={() => onUpdateStatus(order.id, "cancelled")}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                disabled={isUpdating}
                className="w-full px-4 py-2.5 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPurchasesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("purchases");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const { mutate: updateOrder } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.put(`/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["my-sales"] });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    updateOrder({ id, status });
  };

  const isLoading = activeTab === "purchases" ? loadingPurchases : loadingSales;
  const orders = activeTab === "purchases" ? purchases : sales;
  const isSale = activeTab === "sales";

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 lg:mb-12 gap-6 sm:gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3 h-3" />
              Orders
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Track your purchases and manage your sales.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 sm:p-1.5 rounded-2xl sm:rounded-[22px] border border-gray-200/50 shadow-inner w-full sm:w-auto">
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
                className={`relative flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-[18px] text-sm font-bold transition-all duration-300 flex-1 sm:flex-none justify-center ${
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
                    className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] ${
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

        {/* Orders List */}
        <div className="space-y-4 sm:space-y-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 sm:h-36 w-full bg-gray-50 animate-pulse rounded-2xl sm:rounded-3xl"
              />
            ))
          ) : orders && orders.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Transaction History
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {orders.length} transaction{orders.length !== 1 ? "s" : ""}
                </p>
              </div>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isSale={isSale}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-[40px] border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {isSale ? "No sales yet" : "No purchases yet"}
              </h3>
              <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium text-sm sm:text-base px-4">
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

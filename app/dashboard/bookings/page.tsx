"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Booking, BookingStatus } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import {
  Calendar,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  Wrench,
} from "lucide-react";
import Image from "next/image";

type Tab = "my-bookings" | "my-requests";

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200/50",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-rose-50 text-rose-700 border-rose-200/50",
    dot: "bg-rose-400",
  },
  completed: {
    label: "Completed",
    classes: "bg-slate-50 text-slate-700 border-slate-200/50",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, classes, dot } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${classes}`}
    >
      <span className={`w-1 h-1 rounded-full animate-pulse ${dot}`} />
      {label}
    </span>
  );
}

function BookingCard({
  booking,
  isRequest,
  onUpdateStatus,
  isUpdating,
}: {
  booking: Booking;
  isRequest: boolean;
  onUpdateStatus?: (id: string, status: BookingStatus) => void;
  isUpdating: boolean;
}) {
  const date = new Date(booking.scheduled_at);
  const serviceImage = booking.service?.images?.[0]?.url;
  const serviceTitle = booking.service?.title ?? "Unknown Service";

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-3.5 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5">
      <div className="flex flex-col gap-3">
        {/* Top row — image + title + status */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            {serviceImage ? (
              <Image
                src={serviceImage}
                alt={serviceTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-gray-900 text-xs truncate">
                  {serviceTitle}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                    #{booking.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span className="text-[9px] text-gray-400 font-medium">
                    {date.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#2D6A4F]">
                    {date.toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <StatusBadge status={booking.status} />
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
              {formatPrice(booking.amount)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Platform Fee
            </p>
            <p className="text-xs font-bold text-[#2D6A4F]">
              {formatPrice(booking.fee)}
            </p>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200" />
          <div className="flex-1 text-center w-full sm:w-auto">
            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">
              Net
            </p>
            <p className="text-xs font-bold text-gray-600">
              {formatPrice(booking.amount - booking.fee)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {booking.status === "pending" && onUpdateStatus && (
          <div className="flex items-center gap-2">
            {isRequest ? (
              <>
                <button
                  onClick={() => onUpdateStatus(booking.id, "confirmed")}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white rounded-lg text-xs font-bold shadow-sm shadow-[#2D6A4F]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => onUpdateStatus(booking.id, "cancelled")}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  Decline
                </button>
              </>
            ) : (
              <button
                onClick={() => onUpdateStatus(booking.id, "cancelled")}
                disabled={isUpdating}
                className="w-full px-3 py-1.5 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("my-bookings");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: myBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const response = await api.get("/bookings/my-bookings");
      return response.data as Booking[];
    },
  });

  const { data: myRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const response = await api.get("/bookings/my-requests");
      return response.data as Booking[];
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.put(`/bookings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    updateStatus({ id, status });
  };

  const isLoading =
    activeTab === "my-bookings" ? loadingBookings : loadingRequests;
  const bookings = activeTab === "my-bookings" ? myBookings : myRequests;
  const isRequest = activeTab === "my-requests";

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 lg:mb-8 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider">
              <Calendar className="w-2.5 h-2.5" />
              Scheduler
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Manage Bookings
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Manage your professional schedule in one place.
            </p>
          </div>

          {/* Segmented Control */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50 shadow-inner w-full sm:w-auto">
            {[
              {
                key: "my-bookings",
                label: "My Bookings",
                count: myBookings?.length,
              },
              {
                key: "my-requests",
                label: "Requests",
                count: myRequests?.length,
              },
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
                  {tab.key === "my-bookings" ? "Bookings" : "Requests"}
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

        {/* Main List */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 w-full bg-gray-50 animate-pulse rounded-xl"
              />
            ))
          ) : bookings && bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isRequest={isRequest}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingId === booking.id}
              />
            ))
          ) : (
            <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Calendar className="w-5 h-5 text-gray-300" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Quiet for now...
              </h3>
              <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs">
                {isRequest
                  ? "Incoming service requests will appear here once customers book you."
                  : "Start exploring services to fill up your calendar."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

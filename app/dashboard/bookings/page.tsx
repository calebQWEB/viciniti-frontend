"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Booking, BookingStatus } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import { Calendar, Loader2, Wrench } from "lucide-react";
import Image from "next/image";

type Tab = "my-bookings" | "my-requests";
type FilterStatus = BookingStatus | "all";

const STATUS_META: Record<
  BookingStatus,
  { label: string; tone: "green" | "amber" | "red" | "gray" }
> = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  completed: { label: "Completed", tone: "gray" },
};

const TONE_CLASSES: Record<string, string> = {
  green: "text-[#2D6A4F] bg-[#2D6A4F]/10 border-[#2D6A4F]/15",
  amber: "text-amber-700 bg-amber-50 border-amber-100",
  red: "text-red-700 bg-red-50 border-red-100",
  gray: "text-gray-500 bg-gray-100 border-gray-200",
};

const FILTER_ORDER: FilterStatus[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function StatusPill({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${TONE_CLASSES[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}

function ActionCell({
  booking,
  isRequest,
  onUpdateStatus,
  isUpdating,
}: {
  booking: Booking;
  isRequest: boolean;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  isUpdating: boolean;
}) {
  if (booking.status !== "pending") return null;

  if (isRequest) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onUpdateStatus(booking.id, "confirmed")}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white rounded-lg text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
        </button>
        <button
          onClick={() => onUpdateStatus(booking.id, "cancelled")}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 whitespace-nowrap"
        >
          Decline
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => onUpdateStatus(booking.id, "cancelled")}
      disabled={isUpdating}
      className="px-3 py-1.5 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 whitespace-nowrap"
    >
      Cancel
    </button>
  );
}

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("my-bookings");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
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

  const isRequest = activeTab === "my-requests";
  const isLoading = isRequest ? loadingRequests : loadingBookings;
  const allBookings = isRequest ? myRequests : myBookings;

  const counts = useMemo(() => {
    const base: Record<FilterStatus, number> = {
      all: allBookings?.length ?? 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };
    allBookings?.forEach((b) => {
      base[b.status] += 1;
    });
    return base;
  }, [allBookings]);

  const bookings = useMemo(() => {
    if (statusFilter === "all") return allBookings;
    return allBookings?.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "my-bookings", label: "My Bookings" },
    { key: "my-requests", label: "Requests" },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-2.5 h-2.5" />
            Scheduler
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Manage Bookings
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage your professional schedule in one place.
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

        {/* Status filter pills */}
        <div className="-mx-4 sm:-mx-6 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_ORDER.map((key) => {
              const isActive = statusFilter === key;
              const label = key === "all" ? "All" : STATUS_META[key].label;
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
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full bg-gray-50 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Service
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        {isRequest ? "Client" : "Provider"}
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Scheduled
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Amount
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Status
                      </th>
                      <th className="text-right text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const date = new Date(booking.scheduled_at);
                      const serviceImage = booking.service?.images?.[0]?.url;
                      const serviceTitle =
                        booking.service?.title ?? "Unknown Service";
                      return (
                        <tr
                          key={booking.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
                                {serviceImage ? (
                                  <Image
                                    src={serviceImage}
                                    alt={serviceTitle}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Wrench className="w-3.5 h-3.5 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-xs truncate max-w-[160px]">
                                  {serviceTitle}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                  #{booking.id.slice(-8).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-gray-700">
                              {(isRequest
                                ? booking.client?.name
                                : booking.provider?.name) ?? "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-[11px] text-gray-700 font-semibold whitespace-nowrap">
                              {date.toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <p className="text-[10px] text-[#2D6A4F] font-bold whitespace-nowrap">
                              {date.toLocaleTimeString("en-NG", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-gray-900 italic">
                              {formatPrice(booking.amount)}
                            </span>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                              Net {formatPrice(booking.amount - booking.fee)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={booking.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <ActionCell
                                booking={booking}
                                isRequest={isRequest}
                                onUpdateStatus={handleUpdateStatus}
                                isUpdating={updatingId === booking.id}
                              />
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
              {bookings.map((booking) => {
                const date = new Date(booking.scheduled_at);
                const serviceImage = booking.service?.images?.[0]?.url;
                const serviceTitle =
                  booking.service?.title ?? "Unknown Service";
                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-100 rounded-xl p-3 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
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
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-xs truncate min-w-0">
                            {serviceTitle}
                          </p>
                          <StatusPill status={booking.status} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          {(isRequest
                            ? booking.client?.name
                            : booking.provider?.name) ?? "—"}{" "}
                          ·{" "}
                          {date.toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          ·{" "}
                          {date.toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {formatPrice(booking.amount)}
                          <span className="text-gray-300">
                            {" "}
                            · Net {formatPrice(booking.amount - booking.fee)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end pt-2 border-t border-gray-50">
                      <ActionCell
                        booking={booking}
                        isRequest={isRequest}
                        onUpdateStatus={handleUpdateStatus}
                        isUpdating={updatingId === booking.id}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              Quiet for now...
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs px-4">
              {isRequest
                ? "Incoming service requests will appear here once customers book you."
                : "Start exploring services to fill up your calendar."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

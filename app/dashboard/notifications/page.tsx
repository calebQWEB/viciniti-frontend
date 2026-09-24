"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Bell,
  CheckCheck,
  Loader2,
  Wallet,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type NotificationType = "payment" | "payout" | "order" | "booking" | "chargeback" | "message" | "system";

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: NotificationType | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const PAGE_SIZE = 20;

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; classes: string }> = {
  chargeback: { icon: <AlertTriangle className="w-4 h-4" />, classes: "bg-red-50 text-red-600" },
  payout: { icon: <Wallet className="w-4 h-4" />, classes: "bg-emerald-50 text-emerald-600" },
  payment: { icon: <Wallet className="w-4 h-4" />, classes: "bg-emerald-50 text-emerald-600" },
  order: { icon: <ShoppingBag className="w-4 h-4" />, classes: "bg-[#2D6A4F]/10 text-[#2D6A4F]" },
  booking: { icon: <Calendar className="w-4 h-4" />, classes: "bg-amber-50 text-amber-600" },
  message: { icon: <MessageSquare className="w-4 h-4" />, classes: "bg-sky-50 text-sky-600" },
  system: { icon: <Bell className="w-4 h-4" />, classes: "bg-gray-100 text-gray-400" },
};

function NotificationIcon({ type }: { type: NotificationType | null }) {
  const meta = type ? TYPE_META[type] : TYPE_META.system;
  return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.classes}`}>
        {meta.icon}
      </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [unreadOnly]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page, unreadOnly],
    queryFn: async () => {
      const response = await api.get("/notifications/", {
        params: { page, limit: PAGE_SIZE, unread_only: unreadOnly },
      });
      return response.data as PaginatedNotifications;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: unreadData } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: async () => {
      const response = await api.get("/notifications/unread-count");
      return response.data as { unread_count: number };
    },
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.unread_count ?? 0;

  const { mutate: markOne } = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const { mutate: markAll, isPending: markingAll } = useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const handleClick = (notification: Notification) => {
    if (!notification.read) markOne(notification.id);
    if (notification.link) router.push(notification.link);
  };

  const notifications = data?.items;
  const totalPages = data?.total_pages ?? 1;

  return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
                <Bell className="w-2.5 h-2.5" />
                Activity
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "You're all caught up 🎉"}
              </p>
            </div>

            {unreadCount > 0 && (
                <button
                    onClick={() => markAll()}
                    disabled={markingAll}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 hover:border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/5 text-gray-600 hover:text-[#2D6A4F] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                  Mark all as read
                </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-5">
            <button
                onClick={() => setUnreadOnly(false)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    !unreadOnly ? "bg-[#2D6A4F] border-[#2D6A4F] text-white" : "bg-white border-gray-200 text-gray-500 hover:border-[#2D6A4F]/40"
                }`}
            >
              All
            </button>
            <button
                onClick={() => setUnreadOnly(true)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                    unreadOnly ? "bg-[#2D6A4F] border-[#2D6A4F] text-white" : "bg-white border-gray-200 text-gray-500 hover:border-[#2D6A4F]/40"
                }`}
            >
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          </div>

          {/* Notifications List */}
          {isLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-14 sm:h-16 bg-gray-50 animate-pulse rounded-xl sm:rounded-2xl" />
                ))}
              </div>
          ) : notifications && notifications.length > 0 ? (
              <>
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notification) => (
                      <div
                          key={notification.id}
                          onClick={() => handleClick(notification)}
                          className={`group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${
                              notification.read
                                  ? "bg-white border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                                  : "bg-[#2D6A4F]/3 border-[#2D6A4F]/10 hover:shadow-[0_8px_30px_rgba(45,106,79,0.08)] hover:-translate-y-0.5"
                          }`}
                      >
                        <NotificationIcon type={notification.type} />

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm leading-relaxed ${notification.read ? "text-gray-500 font-medium" : "text-gray-900 font-bold"}`}>
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-[#F4A261] shrink-0 mt-1.5" />
                        )}
                      </div>
                  ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-5">
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
              <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#F4A261] rounded-lg flex items-center justify-center shadow-md">
                    <CheckCheck className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {unreadOnly ? "No unread notifications" : "All clear!"}
                </h3>
                <p className="text-gray-400 max-w-xs mx-auto mt-1.5 font-medium text-xs sm:text-sm">
                  {unreadOnly
                      ? "You've read everything for now."
                      : "You have no notifications right now. We'll let you know when something happens."}
                </p>
              </div>
          )}
        </div>
      </div>
  );
}
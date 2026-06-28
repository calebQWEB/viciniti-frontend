"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications/");
      return response.data as Notification[];
    },
    staleTime: 30 * 1000,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const { mutate: markOne } = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutate: markAll, isPending: markingAll } = useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
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
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-white border border-gray-200 hover:border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/5 text-gray-600 hover:text-[#2D6A4F] rounded-lg sm:rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 sm:h-16 bg-gray-50 animate-pulse rounded-xl sm:rounded-2xl"
              />
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markOne(notification.id)}
                className={`group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer ${
                  notification.read
                    ? "bg-white border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    : "bg-[#2D6A4F]/3 border-[#2D6A4F]/10 hover:shadow-[0_8px_30px_rgba(45,106,79,0.08)] hover:-translate-y-0.5"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    notification.read
                      ? "bg-gray-50 group-hover:bg-gray-100"
                      : "bg-[#2D6A4F]/10 group-hover:bg-[#2D6A4F]/15"
                  }`}
                >
                  <Bell
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      notification.read ? "text-gray-300" : "text-[#2D6A4F]"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      notification.read
                        ? "text-gray-500 font-medium"
                        : "text-gray-900 font-bold"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-[#F4A261] shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            ))}
          </div>
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
              All clear!
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-1.5 font-medium text-xs sm:text-sm">
              You have no notifications right now. We'll let you know when
              something happens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

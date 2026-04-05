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
    staleTime: 30 * 1000, // 30 seconds
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  // Mark single notification as read
  const { mutate: markOne } = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const { mutate: markAll, isPending: markingAll } = useMutation({
    mutationFn: () => api.put("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
              <Bell className="w-3 h-3" />
              Activity
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up 🎉"}
            </p>
          </div>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              onClick={() => markAll()}
              disabled={markingAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-gray-200 hover:border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/5 text-gray-600 hover:text-[#2D6A4F] rounded-xl sm:rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 sm:h-20 bg-gray-50 animate-pulse rounded-2xl sm:rounded-3xl"
              />
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markOne(notification.id)}
                className={`group relative flex items-start gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer ${
                  notification.read
                    ? "bg-white border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    : "bg-[#2D6A4F]/3 border-[#2D6A4F]/10 hover:shadow-[0_8px_30px_rgba(45,106,79,0.08)] hover:-translate-y-0.5"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    notification.read
                      ? "bg-gray-50 group-hover:bg-gray-100"
                      : "bg-[#2D6A4F]/10 group-hover:bg-[#2D6A4F]/15"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      notification.read ? "text-gray-300" : "text-[#2D6A4F]"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      notification.read
                        ? "text-gray-500 font-medium"
                        : "text-gray-900 font-bold"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 sm:mt-2">
                    {formatTime(notification.created_at)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F4A261] shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-[40px] border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#F4A261] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <CheckCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              All clear!
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium text-sm sm:text-base">
              You have no notifications right now. We'll let you know when
              something happens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { Bell, MessageSquare, LogOut, Menu, X } from "lucide-react";

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#F4A261] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch unread notification count — polls every 30 seconds
  const { data: notifData } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications/unread-count");
      return response.data as { unread_count: number };
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  // Fetch unread message count — polls every 15 seconds
  const { data: msgData } = useQuery({
    queryKey: ["unread-messages"],
    queryFn: async () => {
      const response = await api.get("/messages/unread-count");
      return response.data as { unread_count: number };
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const unreadNotifs = notifData?.unread_count ?? 0;
  const unreadMessages = msgData?.unread_count ?? 0;

  return (
    <nav className="bg-white border-b border-earth-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-xl">V</span>
              </div>
              <span className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
                Viciniti
              </span>
            </Link>

            <div className="hidden lg:flex items-center ml-10 space-x-8">
              <Link
                href="/browse/items"
                className="text-gray-600 hover:text-primary-600 transition-colors font-semibold text-sm uppercase tracking-wide"
              >
                Buy Items
              </Link>
              <Link
                href="/browse/services"
                className="text-gray-600 hover:text-primary-600 transition-colors font-semibold text-sm uppercase tracking-wide"
              >
                Hire Services
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            {isAuthenticated && user ? (
              <>
                {/* Icons */}
                <div className="hidden sm:flex items-center border-r border-earth-200 pr-4 space-x-1">
                  {/* Notifications */}
                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    <UnreadBadge count={unreadNotifs} />
                  </Link>

                  {/* Messages */}
                  <Link
                    href="/dashboard/messages"
                    className="relative p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <UnreadBadge count={unreadMessages} />
                  </Link>
                </div>

                {/* User + Logout */}
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 p-1 md:pr-3 rounded-full hover:bg-earth-50 transition-all border border-transparent hover:border-earth-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm ring-1 ring-primary-500/20 overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-bold text-gray-700">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>

                  <button
                    onClick={logout}
                    className="hidden sm:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-primary-600 transition-colors font-bold text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary py-2.5 px-6 text-sm font-bold shadow-md shadow-primary-500/10"
                >
                  Join Viciniti
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-earth-50 rounded-xl transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-earth-100 px-4 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            <Link
              href="/browse/items"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-gray-700 font-bold hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors"
            >
              Buy Items
            </Link>
            <Link
              href="/browse/services"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-gray-700 font-bold hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors"
            >
              Hire Services
            </Link>
          </div>

          {!isAuthenticated ? (
            <div className="pt-4 flex flex-col space-y-3 border-t border-earth-100">
              <Link
                href="/login"
                className="w-full text-center py-3 text-gray-600 font-bold"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="w-full btn-primary py-3 text-center font-bold"
              >
                Join Viciniti
              </Link>
            </div>
          ) : (
            <div className="pt-4 space-y-3 border-t border-earth-100">
              {/* Notifications with badge */}
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-earth-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  Notifications
                </div>
                {unreadNotifs > 0 && (
                  <span className="min-w-[20px] h-5 bg-[#F4A261] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5">
                    {unreadNotifs > 9 ? "9+" : unreadNotifs}
                  </span>
                )}
              </Link>

              {/* Messages with badge */}
              <Link
                href="/dashboard/messages"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-earth-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  Messages
                </div>
                {unreadMessages > 0 && (
                  <span className="min-w-[20px] h-5 bg-[#F4A261] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

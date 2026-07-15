"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  PackageOpen,
  CalendarCheck,
  MessageSquare,
  Bell,
  CreditCard,
  User,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Overview",
  },
  {
    href: "/dashboard/listings",
    icon: <ShoppingBag className="h-5 w-5" />,
    label: "My Listings",
  },
  {
    href: "/dashboard/services",
    icon: <Wrench className="h-5 w-5" />,
    label: "My Services",
  },
  {
    href: "/dashboard/purchases",
    icon: <PackageOpen className="h-5 w-5" />,
    label: "My Purchases",
  },
  {
    href: "/dashboard/bookings",
    icon: <CalendarCheck className="h-5 w-5" />,
    label: "My Bookings",
  },
  {
    href: "/dashboard/messages",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Messages",
  },
  {
    href: "/dashboard/notifications",
    icon: <Bell className="h-5 w-5" />,
    label: "Notifications",
  },
  {
    href: "/dashboard/payments",
    icon: <CreditCard className="h-5 w-5" />,
    label: "Payments",
  },
  {
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
    label: "Profile",
  },
];

const SIDEBAR_STORAGE_KEY = "viciniti:sidebar-expanded";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Mobile drawer (off-canvas, overlay)
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Desktop rail (collapsed = icons only, expanded = icons + labels)
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;

    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isExpanded));
    }
  }, [isExpanded]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-earth-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Mobile top bar */}
        <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-earth-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl p-2 text-gray-700 hover:bg-earth-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600">
              <span className="text-sm font-black text-white">V</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Viciniti</span>
          </Link>
          <div className="w-9" />
        </header>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-earth-200 bg-white transition-[width,transform] duration-300 ease-in-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${isExpanded ? "w-64" : "w-20"} lg:translate-x-0`}
        >
          {/* Desktop expand/collapse toggle — floats on the edge */}
          <button
            type="button"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setIsExpanded((prev) => !prev)}
            className="absolute -right-3.5 top-8 z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-earth-200 bg-white text-gray-500 shadow-sm transition-all duration-300 hover:border-primary-300 hover:text-primary-600 hover:shadow-md lg:flex"
          >
            <ChevronLeft
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                isExpanded ? "" : "rotate-180"
              }`}
            />
          </button>

          <div
            className={`flex items-center border-b border-earth-100 p-4 lg:p-6 ${
              isExpanded ? "justify-between" : "justify-center"
            }`}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-600">
                <span className="text-sm font-black text-white">V</span>
              </div>
              {isExpanded && (
                <span className="whitespace-nowrap text-lg font-bold text-gray-900">
                  Viciniti
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsMobileOpen(false)}
              className="rounded-xl p-2 text-gray-600 hover:bg-earth-100 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {user && (
            <div
              className={`border-b border-earth-100 p-4 lg:p-6 ${
                isExpanded ? "" : "flex justify-center"
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isExpanded ? "" : "justify-center"
                }`}
              >
                <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                  {!isExpanded && (
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {user.name}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={`space-y-2 border-b border-earth-100 p-4 ${
              isExpanded ? "" : "flex flex-col items-center"
            }`}
          >
            <Link
              href="/dashboard/listings/create"
              aria-label="Sell an Item"
              onClick={() => setIsMobileOpen(false)}
              className={`group relative flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-xs font-semibold text-white transition-all hover:bg-primary-700 ${
                isExpanded ? "w-full px-3 py-2.5" : "h-10 w-10"
              }`}
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              {isExpanded && <span>Sell an Item</span>}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  Sell an Item
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/services/create"
              aria-label="Offer a Service"
              onClick={() => setIsMobileOpen(false)}
              className={`group relative flex items-center justify-center gap-2 rounded-xl border border-earth-200 bg-white text-xs font-semibold text-gray-700 transition-all hover:border-primary-300 hover:text-primary-600 ${
                isExpanded ? "w-full px-3 py-2.5" : "h-10 w-10"
              }`}
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              {isExpanded && <span>Offer a Service</span>}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  Offer a Service
                </span>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-4">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group relative flex items-center gap-3 text-sm font-medium transition-all ${
                    isExpanded
                      ? "px-4 py-3 rounded-md"
                      : "justify-center px-0 py-3 h-10 w-10 rounded-full"
                  } ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {isExpanded && (
                    <span className="whitespace-nowrap">{link.label}</span>
                  )}
                  {!isExpanded && (
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-earth-100 p-4">
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 ${
                isExpanded
                  ? "w-full px-4 py-3"
                  : "w-full justify-center px-0 py-3"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {isExpanded && <span>Logout</span>}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  Logout
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 p-4 pt-20 transition-[margin] duration-300 ease-in-out sm:p-6 md:p-8 lg:pt-6 ${
            isExpanded ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

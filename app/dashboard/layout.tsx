"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
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
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Overview",
  },
  {
    href: "/dashboard/listings",
    icon: <ShoppingBag className="w-5 h-5" />,
    label: "My Listings",
  },
  {
    href: "/dashboard/services",
    icon: <Wrench className="w-5 h-5" />,
    label: "My Services",
  },
  {
    href: "/dashboard/purchases",
    icon: <PackageOpen className="w-5 h-5" />,
    label: "My Purchases",
  },
  {
    href: "/dashboard/bookings",
    icon: <CalendarCheck className="w-5 h-5" />,
    label: "My Bookings",
  },
  {
    href: "/dashboard/messages",
    icon: <MessageSquare className="w-5 h-5" />,
    label: "Messages",
  },
  {
    href: "/dashboard/notifications",
    icon: <Bell className="w-5 h-5" />,
    label: "Notifications",
  },
  {
    href: "/dashboard/payments",
    icon: <CreditCard className="w-5 h-5" />,
    label: "Payments",
  },
  {
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
    label: "Profile",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-earth-200 fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-earth-100">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Viciniti</span>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-earth-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
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
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Buttons */}
        <div className="p-4 border-b border-earth-100 space-y-2">
          <Link
            href="/dashboard/listings/create"
            className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Sell an Item
          </Link>
          <Link
            href="/dashboard/services/create"
            className="w-full btn-outline py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Offer a Service
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all font-medium text-sm"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-earth-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 md:p-8">{children}</main>
    </div>
  );
}

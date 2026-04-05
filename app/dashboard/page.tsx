"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  ShoppingBag,
  Wrench,
  PackageOpen,
  CalendarCheck,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const quickLinks = [
    {
      title: "Sell an Item",
      description: "List something for sale in your area",
      icon: <ShoppingBag className="w-6 h-6 text-primary-600" />,
      href: "/dashboard/listings/create",
      color: "bg-primary-50",
    },
    {
      title: "Offer a Service",
      description: "Share your skills with your community",
      icon: <Wrench className="w-6 h-6 text-accent-600" />,
      href: "/dashboard/services/create",
      color: "bg-accent-50",
    },
    {
      title: "My Purchases",
      description: "Track your recent orders",
      icon: <PackageOpen className="w-6 h-6 text-blue-600" />,
      href: "/dashboard/purchases",
      color: "bg-blue-50",
    },
    {
      title: "My Bookings",
      description: "Manage your service bookings",
      icon: <CalendarCheck className="w-6 h-6 text-purple-600" />,
      href: "/dashboard/bookings",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
          Here's what's happening in your community today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-10">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group"
          >
            <div
              className={`w-14 h-14 ${link.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
            >
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900">{link.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{link.description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      {/* Browse Section */}
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          Explore your neighborhood
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mb-6">
          Discover items and services available near you
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/browse/items"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Items
          </Link>
          <Link
            href="/browse/services"
            className="btn-outline flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}

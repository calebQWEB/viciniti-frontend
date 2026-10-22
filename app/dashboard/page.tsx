"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import GettingStarted from "@/components/dashboard/GettingStarted";
import {
  ShoppingBag,
  Wrench,
  PackageOpen,
  CalendarCheck,
  ArrowRight,
  CreditCard,
  PackageCheck,
  CheckCircle2,
  Wallet,
  MessageSquare,
  ShieldAlert,
  Bell,
  TrendingUp,
  Store,
  type LucideIcon,
} from "lucide-react";

/* ----------------------------- Dashboard Stats ---------------------------- */

interface DashboardStats {
  balance: number;
  active_listings: number;
  pending_orders: number;
  unread_messages: number;
}

function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data as DashboardStats;
    },
  });

  const statItems = [
    {
      label: "Pending Payouts",
      value: stats ? `₦${stats.balance.toLocaleString()}` : "₦0",
      icon: Wallet,
      color: "text-primary-600",
      bg: "bg-primary-50",
      border: "hover:border-primary-200",
    },
    {
      label: "Active Listings",
      value: stats?.active_listings ?? 0,
      icon: Store,
      color: "text-accent-600",
      bg: "bg-accent-50",
      border: "hover:border-accent-200",
    },
    {
      label: "Pending Orders",
      value: stats?.pending_orders ?? 0,
      icon: PackageOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "hover:border-blue-200",
    },
    {
      label: "Unread Messages",
      value: stats?.unread_messages ?? 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "hover:border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm shadow-gray-200/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.border}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">
                {item.label}
              </p>
              {isLoading ? (
                <div className="mt-1.5 h-5 w-16 animate-pulse rounded bg-gray-100" />
              ) : (
                <p className="text-base font-bold tracking-tight text-gray-900 truncate">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Needs attention ---------------------------- */

interface ActionItem {
  type:
    | "booking_unpaid"
    | "booking_request"
    | "order_to_complete"
    | "order_to_confirm"
    | "payout_blocked"
    | "unread_messages";
  title: string;
  subtitle: string | null;
  link: string;
  count: number | null;
  created_at: string;
}

const ACTION_META: Record<
  ActionItem["type"],
  { icon: LucideIcon; bg: string; text: string }
> = {
  booking_unpaid: {
    icon: CreditCard,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  booking_request: {
    icon: CalendarCheck,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  order_to_complete: {
    icon: PackageCheck,
    bg: "bg-primary-50",
    text: "text-primary-600",
  },
  order_to_confirm: {
    icon: CheckCircle2,
    bg: "bg-primary-50",
    text: "text-primary-600",
  },
  payout_blocked: {
    icon: ShieldAlert,
    bg: "bg-red-50",
    text: "text-red-500",
  },
  unread_messages: {
    icon: MessageSquare,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
};

function ActionItemRow({ item }: { item: ActionItem }) {
  const meta = ACTION_META[item.type];
  const Icon = meta.icon;

  return (
    <Link
      href={item.link}
      className="group flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-gray-50/80 sm:px-4"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}
      >
        <Icon className={`h-[18px] w-[18px] ${meta.text}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-gray-900">
          {item.title}
        </p>

        {item.subtitle && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {item.subtitle}
          </p>
        )}
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" />
    </Link>
  );
}

function NeedsAttention() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-action-items"],
    queryFn: async () => {
      const response = await api.get("/dashboard/action-items");
      return response.data as ActionItem[];
    },
  });

  const items = data ?? [];

  // Hide the section entirely if no action items and not loading
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-gray-900">
            Needs your attention
          </h2>
          <p className="text-xs text-gray-500">
            Important tasks requiring your immediate action.
          </p>
        </div>

        {!isLoading && items.length > 0 && (
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-800">
            {items.length}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-amber-200/60 bg-white shadow-sm shadow-amber-500/5">
        {isLoading
          ? [0, 1].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 border-b border-gray-100 px-3.5 py-3 last:border-0 sm:px-4"
              >
                <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/5 rounded bg-gray-100" />
                  <div className="h-2.5 w-3/5 rounded bg-gray-100" />
                </div>
              </div>
            ))
          : items.map((item) => (
              <div
                key={`${item.type}-${item.link}`}
                className="border-b border-gray-100 last:border-0"
              >
                <ActionItemRow item={item} />
              </div>
            ))}
      </div>
    </section>
  );
}

/* ----------------------------- Recent activity ---------------------------- */

interface ActivityItem {
  id: string;
  message: string;
  type:
    | "payment"
    | "payout"
    | "order"
    | "booking"
    | "chargeback"
    | "message"
    | "system"
    | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const ACTIVITY_META: Record<
  NonNullable<ActivityItem["type"]>,
  { icon: LucideIcon; bg: string; text: string }
> = {
  payment: {
    icon: Wallet,
    bg: "bg-primary-50",
    text: "text-primary-600",
  },
  payout: {
    icon: Wallet,
    bg: "bg-primary-50",
    text: "text-primary-600",
  },
  order: {
    icon: ShoppingBag,
    bg: "bg-primary-50",
    text: "text-primary-600",
  },
  booking: {
    icon: CalendarCheck,
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  chargeback: {
    icon: ShieldAlert,
    bg: "bg-red-50",
    text: "text-red-500",
  },
  message: {
    icon: MessageSquare,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  system: {
    icon: Bell,
    bg: "bg-gray-100",
    text: "text-gray-500",
  },
};

function timeAgo(iso: string) {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type ?? "system"];
  const Icon = meta.icon;

  const content = (
    <>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}
      >
        <Icon className={`h-[18px] w-[18px] ${meta.text}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`line-clamp-2 text-[13px] leading-[18px] ${
            item.read
              ? "font-normal text-gray-600"
              : "font-semibold text-gray-900"
          }`}
        >
          {item.message}
        </p>

        <p className="mt-1 text-xs text-gray-400">{timeAgo(item.created_at)}</p>
      </div>

      {!item.read && (
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-primary-500"
          aria-label="Unread activity"
        />
      )}
    </>
  );

  const className =
    "flex items-center gap-3 px-3.5 py-3 transition-colors sm:px-4";

  return item.link ? (
    <Link href={item.link} className={`${className} hover:bg-gray-50/80`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-recent-activity"],
    queryFn: async () => {
      const response = await api.get("/dashboard/recent-activity");
      return response.data as ActivityItem[];
    },
  });

  const items = data ?? [];

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-gray-900">
            Recent activity
          </h2>
          <p className="text-xs text-gray-500">
            Keep track of updates across your account.
          </p>
        </div>

        <Link
          href="/dashboard/notifications"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary-600 transition-colors hover:text-primary-700"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/30">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 border-b border-gray-100 px-3.5 py-3 last:border-0 sm:px-4"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-gray-100" />
                <div className="h-2.5 w-1/4 rounded bg-gray-100" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[13px] font-semibold text-gray-900">
              No activity yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your recent updates will appear here.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-100 last:border-0"
            >
              <ActivityRow item={item} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ---------------------------------- Page ---------------------------------- */

// "Welcome" instead of "Welcome back" for the first day after onboarding
function onboardedRecently(onboardedAt?: string | null): boolean {
  if (!onboardedAt) return false;
  return Date.now() - new Date(onboardedAt).getTime() < 24 * 60 * 60 * 1000;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isNewUser = onboardedRecently(user?.onboarded_at);

  const quickLinks = [
    {
      title: "Sell an Item",
      description: "List something for sale",
      icon: ShoppingBag,
      iconColor: "text-primary-600",
      color: "bg-primary-50",
      href: "/dashboard/listings/create",
    },
    {
      title: "Offer a Service",
      description: "Share your skills",
      icon: Wrench,
      iconColor: "text-accent-600",
      color: "bg-accent-50",
      href: "/dashboard/services/create",
    },
    {
      title: "My Purchases",
      description: "Track recent orders",
      icon: PackageOpen,
      iconColor: "text-blue-600",
      color: "bg-blue-50",
      href: "/dashboard/purchases",
    },
    {
      title: "My Bookings",
      description: "Manage service bookings",
      icon: CalendarCheck,
      iconColor: "text-purple-600",
      color: "bg-purple-50",
      href: "/dashboard/bookings",
    },
  ];

  return (
    <main className="min-h-full bg-gray-50/70">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 space-y-6">
        {/* Welcome Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-[11px] font-semibold mb-2">
              <TrendingUp className="h-3 w-3" />
              Your Community Hub
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {isNewUser ? "Welcome" : "Welcome back"},{" "}
              {user?.name?.split(" ")[0] || "there"}{" "}
              <span role="img" aria-label="waving hand">
                👋
              </span>
            </h1>
            <p className="mt-1 text-[13px] text-gray-500">
              Here&apos;s what&apos;s happening in your community today.
            </p>
          </div>
        </header>

        {/* First-run checklist (hides itself once done) */}
        <GettingStarted />

        {/* Quick Stats Overview */}
        <StatsOverview />

        {/* Important Actions (Only renders if items need attention) */}
        <NeedsAttention />

        {/* Quick Actions Grid */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-bold tracking-tight text-gray-900">
              Quick actions
            </h2>
            <p className="text-xs text-gray-500">
              Shortcuts to the things you do most.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm shadow-gray-200/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md hover:shadow-gray-200/40"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${link.color} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${link.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-gray-900 truncate">
                      {link.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {link.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Main Content Grid: Activity & Marketplace Discovery */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <RecentActivity />

          {/* Explore marketplace sidebar */}
          <aside className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/30">
            <div className="border-b border-gray-100 px-4 py-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <ShoppingBag className="h-[18px] w-[18px] text-primary-600" />
              </div>

              <h2 className="text-sm font-bold tracking-tight text-gray-900">
                Explore your neighborhood
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-gray-500">
                Discover useful items and services available around you.
              </p>
            </div>

            <div className="space-y-2 p-3">
              <Link
                href="/browse/items"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-primary-500/20 transition-colors hover:bg-primary-700"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Items
                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-80" />
              </Link>

              <Link
                href="/browse/services"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <Wrench className="h-4 w-4 text-gray-500" />
                Browse Services
                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-60" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

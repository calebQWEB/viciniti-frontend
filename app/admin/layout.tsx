"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, LayoutDashboard, Menu, ReceiptText, ScrollText, Store, Tags, Users, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { fetchOverview } from "@/lib/adminOrders";
import type { AdminOverview } from "@/types/admin";

const adminLinks: {
  href: string;
  label: string;
  icon: React.ReactNode;
  // Number shown beside the link, from the overview's attention counts
  badge?: (attention: AdminOverview["attention"]) => number;
}[] = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  {
    href: "/admin/orders",
    label: "Orders & money",
    icon: <ReceiptText className="h-4.5 w-4.5" />,
    badge: (a) => a.failing_payouts + a.refunds + a.disputes,
  },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4.5 w-4.5" /> },
  { href: "/admin/listings", label: "Listings", icon: <Store className="h-4.5 w-4.5" /> },
  { href: "/admin/categories", label: "Categories", icon: <Tags className="h-4.5 w-4.5" /> },
  {
    href: "/admin/logs",
    label: "Logs",
    icon: <ScrollText className="h-4.5 w-4.5" />,
    badge: (a) => a.critical_logs,
  },
];

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = Boolean(user?.is_admin);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Convenience only: the API refuses non-admins whatever the page does
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace("/login");
    else if (user && !isAdmin) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, user, isAdmin, router]);

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchOverview,
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  if (isLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-earth-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const brand = (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-7.5 w-7.5 items-center justify-center rounded-[10px] bg-primary-600 text-[13px] font-black text-white">
        {BRAND.initial}
      </span>
      <span className="text-base font-bold text-gray-900">{BRAND.name}</span>
      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
        ADMIN
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Phone top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-earth-200 bg-white px-3 py-2 lg:hidden">
        <button
          type="button"
          aria-label="Open admin menu"
          onClick={() => setIsMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-earth-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        {brand}
        <span className="w-11" />
      </header>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-earth-200 bg-white transition-transform duration-200 lg:w-56 lg:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-earth-100 px-4 py-4">
          {brand}
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-xl p-2 text-gray-600 hover:bg-earth-100 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {adminLinks.map((link) => {
            const active = isActive(pathname, link.href);
            const count = link.badge && overview ? link.badge(overview.attention) : 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                  active ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-earth-100 hover:text-gray-900"
                }`}
              >
                {link.icon}
                <span className="flex-1">{link.label}</span>
                {count > 0 && (
                  <span className="min-w-5 rounded-full bg-red-100 px-1.5 py-0.5 text-center text-[10px] font-bold text-red-700">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-earth-100 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-earth-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to my dashboard
          </Link>
        </div>
      </aside>

      <div className="min-w-0 lg:ml-56">{children}</div>
    </div>
  );
}

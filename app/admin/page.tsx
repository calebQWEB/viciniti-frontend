"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CircleCheck } from "lucide-react";
import DailyOrdersChart from "@/components/admin/DailyOrdersChart";
import { fetchOverview, formatNairaCompact } from "@/lib/adminOrders";
import { formatPrice } from "@/lib/utils";
import type { AdminOverview } from "@/types/admin";

const ATTENTION: { key: keyof AdminOverview["attention"]; label: string; href: string; hint: string }[] = [
  { key: "failing_payouts", label: "Failing payouts", href: "/admin/orders?queue=failing_payouts", hint: "Due but not sent" },
  { key: "refunds", label: "Refunds owed", href: "/admin/orders?queue=refunds", hint: "Paid after the order closed" },
  { key: "disputes", label: "Open disputes", href: "/admin/orders?queue=disputes", hint: "Chargebacks in progress" },
  { key: "blocked_payouts", label: "Blocked payouts", href: "/admin/orders?queue=blocked_payouts", hint: "Seller has no bank account" },
  { key: "held_payouts", label: "Held payouts", href: "/admin/orders?queue=held_payouts", hint: "Seller is suspended" },
  { key: "critical_logs", label: "Critical logs", href: "/admin/logs?level=critical", hint: "Unresolved" },
];

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-earth-200 bg-white px-4 py-3.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-[22px] font-bold leading-none text-gray-900">{value}</span>
      {sub && <span className="text-[11.5px] text-gray-500">{sub}</span>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchOverview,
    refetchInterval: 60_000,
  });

  if (isError) {
    return <p className="px-4 py-10 text-center text-[13px] text-red-600">Couldn&apos;t load the overview. Try refreshing.</p>;
  }
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const totalOrders = Object.values(data.orders_by_status).reduce((a, b) => a + b, 0);
  const openOrders = data.orders_by_status.paid + data.orders_by_status.fulfilled;
  const needsAttention = ATTENTION.filter((item) => data.attention[item.key] > 0);

  return (
    <main className="flex flex-col gap-5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">How the marketplace is doing, and what needs you</p>
      </div>

      <section aria-labelledby="attention-heading" className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
        <h2 id="attention-heading" className="border-b border-earth-100 px-4 py-3 text-[13.5px] font-semibold text-gray-900">
          Needs attention
        </h2>
        {needsAttention.length === 0 ? (
          <p className="flex items-center gap-2 px-4 py-4 text-[12.5px] text-primary-700">
            <CircleCheck className="h-4 w-4" /> Nothing needs you right now.
          </p>
        ) : (
          <ul>
            {needsAttention.map((item) => (
              <li key={item.key} className="border-b border-earth-100 last:border-b-0">
                <Link href={item.href} className="flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50">
                  <span className="min-w-8 rounded-full bg-red-100 px-2 py-0.5 text-center text-xs font-bold text-red-700">
                    {data.attention[item.key]}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-gray-900">{item.label}</span>
                    <span className="block text-[11.5px] text-gray-500">{item.hint}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Marketplace" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Users" value={data.users_total.toLocaleString("en-NG")} sub={`${data.users_new_7d} new this week`} />
        <StatTile label="Active listings" value={data.listings_active.toLocaleString("en-NG")} />
        <StatTile label="Active services" value={data.services_active.toLocaleString("en-NG")} />
        <StatTile label="Orders" value={totalOrders.toLocaleString("en-NG")} sub={`${openOrders} in progress`} />
      </section>

      <section aria-labelledby="money-heading" className="rounded-2xl border border-earth-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="money-heading" className="text-[13.5px] font-semibold text-gray-900">Money</h2>
          <span className="text-xs text-gray-500">
            Owed to sellers: <span className="font-semibold text-gray-900">{formatPrice(data.payouts_owed)}</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-80 text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold tracking-wide text-gray-500">
                <th scope="col" className="pb-2 font-semibold"> </th>
                <th scope="col" className="pb-2 text-right font-semibold">LAST 30 DAYS</th>
                <th scope="col" className="pb-2 text-right font-semibold">ALL TIME</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Sales through the platform", "sales"],
                  ["Fees earned", "fees"],
                  ["Paid out to sellers", "payouts_sent"],
                ] as const
              ).map(([label, key]) => (
                <tr key={key} className="border-t border-earth-100">
                  <th scope="row" className="py-2 text-left font-normal text-gray-700">{label}</th>
                  <td className="py-2 text-right font-semibold text-gray-900" title={formatPrice(data.last_30d[key])}>
                    {formatNairaCompact(data.last_30d[key])}
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-900" title={formatPrice(data.all_time[key])}>
                    {formatNairaCompact(data.all_time[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-earth-200 bg-white p-4">
        <DailyOrdersChart daily={data.daily} />
      </section>
    </main>
  );
}

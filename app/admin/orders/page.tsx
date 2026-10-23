"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import AdminOrderRow from "@/components/admin/AdminOrderRow";
import RefundDialog from "@/components/admin/RefundDialog";
import { useAdminOrderActions } from "@/hooks/useAdminOrderActions";
import { ORDER_STATUSES, QUEUES, fetchAdminOrders, fetchOrderQueues } from "@/lib/adminOrders";
import type { AdminOrderItem, OrderQueueName } from "@/types/admin";

type Tab = OrderQueueName | "all";

function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get("queue");
  const tab: Tab = requested === "all" || QUEUES.some((q) => q.name === requested) ? (requested as Tab) : "failing_payouts";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParams = useCallback(
    (changes: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || (key === "page" && value === 1)) params.delete(key);
        else params.set(key, String(value));
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Search box: typed locally, pushed to the URL after a pause
  const [searchDraft, setSearchDraft] = useState({ base: search, value: search });
  const searchInput = searchDraft.base === search ? searchDraft.value : search;
  useEffect(() => {
    const wanted = searchInput.trim();
    if (wanted === search) return;
    const timeout = setTimeout(() => {
      setSearchDraft((prev) => ({ ...prev, base: wanted }));
      setParams({ search: wanted, page: null });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput, search, setParams]);

  const queues = useQuery({
    queryKey: ["admin-order-queues"],
    queryFn: fetchOrderQueues,
    refetchInterval: 60_000,
  });
  const allOrders = useQuery({
    queryKey: ["admin-orders", page, search, status],
    queryFn: () => fetchAdminOrders({ page, search, status }),
    placeholderData: keepPreviousData,
    enabled: tab === "all",
  });

  const actions = useAdminOrderActions();
  const [refunding, setRefunding] = useState<AdminOrderItem | null>(null);
  const closeRefund = useCallback(() => {
    setRefunding(null);
    actions.refund.reset();
  }, [actions.refund]);

  const queue = QUEUES.find((q) => q.name === tab);
  const queueItems = tab !== "all" ? queues.data?.[tab] : undefined;
  const queueCount = tab !== "all" ? queues.data?.counts[tab] : undefined;

  return (
    <main className="flex flex-col gap-4.5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders &amp; money</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">Payouts, refunds and disputes that need a hand</p>
        </div>
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => (tab === "all" ? allOrders.refetch() : queues.refetch())}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-earth-200 bg-white text-gray-600 hover:bg-earth-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${queues.isFetching || allOrders.isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div role="tablist" aria-label="Order queues" className="flex flex-wrap gap-1.5">
        {[...QUEUES, { name: "all" as const, label: "All orders" }].map((item) => {
          const isActive = tab === item.name;
          const count = item.name !== "all" ? queues.data?.counts[item.name] : undefined;
          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setParams({ queue: item.name === "failing_payouts" ? null : item.name, page: null })}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium ${
                isActive
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-earth-200 bg-white text-gray-700 hover:border-earth-300"
              }`}
            >
              {item.label}
              {count !== undefined && (
                <span
                  className={`rounded-full px-1.5 text-[11px] font-bold ${
                    isActive ? "bg-white/20 text-white" : count > 0 ? "bg-red-100 text-red-700" : "bg-earth-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "failing_payouts" && (queueCount ?? 0) > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-earth-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12.5px] text-gray-600">
              Fixed the cause (e.g. the Flutterwave IP whitelist)? Retry them all at once, up to 50.
            </p>
            <button
              type="button"
              onClick={() => actions.retryAll.mutate()}
              disabled={actions.retryAll.isPending}
              className="h-9 rounded-[10px] bg-primary-600 px-3.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {actions.retryAll.isPending ? "Retrying…" : `Retry all ${queueCount}`}
            </button>
          </div>
          {actions.retryAll.isError && <p className="text-xs text-red-600">Couldn&apos;t run the retries. Try again.</p>}
        </div>
      )}

      {actions.retryAllResult && (
        <section aria-label="Retry results" className="rounded-2xl border border-earth-200 bg-white px-4 py-3 text-[12.5px]">
          <p className="font-semibold text-gray-900">
            {actions.retryAllResult.sent} of {actions.retryAllResult.attempted} payouts sent
          </p>
          <ul className="mt-1 space-y-0.5">
            {actions.retryAllResult.results.map((result) => (
              <li key={result.order_id} className={result.ok ? "text-primary-700" : "text-red-700"}>
                {actions.describe(result)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "all" && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-55 flex-[1_1_300px] items-center gap-2 rounded-xl border border-earth-200 bg-white px-3 text-gray-500 focus-within:border-primary-500 sm:h-9">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchDraft({ base: search, value: e.target.value })}
              placeholder="Order number, payment reference, name or email"
              className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none sm:text-[12.5px]"
            />
          </label>
          <label className="sr-only" htmlFor="order-status">Status</label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => setParams({ status: e.target.value, page: null })}
            className="h-10 rounded-xl border border-earth-200 bg-white px-2.5 text-xs font-medium capitalize text-gray-700 sm:h-9"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <section aria-label={queue?.label ?? "All orders"} className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
        {tab !== "all" ? (
          queues.isError ? (
            <p className="px-4 py-8 text-center text-[13px] text-red-600">Couldn&apos;t load the queues. Try refreshing.</p>
          ) : !queueItems ? (
            <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
          ) : queueItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-gray-500">{queue?.empty}</p>
          ) : (
            <ul>
              {queueItems.map((order) => (
                <AdminOrderRow
                  key={order.id}
                  order={order}
                  queue={tab}
                  retryResult={actions.results[order.id]}
                  isRetrying={actions.retryingId === order.id}
                  onRetry={actions.retryOne}
                  onRefund={setRefunding}
                />
              ))}
            </ul>
          )
        ) : allOrders.isError ? (
          <p className="px-4 py-8 text-center text-[13px] text-red-600">Couldn&apos;t load orders. Try refreshing.</p>
        ) : !allOrders.data ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
        ) : allOrders.data.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">No orders match.</p>
        ) : (
          <>
            <ul>
              {allOrders.data.items.map((order) => (
                <AdminOrderRow key={order.id} order={order} />
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-earth-100 px-4 py-2.5 text-xs text-gray-500">
              <span>{allOrders.data.total} orders</span>
              <nav aria-label="Pages" className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setParams({ page: page - 1 })}
                  className="h-8 rounded-lg border border-earth-200 bg-white px-3 text-gray-700 disabled:text-gray-400"
                >
                  Previous
                </button>
                <span>
                  Page {allOrders.data.page} of {allOrders.data.total_pages}
                </span>
                <button
                  type="button"
                  disabled={page >= allOrders.data.total_pages}
                  onClick={() => setParams({ page: page + 1 })}
                  className="h-8 rounded-lg border border-earth-200 bg-white px-3 text-gray-700 disabled:text-gray-400"
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </section>

      {tab !== "all" && queueItems && queueCount !== undefined && queueCount > queueItems.length && (
        <p className="text-xs text-gray-500">Showing the first {queueItems.length} of {queueCount}.</p>
      )}

      {refunding && (
        <RefundDialog
          orderId={refunding.id}
          amount={refunding.amount}
          buyerName={refunding.buyer.name}
          isPending={actions.refund.isPending}
          error={actions.refundError}
          onConfirm={(reference, note) =>
            actions.refund.mutate({ id: refunding.id, reference, note }, { onSuccess: () => setRefunding(null) })
          }
          onCancel={closeRefund}
        />
      )}
    </main>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersContent />
    </Suspense>
  );
}

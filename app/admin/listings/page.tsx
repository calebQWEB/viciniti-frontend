"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, ImageOff, Search, X } from "lucide-react";
import ListingStatusBadge from "@/components/admin/ListingStatusBadge";
import { timeAgo } from "@/lib/adminLogs";
import { KIND_LABELS, STATUS_FILTERS, fetchAdminCategories, fetchAdminListings } from "@/lib/adminListings";
import { formatPrice } from "@/lib/utils";
import type { ListingKind } from "@/types/admin";

function AdminListingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const kind: ListingKind = searchParams.get("kind") === "service" ? "service" : "item";
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const sellerId = searchParams.get("seller") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParams = useCallback(
    (changes: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || (key === "page" && value === 1) || (key === "kind" && value === "item")) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
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

  const { data, isError } = useQuery({
    queryKey: ["admin-listings", kind, page, search, status, categoryId, sellerId],
    queryFn: () => fetchAdminListings({ kind, page, search, status, categoryId, sellerId }),
    placeholderData: keepPreviousData,
  });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: fetchAdminCategories });
  const kindCategories = (categories ?? []).filter((c) => c.type === kind);

  const controlClass =
    "h-10 rounded-xl border border-earth-200 bg-white px-2.5 text-xs font-medium text-gray-700 sm:h-9";

  return (
    <main className="flex flex-col gap-4.5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Listings</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">Everything people have put up, including removed items</p>
      </div>

      <div role="tablist" aria-label="Kind" className="flex w-fit gap-0.5 rounded-xl bg-earth-100 p-0.75">
        {(["item", "service"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            // Status and category values differ between kinds, so they reset
            onClick={() => setParams({ kind: k, status: null, category: null, page: null })}
            className={`rounded-[9px] px-3.5 py-1.5 text-[12.5px] ${
              kind === k ? "bg-white font-semibold text-gray-900 shadow-sm" : "font-medium text-gray-600 hover:text-gray-900"
            }`}
          >
            {KIND_LABELS[k].many}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-55 flex-[1_1_280px] items-center gap-2 rounded-xl border border-earth-200 bg-white px-3 text-gray-500 focus-within:border-primary-500 sm:h-9">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Search listings</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchDraft({ base: search, value: e.target.value })}
            placeholder="Title, or the seller's name or email"
            className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none sm:text-[12.5px]"
          />
        </label>
        <label className="sr-only" htmlFor="listing-status">Status</label>
        <select
          id="listing-status"
          value={status}
          onChange={(e) => setParams({ status: e.target.value, page: null })}
          className={controlClass}
        >
          {STATUS_FILTERS[kind].map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="listing-category">Category</label>
        <select
          id="listing-category"
          value={categoryId}
          onChange={(e) => setParams({ category: e.target.value, page: null })}
          className={controlClass}
        >
          <option value="">All categories</option>
          {kindCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.is_active ? "" : " (retired)"}
            </option>
          ))}
        </select>
        {sellerId && (
          <span className="flex items-center gap-1 rounded-full bg-primary-50 py-1 pl-3 pr-1 text-xs text-primary-700">
            One seller only
            <button
              type="button"
              aria-label="Show all sellers"
              onClick={() => setParams({ seller: null, page: null })}
              className="rounded-full p-0.5 hover:bg-primary-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      <section aria-label={KIND_LABELS[kind].many} className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
        {isError ? (
          <p className="px-4 py-8 text-center text-[13px] text-red-600">Couldn&apos;t load listings. Try refreshing.</p>
        ) : !data ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
        ) : data.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">Nothing matches.</p>
        ) : (
          <>
            <ul>
              {data.items.map((item) => (
                <li key={item.id} className="border-b border-earth-100 last:border-b-0">
                  <Link href={`/admin/listings/${item.kind}/${item.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-earth-50">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-earth-100">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt="" width={48} height={48} className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium text-gray-900">{item.title}</span>
                        <ListingStatusBadge item={item} />
                      </span>
                      <span className="block truncate text-[11.5px] text-gray-500">
                        {item.seller.name}
                        {item.location && <> · {item.location}</>}
                        {item.category && <> · {item.category.name}</>}
                        {item.created_at && <> · {timeAgo(item.created_at)}</>}
                      </span>
                      {item.removed_at && (
                        <span className="block truncate text-[11.5px] text-red-700">Removed: {item.removal_reason}</span>
                      )}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900">{formatPrice(item.price)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-earth-100 px-4 py-2.5 text-xs text-gray-500">
              <span>{data.total} {data.total === 1 ? KIND_LABELS[kind].one : `${KIND_LABELS[kind].one}s`}</span>
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
                  Page {data.page} of {data.total_pages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.total_pages}
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
    </main>
  );
}

export default function AdminListingsPage() {
  return (
    <Suspense fallback={null}>
      <AdminListingsContent />
    </Suspense>
  );
}

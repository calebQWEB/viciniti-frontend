"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import { timeAgo } from "@/lib/adminLogs";
import { USER_FILTERS, fetchAdminUsers } from "@/lib/adminUsers";
import UserBadges from "@/components/admin/UserBadges";
import { getInitials } from "@/lib/utils";
import type { UserFilter } from "@/types/admin";

function AdminUsersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get("filter") as UserFilter;
  const filter: UserFilter = USER_FILTERS.some((f) => f.value === requested) ? requested : "all";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParams = useCallback(
    (changes: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "" || (key === "page" && value === 1) || (key === "filter" && value === "all")) {
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
    queryKey: ["admin-users", page, search, filter],
    queryFn: () => fetchAdminUsers({ page, search, filter }),
    placeholderData: keepPreviousData,
  });

  return (
    <main className="flex flex-col gap-4.5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">Everyone with an account</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div role="tablist" aria-label="Filter users" className="flex gap-0.5 rounded-xl bg-earth-100 p-0.75">
          {USER_FILTERS.map((option) => {
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setParams({ filter: option.value, page: null })}
                className={`rounded-[9px] px-3 py-1.5 text-[12.5px] ${
                  isActive ? "bg-white font-semibold text-gray-900 shadow-sm" : "font-medium text-gray-600 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="flex h-10 min-w-55 flex-[0_1_340px] items-center gap-2 rounded-xl border border-earth-200 bg-white px-3 text-gray-500 focus-within:border-primary-500 sm:h-9">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Search users</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchDraft({ base: search, value: e.target.value })}
            placeholder="Name or email"
            className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none sm:text-[12.5px]"
          />
        </label>
      </div>

      <section aria-label="Users" className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
        {isError ? (
          <p className="px-4 py-8 text-center text-[13px] text-red-600">Couldn&apos;t load users. Try refreshing.</p>
        ) : !data ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">Loading…</p>
        ) : data.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">No users match.</p>
        ) : (
          <>
            <ul>
              {data.items.map((user) => (
                <li key={user.id} className="border-b border-earth-100 last:border-b-0">
                  <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-earth-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {getInitials(user.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px] font-medium text-gray-900">{user.name}</span>
                        <UserBadges user={user} />
                      </span>
                      <span className="block truncate text-xs text-gray-500">{user.email}</span>
                    </span>
                    <span className="hidden text-right text-[11.5px] text-gray-500 sm:block">
                      <span className="block">{user.orders_count} order{user.orders_count === 1 ? "" : "s"}</span>
                      {user.created_at && <span className="block">joined {timeAgo(user.created_at)}</span>}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-earth-100 px-4 py-2.5 text-xs text-gray-500">
              <span>{data.total} user{data.total === 1 ? "" : "s"}</span>
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

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RefreshCw } from "lucide-react";
import LogDetailPanel from "@/components/admin/LogDetailPanel";
import LogFilterBar from "@/components/admin/LogFilterBar";
import LogList from "@/components/admin/LogList";
import LogSummaryPanel from "@/components/admin/LogSummaryPanel";
import ResolveDialog from "@/components/admin/ResolveDialog";
import { apiErrorDetail } from "@/lib/auth";
import {
  DEFAULT_LOG_FILTERS,
  bulkResolveLogs,
  fetchLogSummary,
  fetchLogs,
  fetchOpenCountForEvent,
  filtersFromParams,
  filtersToQuery,
  type LogFilters,
} from "@/lib/adminLogs";
import type { LogLevel } from "@/types/app_log";

const REFRESH_MS = 60_000;

type BulkTarget = { ids: string[] } | { event: string };

function AdminLogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const selectedId = searchParams.get("entry");

  const navigate = useCallback(
    (next: LogFilters, entryId: string | null) => {
      const query = filtersToQuery(next, entryId);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );
  // Any filter change goes back to page 1; the open entry stays open
  const updateFilters = useCallback(
    (changes: Partial<LogFilters>) => navigate({ ...filters, page: 1, ...changes }, selectedId),
    [navigate, filters, selectedId],
  );
  const openEntry = (id: string | null) => navigate(filters, id);

  // Search box is typed into locally and pushed to the URL after a pause.
  // `base` is the URL search it was typed against; if the URL changes another way (e.g. Clear filters), the box follows.
  const [search, setSearch] = useState({ base: filters.search, value: filters.search });
  const searchInput = search.base === filters.search ? search.value : filters.search;
  const onSearchInput = (value: string) => setSearch({ base: filters.search, value });
  useEffect(() => {
    const wanted = searchInput.trim();
    if (wanted === filters.search) return;
    const timeout = setTimeout(() => {
      setSearch((prev) => ({ ...prev, base: wanted }));
      updateFilters({ search: wanted });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput, filters.search, updateFilters]);

  const logs = useQuery({
    queryKey: ["admin-logs", filters],
    queryFn: () => fetchLogs(filters),
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
  });
  const summary = useQuery({
    queryKey: ["admin-logs-summary"],
    queryFn: fetchLogSummary,
    refetchInterval: REFRESH_MS,
  });

  // Ticked rows belong to the filters and page they were ticked on; changing either clears them
  const filtersKey = filtersToQuery(filters);
  const [checked, setChecked] = useState({ key: filtersKey, ids: new Set<string>() });
  const checkedIds = checked.key === filtersKey ? checked.ids : new Set<string>();
  const setCheckedIds = (ids: Set<string>) => setChecked({ key: filtersKey, ids });

  const toggleChecked = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIds(next);
  };
  const toggleAll = (ids: string[], on: boolean) => setCheckedIds(on ? new Set(ids) : new Set());

  // Bulk resolve: ticked rows, or every open entry for one event
  const [bulkTarget, setBulkTarget] = useState<BulkTarget | null>(null);
  const eventToResolve = bulkTarget && "event" in bulkTarget ? bulkTarget.event : null;
  const { data: eventOpenCount } = useQuery({
    queryKey: ["admin-log-event-count", eventToResolve],
    queryFn: () => fetchOpenCountForEvent(eventToResolve!),
    enabled: Boolean(eventToResolve),
  });
  const bulk = useMutation({
    mutationFn: ({ target, note }: { target: BulkTarget; note: string }) => bulkResolveLogs(target, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-log"] });
      queryClient.invalidateQueries({ queryKey: ["admin-log-event-count"] });
      setCheckedIds(new Set());
      setBulkTarget(null);
    },
  });
  const closeBulk = useCallback(() => {
    setBulkTarget(null);
    bulk.reset();
  }, [bulk]);

  const refreshAll = () => {
    logs.refetch();
    summary.refetch();
  };

  const singleLevel: LogLevel | null =
    filters.status === "open" && filters.levels.length === 1 ? filters.levels[0] : null;
  const updatedAt = Math.max(logs.dataUpdatedAt, summary.dataUpdatedAt);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start">
      <main className="flex min-w-0 flex-1 flex-col gap-4.5 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Logs</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">Errors, issues and activity across the platform</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {updatedAt > 0 && (
              <span>
                Updated{" "}
                {new Date(updatedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              aria-label="Refresh"
              onClick={refreshAll}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-earth-200 bg-white text-gray-600 hover:bg-earth-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${logs.isFetching || summary.isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <LogSummaryPanel
          summary={summary.data}
          activeLevel={singleLevel}
          onPickLevel={(level) =>
            updateFilters(singleLevel === level ? { levels: [] } : { status: "open", levels: [level] })
          }
          onViewEvent={(event) => updateFilters({ status: "open", event })}
          onResolveEvent={(event) => setBulkTarget({ event })}
        />

        <LogFilterBar
          filters={filters}
          searchInput={searchInput}
          onSearchInput={onSearchInput}
          onChange={updateFilters}
          onClear={() => navigate({ ...DEFAULT_LOG_FILTERS, status: filters.status }, selectedId)}
          total={logs.data?.total}
        />

        {checkedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-gray-900 px-3.5 py-2 text-white">
            <span className="text-[12.5px] font-medium">{checkedIds.size} selected</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckedIds(new Set())}
                className="rounded-[9px] border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBulkTarget({ ids: [...checkedIds] })}
                className="flex items-center gap-1.5 rounded-[9px] bg-primary-400 px-3 py-1.5 text-xs font-semibold text-primary-900 hover:bg-primary-300"
              >
                <Check className="h-3.5 w-3.5" />
                Resolve selected
              </button>
            </div>
          </div>
        )}

        {logs.isError && !logs.data ? (
          <p className="rounded-2xl border border-earth-200 bg-white px-4 py-6 text-center text-[13px] text-red-600">
            Couldn&apos;t load logs. {apiErrorDetail(logs.error) ?? "Try refreshing."}
          </p>
        ) : !logs.data ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : logs.data.items.length === 0 ? (
          <p className="rounded-2xl border border-earth-200 bg-white px-4 py-10 text-center text-[13px] text-gray-500">
            {filters.status === "open" ? "Nothing open here. All clear." : "No log entries match these filters."}
          </p>
        ) : (
          <LogList
            data={logs.data}
            selectedId={selectedId}
            checkedIds={checkedIds}
            onToggleChecked={toggleChecked}
            onToggleAll={toggleAll}
            onOpen={openEntry}
            onPage={(page) => navigate({ ...filters, page }, selectedId)}
          />
        )}
      </main>

      {selectedId && (
        <aside
          aria-label="Log entry detail"
          className="fixed inset-0 z-50 overflow-y-auto bg-white lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-105 lg:shrink-0 lg:border-l lg:border-earth-200"
        >
          <LogDetailPanel
            key={selectedId}
            id={selectedId}
            onClose={() => openEntry(null)}
            onShowEvent={(event) => navigate({ ...filters, page: 1, status: "open", event }, null)}
            onResolveEvent={(event) => setBulkTarget({ event })}
          />
        </aside>
      )}

      {bulkTarget && (
        <ResolveDialog
          title={"ids" in bulkTarget ? `Resolve ${bulkTarget.ids.length} entries?` : "Resolve every open entry?"}
          description={
            "ids" in bulkTarget ? (
              "The selected entries will be marked resolved with this note."
            ) : (
              <>
                All {eventOpenCount ?? "…"} open <span className="font-mono font-medium text-gray-800">{bulkTarget.event}</span>{" "}
                entries will be marked resolved with this note (up to 500 at a time).
              </>
            )
          }
          confirmLabel="Resolve"
          isPending={bulk.isPending}
          error={bulk.isError ? (apiErrorDetail(bulk.error) ?? "Couldn't resolve. Try again.") : null}
          onConfirm={(note) => bulk.mutate({ target: bulkTarget, note })}
          onCancel={closeBulk}
        />
      )}
    </div>
  );
}

export default function AdminLogsPage() {
  return (
    <Suspense fallback={null}>
      <AdminLogsContent />
    </Suspense>
  );
}

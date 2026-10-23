import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { LEVEL_STYLES, LOG_CATEGORIES, LOG_LEVELS, hasActiveFilters, type LogFilters } from "@/lib/adminLogs";
import type { LogLevel, LogStatus } from "@/types/app_log";

const STATUS_TABS: { value: LogStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

const controlClass =
  "h-8 rounded-[10px] border border-earth-200 bg-white px-2.5 text-xs font-medium text-gray-700 focus:border-primary-500 focus:outline-none";

interface Props {
  filters: LogFilters;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onChange: (changes: Partial<LogFilters>) => void;
  onClear: () => void;
  // Count shown on the current status tab
  total?: number;
}

export default function LogFilterBar({ filters, searchInput, onSearchInput, onChange, onClear, total }: Props) {
  // On phones the level/category/date row folds behind a Filters button
  const [showMore, setShowMore] = useState(false);

  const toggleLevel = (level: LogLevel) =>
    onChange({
      levels: filters.levels.includes(level)
        ? filters.levels.filter((l) => l !== level)
        : [...filters.levels, level],
    });

  return (
    <section aria-label="Filters" className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div role="tablist" aria-label="Status" className="flex gap-0.5 rounded-xl bg-earth-100 p-0.75">
          {STATUS_TABS.map((tab) => {
            const isActive = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange({ status: tab.value })}
                className={`rounded-[9px] px-3 py-1.5 text-[12.5px] sm:px-3.5 ${
                  isActive
                    ? "bg-white font-semibold text-gray-900 shadow-sm"
                    : "font-medium text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {isActive && total !== undefined && (
                  <span className="ml-1 font-medium text-gray-500">{total}</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-earth-200 bg-white px-3 text-xs font-semibold text-gray-700 sm:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </button>

        {/* Full-width first row on phones, beside the tabs from sm up */}
        <label className="order-first flex h-11 w-full items-center gap-2 rounded-xl border border-earth-200 bg-white px-3 text-gray-500 focus-within:border-primary-500 sm:order-none sm:h-9 sm:w-auto sm:min-w-55 sm:flex-[0_1_340px]">
          <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          <span className="sr-only">Search logs</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            placeholder="Search messages, events or ERR-…"
            className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none sm:text-[12.5px]"
          />
        </label>
      </div>

      <div className={`${showMore ? "flex" : "hidden"} flex-wrap items-center gap-2 sm:flex`}>
        <span className="mr-0.5 text-xs text-gray-500">Level</span>
        {LOG_LEVELS.map((level) => {
          const isOn = filters.levels.includes(level);
          return (
            <button
              key={level}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggleLevel(level)}
              className={`rounded-full border px-2.75 py-1 text-xs font-medium ${
                isOn
                  ? `border-transparent ${LEVEL_STYLES[level].badge}`
                  : "border-earth-200 bg-white text-gray-700 hover:border-earth-300"
              }`}
            >
              {LEVEL_STYLES[level].label}
            </button>
          );
        })}

        <span className="mx-1 hidden h-5 w-px bg-earth-200 sm:block" aria-hidden="true" />

        <label className="sr-only" htmlFor="log-category">Category</label>
        <select
          id="log-category"
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className={controlClass}
        >
          <option value="">All categories</option>
          {LOG_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <label htmlFor="log-from">From</label>
          <input
            id="log-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value })}
            className={controlClass}
          />
          <label htmlFor="log-to">to</label>
          <input
            id="log-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value })}
            className={controlClass}
          />
        </span>
      </div>

      {(filters.event || hasActiveFilters(filters)) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.event && (
            <span className="flex items-center gap-1 rounded-full bg-primary-50 py-0.5 pl-2.5 pr-1 text-xs text-primary-700">
              Event: <span className="font-mono font-medium">{filters.event}</span>
              <button
                type="button"
                aria-label="Remove event filter"
                onClick={() => onChange({ event: "" })}
                className="rounded-full p-0.5 hover:bg-primary-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button type="button" onClick={onClear} className="text-xs font-semibold text-primary-600 hover:text-primary-800">
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

import { CircleX, OctagonAlert, TriangleAlert } from "lucide-react";
import LevelBadge from "@/components/admin/LevelBadge";
import { LEVEL_STYLES, timeAgo } from "@/lib/adminLogs";
import type { LevelCounts, LogLevel, LogSummary } from "@/types/app_log";

const TILES: { level: Exclude<LogLevel, "info">; label: string; icon: React.ReactNode; iconBg: string; activeBorder: string }[] = [
  { level: "critical", label: "Critical", icon: <OctagonAlert className="h-3.5 w-3.5" />, iconBg: "bg-red-100", activeBorder: "border-red-300" },
  { level: "error", label: "Errors", icon: <CircleX className="h-3.5 w-3.5" />, iconBg: "bg-orange-100", activeBorder: "border-orange-300" },
  { level: "warning", label: "Warnings", icon: <TriangleAlert className="h-3.5 w-3.5" />, iconBg: "bg-amber-100", activeBorder: "border-amber-300" },
];

const total = (counts: Partial<LevelCounts>) =>
  Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);

interface Props {
  summary?: LogSummary;
  // The single level currently filtered on, if any (highlights its tile)
  activeLevel?: LogLevel | null;
  onPickLevel: (level: LogLevel) => void;
  onViewEvent: (event: string) => void;
  onResolveEvent: (event: string) => void;
}

export default function LogSummaryPanel({ summary, activeLevel, onPickLevel, onViewEvent, onResolveEvent }: Props) {
  return (
    <>
      <section aria-label="Summary" className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
        {TILES.map((tile) => {
          const style = LEVEL_STYLES[tile.level];
          const isActive = activeLevel === tile.level;
          return (
            <button
              key={tile.level}
              type="button"
              onClick={() => onPickLevel(tile.level)}
              aria-pressed={isActive}
              className={`flex flex-col gap-1 rounded-2xl border-[1.5px] bg-white px-3 py-2.5 text-left transition-colors hover:border-earth-300 sm:gap-2.5 sm:px-4 sm:py-3.5 ${
                isActive ? tile.activeBorder : "border-earth-200"
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className={`text-[11px] font-semibold sm:text-xs ${style.text}`}>
                  {tile.label}
                  <span className="hidden sm:inline"> · open</span>
                </span>
                <span className={`hidden h-6.5 w-6.5 items-center justify-center rounded-lg sm:flex ${tile.iconBg} ${style.text}`}>
                  {tile.icon}
                </span>
              </span>
              <span className="text-xl font-bold leading-none text-gray-900 sm:text-2xl">
                {summary ? (summary.open[tile.level] ?? 0) : "–"}
              </span>
              <span className="hidden text-[11.5px] text-gray-500 sm:block">
                {summary ? `${summary.last_24h[tile.level] ?? 0} in the last 24h` : " "}
              </span>
            </button>
          );
        })}
        <div className="col-span-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border-[1.5px] border-primary-100 bg-primary-50 px-4 py-2.5 text-xs text-gray-700 lg:col-span-1 lg:flex-col lg:items-stretch lg:gap-2 lg:py-3.5">
          <span className="font-semibold text-primary-600">Activity</span>
          <span className="flex justify-between gap-3">
            <span>Last 24 hours</span>
            <span className="font-semibold">{summary ? total(summary.last_24h) : "–"} events</span>
          </span>
          <span className="flex justify-between gap-3">
            <span>Last 7 days</span>
            <span className="font-semibold">{summary ? total(summary.last_7d) : "–"} events</span>
          </span>
        </div>
      </section>

      <section aria-labelledby="repeat-heading" className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
        <div className="flex items-baseline justify-between border-b border-earth-100 px-4 py-3">
          <h2 id="repeat-heading" className="text-[13.5px] font-semibold text-gray-900">
            Repeated problems · last 7 days
          </h2>
          <span className="hidden text-[11.5px] text-gray-500 sm:inline">Grouped by event</span>
        </div>
        {summary && summary.top_problems.length === 0 && (
          <p className="px-4 py-4 text-[12.5px] text-gray-500">No problems this week.</p>
        )}
        {summary?.top_problems.map((problem) => (
          <div
            key={`${problem.event}-${problem.level}`}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-earth-100 px-4 py-2.5 last:border-b-0"
          >
            <LevelBadge level={problem.level} className="hidden sm:inline-block" />
            <span className="font-mono text-[12.5px] font-medium text-gray-900">{problem.event}</span>
            <span className="text-[12.5px] font-bold text-gray-900">×{problem.count}</span>
            <span className="flex-1 text-xs text-gray-500">last seen {timeAgo(problem.last_seen)}</span>
            <button
              type="button"
              onClick={() => onViewEvent(problem.event)}
              className="text-[12.5px] font-semibold text-primary-600 hover:text-primary-800"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => onResolveEvent(problem.event)}
              className="rounded-[10px] border border-earth-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600"
            >
              Resolve all
            </button>
          </div>
        ))}
      </section>
    </>
  );
}

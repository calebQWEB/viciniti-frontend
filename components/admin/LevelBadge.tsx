import { LEVEL_STYLES } from "@/lib/adminLogs";
import type { LogLevel } from "@/types/app_log";

export default function LevelBadge({ level, className = "" }: { level: LogLevel; className?: string }) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.error;
  return (
    <span
      className={`inline-block min-w-14.5 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${style.badge} ${className}`}
    >
      {style.label}
    </span>
  );
}

import Link from "next/link";
import LevelBadge from "@/components/admin/LevelBadge";
import { timeAgo } from "@/lib/adminLogs";
import type { LogListItem } from "@/types/app_log";

// Compact log rows for a card (order or user page); each opens the entry on the logs page
export default function LogEntryList({ logs, empty }: { logs: LogListItem[]; empty: string }) {
  if (logs.length === 0) return <p className="text-[12.5px] text-gray-500">{empty}</p>;
  return (
    <ul className="-mx-4">
      {logs.map((log) => (
        <li key={log.id} className="border-t border-earth-100 first:border-t-0">
          <Link href={`/admin/logs?status=all&entry=${log.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-earth-50">
            <LevelBadge level={log.level} />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-xs text-gray-900">{log.event}</span>
              <span className="block truncate text-[11.5px] text-gray-600">{log.message}</span>
            </span>
            <span className="whitespace-nowrap text-[11.5px] text-gray-500">{timeAgo(log.created_at)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

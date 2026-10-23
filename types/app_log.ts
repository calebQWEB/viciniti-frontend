export type LogLevel = "info" | "warning" | "error" | "critical";
export type LogStatus = "open" | "resolved" | "all";

// The user a log entry involves, or the admin who resolved it
export interface LogUser {
  id: string;
  name: string;
  email: string;
}

// One row of GET /admin/logs (no traceback or details, to keep pages light)
export interface LogListItem {
  id: string;
  created_at: string;
  level: LogLevel;
  category: string;
  event: string;
  message: string;
  user: LogUser | null;
  request_method: string | null;
  request_path: string | null;
  status_code: number | null;
  error_ref: string | null;
  alert_sent: boolean;
  resolved_at: string | null;
}

// GET /admin/logs/{id}
export interface LogDetail extends LogListItem {
  details: Record<string, unknown> | null;
  traceback: string | null;
  resolver: LogUser | null;
  resolution_note: string | null;
}

export interface PaginatedLogs {
  items: LogListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type LevelCounts = Record<LogLevel, number>;

export interface RecurringProblem {
  event: string;
  level: LogLevel;
  count: number;
  last_seen: string;
}

// GET /admin/logs/summary
export interface LogSummary {
  open: LevelCounts;
  last_24h: LevelCounts;
  last_7d: LevelCounts;
  top_problems: RecurringProblem[];
}

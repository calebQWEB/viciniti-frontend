import { formatDistanceToNowStrict } from "date-fns";
import api from "@/lib/api";
import type {
  LogDetail,
  LogLevel,
  LogStatus,
  LogSummary,
  PaginatedLogs,
} from "@/types/app_log";

export const LOGS_PAGE_SIZE = 25;

export const LOG_LEVELS: LogLevel[] = ["critical", "error", "warning", "info"];

// Mirrors LOG_CATEGORIES in the backend's app/models/app_log.py
export const LOG_CATEGORIES = [
  "auth", "listing", "order", "payment", "payout", "webhook",
  "chargeback", "booking", "email", "scheduler", "request", "admin",
];

export const LEVEL_STYLES: Record<LogLevel, { label: string; badge: string; text: string }> = {
  critical: { label: "Critical", badge: "bg-red-100 text-red-700", text: "text-red-700" },
  error: { label: "Error", badge: "bg-orange-100 text-orange-800", text: "text-orange-800" },
  warning: { label: "Warning", badge: "bg-amber-100 text-amber-800", text: "text-amber-800" },
  info: { label: "Info", badge: "bg-gray-100 text-gray-600", text: "text-gray-600" },
};

// ---------- Filters, kept in the URL so a view survives refresh and can be bookmarked ----------

export interface LogFilters {
  status: LogStatus;
  levels: LogLevel[];
  category: string;
  event: string;
  // yyyy-mm-dd, inclusive
  from: string;
  to: string;
  search: string;
  page: number;
}

export const DEFAULT_LOG_FILTERS: LogFilters = {
  status: "open",
  levels: [],
  category: "",
  event: "",
  from: "",
  to: "",
  search: "",
  page: 1,
};

const STATUSES: LogStatus[] = ["open", "resolved", "all"];

export const filtersFromParams = (params: URLSearchParams): LogFilters => {
  const status = params.get("status") as LogStatus;
  const page = Number(params.get("page"));
  return {
    status: STATUSES.includes(status) ? status : DEFAULT_LOG_FILTERS.status,
    levels: (params.get("level") ?? "")
      .split(",")
      .filter((level): level is LogLevel => LOG_LEVELS.includes(level as LogLevel)),
    category: params.get("category") ?? "",
    event: params.get("event") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    search: params.get("search") ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
};

// Query string for the page URL; defaults are left out to keep links short
export const filtersToQuery = (filters: LogFilters, entryId?: string | null): string => {
  const params = new URLSearchParams();
  if (filters.status !== DEFAULT_LOG_FILTERS.status) params.set("status", filters.status);
  if (filters.levels.length) params.set("level", filters.levels.join(","));
  if (filters.category) params.set("category", filters.category);
  if (filters.event) params.set("event", filters.event);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (entryId) params.set("entry", entryId);
  return params.toString();
};

export const hasActiveFilters = (filters: LogFilters): boolean =>
  filtersToQuery({ ...filters, status: DEFAULT_LOG_FILTERS.status, page: 1 }) !== "";

// ---------- API ----------

// FastAPI reads a list as repeated keys (level=a&level=b), not axios's default level[]=a
const listParams = { paramsSerializer: { indexes: null } };

export const fetchLogs = async (filters: LogFilters): Promise<PaginatedLogs> => {
  const response = await api.get("/admin/logs", {
    ...listParams,
    params: {
      status: filters.status,
      level: filters.levels.length ? filters.levels : undefined,
      category: filters.category || undefined,
      event: filters.event || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: LOGS_PAGE_SIZE,
    },
  });
  return response.data;
};

// How many open entries share an event (for "Resolve all N")
export const fetchOpenCountForEvent = async (event: string): Promise<number> => {
  const response = await api.get("/admin/logs", {
    params: { status: "open", event, limit: 1 },
  });
  return response.data.total;
};

export const fetchLogSummary = async (): Promise<LogSummary> =>
  (await api.get("/admin/logs/summary")).data;

export const fetchLog = async (id: string): Promise<LogDetail> =>
  (await api.get(`/admin/logs/${id}`)).data;

export const resolveLog = async (id: string, note?: string): Promise<LogDetail> =>
  (await api.post(`/admin/logs/${id}/resolve`, { note: note?.trim() || null })).data;

export const reopenLog = async (id: string): Promise<LogDetail> =>
  (await api.post(`/admin/logs/${id}/reopen`)).data;

export const bulkResolveLogs = async (
  target: { ids: string[] } | { event: string },
  note?: string,
): Promise<number> =>
  (await api.post("/admin/logs/resolve-bulk", { ...target, note: note?.trim() || null })).data.resolved;

// ---------- Dates ----------

// The API sends UTC times without a zone ("2026-10-23T11:21:45"); without the Z they'd read as local time
export const parseApiDate = (value: string): Date =>
  new Date(/(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`);

export const timeAgo = (value: string): string => {
  const date = parseApiDate(value);
  if (Date.now() - date.getTime() < 60_000) return "Just now";
  return formatDistanceToNowStrict(date, { addSuffix: true });
};

export const formatLogTime = (value: string): string =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(
    parseApiDate(value),
  );

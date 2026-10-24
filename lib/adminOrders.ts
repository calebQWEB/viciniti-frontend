import api from "@/lib/api";
import type {
  AdminOrderDetail,
  AdminOverview,
  OrderQueueName,
  OrderQueues,
  PaginatedAdminOrders,
  PayoutAttemptResult,
  RetryAllResult,
} from "@/types/admin";

export const ORDERS_PAGE_SIZE = 25;

export const QUEUES: { name: OrderQueueName; label: string; empty: string }[] = [
  { name: "failing_payouts", label: "Failing payouts", empty: "No payouts are failing." },
  { name: "blocked_payouts", label: "Blocked payouts", empty: "No sellers are missing a bank account." },
  { name: "held_payouts", label: "Held: seller suspended", empty: "No payouts are on hold." },
  { name: "refunds", label: "Refunds owed", empty: "No buyers are owed a refund." },
  { name: "disputes", label: "Open disputes", empty: "No open disputes." },
];

export const ORDER_STATUSES = ["pending", "paid", "fulfilled", "completed", "cancelled", "disputed", "refunded"];

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-50 text-blue-800",
  fulfilled: "bg-indigo-50 text-indigo-800",
  completed: "bg-primary-50 text-primary-700",
  cancelled: "bg-gray-100 text-gray-600",
  disputed: "bg-red-100 text-red-700",
  refunded: "bg-amber-100 text-amber-800",
};

// "#3F9C2D1E" style short order number, as the rest of the app shows it
export const shortOrderId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

export const fetchOverview = async (): Promise<AdminOverview> => (await api.get("/admin/overview")).data;

export const fetchOrderQueues = async (): Promise<OrderQueues> => (await api.get("/admin/orders/queues")).data;

export const fetchAdminOrders = async (params: {
  page: number;
  search?: string;
  status?: string;
}): Promise<PaginatedAdminOrders> =>
  (
    await api.get("/admin/orders", {
      params: {
        page: params.page,
        limit: ORDERS_PAGE_SIZE,
        search: params.search || undefined,
        status: params.status || undefined,
      },
    })
  ).data;

export const fetchAdminOrder = async (id: string): Promise<AdminOrderDetail> =>
  (await api.get(`/admin/orders/${id}`)).data;

export const retryPayout = async (id: string): Promise<PayoutAttemptResult> =>
  (await api.post(`/admin/orders/${id}/retry-payout`)).data;

export const retryAllPayouts = async (): Promise<RetryAllResult> =>
  (await api.post("/admin/orders/retry-payouts")).data;

export const markRefunded = async (id: string, reference: string, note: string): Promise<AdminOrderDetail> =>
  (
    await api.post(`/admin/orders/${id}/mark-refunded`, {
      reference: reference.trim() || null,
      note: note.trim() || null,
    })
  ).data;

// Compact naira for tiles and chart ticks: ₦950, ₦12.5K, ₦8.8M
export const formatNairaCompact = (value: number): string =>
  `₦${new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

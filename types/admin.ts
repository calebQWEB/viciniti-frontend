import type { LogListItem, LogUser } from "@/types/app_log";

export type OrderQueueName = "failing_payouts" | "blocked_payouts" | "refunds" | "disputes";

export interface MoneyTotals {
  // Value of orders where the buyer's money was taken
  sales: number;
  // Fees on completed orders
  fees: number;
  payouts_sent: number;
}

// GET /admin/overview
export interface AdminOverview {
  users_total: number;
  users_new_7d: number;
  listings_active: number;
  services_active: number;
  orders_by_status: Record<string, number>;
  last_30d: MoneyTotals;
  all_time: MoneyTotals;
  // Owed to sellers for completed orders, not yet paid out
  payouts_owed: number;
  attention: Record<OrderQueueName | "critical_logs", number>;
  daily: { day: string; orders: number; value: number }[];
}

export interface AdminOrderItem {
  id: string;
  created_at: string;
  status: string;
  amount: number;
  fee: number;
  payout_amount: number;
  item_title: string;
  item_type: "listing" | "service";
  buyer: LogUser;
  seller: LogUser;
  payout_due_at: string | null;
  payout_completed_at: string | null;
  payout_attempts: number;
  payout_last_attempt_at: string | null;
  payout_last_error: string | null;
  // The last attempt crashed part-way: the transfer may have gone out without being recorded
  payout_last_attempt_crashed: boolean;
  refunded_at: string | null;
  payment_reference: string | null;
  dispute_reason: string | null;
  dispute_filed_at: string | null;
}

export interface PaginatedAdminOrders {
  items: AdminOrderItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type OrderQueues = Record<OrderQueueName, AdminOrderItem[]> & {
  counts: Record<OrderQueueName, number>;
};

export interface TimelineStep {
  label: string;
  at: string | null;
  detail: string | null;
  tone: "done" | "upcoming" | "problem";
}

export interface OrderTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  fee: number;
  created_at: string | null;
  chargeback_reason: string | null;
  chargeback_filed_at: string | null;
  chargeback_resolved_at: string | null;
}

// GET /admin/orders/{id}
export interface AdminOrderDetail extends AdminOrderItem {
  item_id: string | null;
  seller_bank: { bank_name: string; account_name: string; account_last4: string } | null;
  completion_photos: string[];
  completion_notes: string | null;
  completed_at: string | null;
  buyer_accepted_at: string | null;
  refund_reference: string | null;
  refund_note: string | null;
  refunded_by: LogUser | null;
  transactions: OrderTransaction[];
  timeline: TimelineStep[];
  logs: LogListItem[];
  can_retry_payout: boolean;
  can_mark_refunded: boolean;
}

export interface PayoutAttemptResult {
  order_id: string;
  ok: boolean;
  // sent | busy | not_found | not_payable | already_paid | no_bank | rejected | crashed
  outcome: string;
  message: string;
}

export interface RetryAllResult {
  attempted: number;
  sent: number;
  results: PayoutAttemptResult[];
}

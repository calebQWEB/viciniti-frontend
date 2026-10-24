import type { LogListItem, LogUser } from "@/types/app_log";

export type OrderQueueName = "failing_payouts" | "blocked_payouts" | "held_payouts" | "refunds" | "disputes";

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

// ---------- Users ----------

export type UserFilter = "all" | "suspended" | "admins" | "new";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  location: string | null;
  intent: string | null;
  created_at: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  listings_count: number;
  services_count: number;
  orders_count: number;
}

export interface PaginatedAdminUsers {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrderSideTotals {
  count: number;
  // Value of orders where the money was taken
  value: number;
}

// GET /admin/users/{id}
export interface AdminUserDetail extends AdminUserItem {
  onboarded_at: string | null;
  // Shown to the user
  suspension_reason: string | null;
  // Admins only
  suspension_note: string | null;
  suspended_by: LogUser | null;
  bank: { bank_name: string; account_name: string; account_last4: string } | null;
  listings_by_status: Record<string, number>;
  services_by_status: Record<string, number>;
  as_buyer: OrderSideTotals;
  as_seller: OrderSideTotals;
  disputes: number;
  rating_average: number | null;
  rating_count: number;
  recent_orders: AdminOrderItem[];
  logs: LogListItem[];
}

// ---------- Listings & services ----------

export type ListingKind = "item" | "service";

export interface AdminListingItem {
  id: string;
  kind: ListingKind;
  title: string;
  price: number;
  // The seller's own status: active/sold for items, active/inactive for services
  status: string;
  thumbnail: string | null;
  location: string | null;
  category: { id: string; name: string; slug: string } | null;
  seller: LogUser;
  seller_suspended: boolean;
  created_at: string | null;
  removed_at: string | null;
  removal_reason: string | null;
}

export interface PaginatedAdminListings {
  items: AdminListingItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// GET /admin/listings/{kind}/{id}
export interface AdminListingDetail extends AdminListingItem {
  description: string;
  images: string[];
  removed_by: LogUser | null;
  // Orders for an item; bookings for a service
  orders_count: number;
}

// ---------- Categories ----------

export interface AdminCategory {
  id: string;
  name: string;
  // Fixed once created, so links like /browse/items?category=<slug> keep working
  slug: string;
  type: ListingKind;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  usage_count: number;
}

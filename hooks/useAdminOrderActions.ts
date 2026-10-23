import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorDetail } from "@/lib/auth";
import { markRefunded, retryAllPayouts, retryPayout, shortOrderId } from "@/lib/adminOrders";
import type { AdminOrderItem, PayoutAttemptResult, RetryAllResult } from "@/types/admin";

// Everything that shows orders, money or logs can change after an admin action
const AFFECTED_QUERIES = [
  "admin-order-queues", "admin-orders", "admin-order", "admin-overview", "admin-logs", "admin-logs-summary",
];

export const CRASHED_RETRY_WARNING =
  "The last attempt crashed part-way, so the money may already have left. " +
  "Check the Flutterwave dashboard for a transfer to this seller first.\n\nRetry anyway?";

// Retry payout, Retry all and Mark refunded, shared by the queue page and the order page
export function useAdminOrderActions() {
  const queryClient = useQueryClient();
  const refreshAll = () =>
    AFFECTED_QUERIES.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

  // Latest retry outcome per order, so it stays visible after the queue refreshes
  const [results, setResults] = useState<Record<string, PayoutAttemptResult>>({});
  const [retryAllResult, setRetryAllResult] = useState<RetryAllResult | null>(null);

  const retry = useMutation({
    mutationFn: (order: AdminOrderItem) => retryPayout(order.id),
    onSuccess: (result) => {
      setResults((prev) => ({ ...prev, [result.order_id]: result }));
      refreshAll();
    },
    onError: (err, order) =>
      setResults((prev) => ({
        ...prev,
        [order.id]: { order_id: order.id, ok: false, outcome: "error", message: apiErrorDetail(err) ?? "Couldn't retry. Try again." },
      })),
  });

  const retryOne = (order: AdminOrderItem) => {
    if (order.payout_last_attempt_crashed && !window.confirm(CRASHED_RETRY_WARNING)) return;
    retry.mutate(order);
  };

  const retryAll = useMutation({
    mutationFn: retryAllPayouts,
    onSuccess: (result) => {
      setRetryAllResult(result);
      refreshAll();
    },
  });

  const refund = useMutation({
    mutationFn: ({ id, reference, note }: { id: string; reference: string; note: string }) =>
      markRefunded(id, reference, note),
    onSuccess: refreshAll,
  });

  return {
    results,
    retryOne,
    retryingId: retry.isPending ? retry.variables?.id : undefined,
    retryAll,
    retryAllResult,
    refund,
    refundError: refund.isError ? (apiErrorDetail(refund.error) ?? "Couldn't save. Try again.") : null,
    describe: (result: PayoutAttemptResult) =>
      `${shortOrderId(result.order_id)}: ${result.ok ? "sent" : "not sent"}, ${result.message}`,
  };
}

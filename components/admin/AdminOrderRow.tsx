import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { timeAgo } from "@/lib/adminLogs";
import { ORDER_STATUS_STYLES, shortOrderId } from "@/lib/adminOrders";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderItem, OrderQueueName, PayoutAttemptResult } from "@/types/admin";

interface Props {
  order: AdminOrderItem;
  // Which queue it's shown in; undefined in the All orders search
  queue?: OrderQueueName;
  retryResult?: PayoutAttemptResult;
  isRetrying?: boolean;
  onRetry?: (order: AdminOrderItem) => void;
  onRefund?: (order: AdminOrderItem) => void;
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

// The queue-specific line under the order: why it's in this queue
function QueueReason({ order, queue }: { order: AdminOrderItem; queue?: OrderQueueName }) {
  if (queue === "failing_payouts") {
    return (
      <p className={`text-xs ${order.payout_last_attempt_crashed ? "text-red-700" : "text-gray-600"}`}>
        {order.payout_due_at && <>Due {timeAgo(order.payout_due_at)} · </>}
        {order.payout_attempts > 0
          ? <>{order.payout_attempts} attempt{order.payout_attempts === 1 ? "" : "s"}: {order.payout_last_error}</>
          : "Not attempted yet"}
      </p>
    );
  }
  if (queue === "blocked_payouts") {
    return (
      <p className="text-xs text-gray-600">
        {order.seller.name} ({order.seller.email}) needs to add a bank account
      </p>
    );
  }
  if (queue === "refunds") {
    return (
      <p className="text-xs text-gray-600">
        Paid after the order closed{order.payment_reference && <> · {order.payment_reference}</>}
      </p>
    );
  }
  if (queue === "disputes") {
    return (
      <p className="text-xs text-gray-600">
        {order.dispute_reason ?? "Chargeback filed"}
        {order.dispute_filed_at && <> · filed {timeAgo(order.dispute_filed_at)}</>}
      </p>
    );
  }
  return null;
}

export default function AdminOrderRow({ order, queue, retryResult, isRetrying, onRetry, onRefund }: Props) {
  const showsPayout = queue === "failing_payouts" || queue === "blocked_payouts";

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-earth-100 px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-medium text-primary-700 hover:underline">
            {shortOrderId(order.id)}
          </Link>
          <span className="truncate text-[13px] font-medium text-gray-900">{order.item_title}</span>
          {!queue && <OrderStatusBadge status={order.status} />}
        </div>
        <p className="text-[11.5px] text-gray-500">
          {order.seller.name} → {order.buyer.name} · {timeAgo(order.created_at)}
        </p>
        <QueueReason order={order} queue={queue} />
        {order.payout_last_attempt_crashed && queue === "failing_payouts" && (
          <p className="flex items-center gap-1 text-[11.5px] font-medium text-red-700">
            <CircleAlert className="h-3.5 w-3.5" />
            Last attempt crashed: check Flutterwave before retrying
          </p>
        )}
        {retryResult && (
          <p className={`text-xs font-medium ${retryResult.ok ? "text-primary-700" : "text-red-700"}`}>
            {retryResult.ok ? `Sent: ${retryResult.message}` : `Not sent: ${retryResult.message}`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[13px] font-semibold text-gray-900">
            {formatPrice(showsPayout ? order.payout_amount : order.amount)}
          </div>
          <div className="text-[11px] text-gray-500">{showsPayout ? "to seller" : "paid by buyer"}</div>
        </div>
        {queue === "failing_payouts" && onRetry && !retryResult?.ok && (
          <button
            type="button"
            onClick={() => onRetry(order)}
            disabled={isRetrying}
            className="h-9 rounded-[10px] border border-earth-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600 disabled:opacity-60"
          >
            {isRetrying ? "Sending…" : "Retry payout"}
          </button>
        )}
        {queue === "refunds" && onRefund && (
          <button
            type="button"
            onClick={() => onRefund(order)}
            className="h-9 rounded-[10px] border border-earth-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600"
          >
            Mark refunded
          </button>
        )}
      </div>
    </li>
  );
}

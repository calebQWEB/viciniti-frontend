"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, ExternalLink } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/AdminOrderRow";
import Card from "@/components/admin/AdminCard";
import LogEntryList from "@/components/admin/LogEntryList";
import RefundDialog from "@/components/admin/RefundDialog";
import { useAdminOrderActions } from "@/hooks/useAdminOrderActions";
import { formatLogTime, timeAgo } from "@/lib/adminLogs";
import { fetchAdminOrder, shortOrderId } from "@/lib/adminOrders";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderDetail, TimelineStep } from "@/types/admin";
import type { LogUser } from "@/types/app_log";

const TONE_DOT: Record<TimelineStep["tone"], string> = {
  done: "bg-primary-500 border-primary-500",
  upcoming: "bg-white border-gray-300",
  problem: "bg-red-500 border-red-500",
};

function Person({ label, person, children }: { label: string; person: LogUser; children?: React.ReactNode }) {
  return (
    <Card title={label}>
      <p className="text-[13px] font-medium text-gray-900">{person.name}</p>
      <p className="break-all text-xs text-gray-500">{person.email}</p>
      {children}
    </Card>
  );
}

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative ml-1.5 border-l border-earth-200">
      {steps.map((step, i) => (
        <li key={`${step.label}-${i}`} className="relative pb-3.5 pl-5 last:pb-0">
          <span className={`absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 ${TONE_DOT[step.tone]}`} aria-hidden="true" />
          <p className={`text-[13px] font-medium ${step.tone === "problem" ? "text-red-700" : step.tone === "upcoming" ? "text-gray-500" : "text-gray-900"}`}>
            {step.label}
            {step.tone === "problem" && <span className="sr-only"> (needs attention)</span>}
          </p>
          {step.at && <p className="text-[11.5px] text-gray-500">{formatLogTime(step.at)}</p>}
          {step.detail && <p className="break-words text-xs text-gray-600">{step.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

function OrderBody({ order }: { order: AdminOrderDetail }) {
  const actions = useAdminOrderActions();
  const [isRefunding, setIsRefunding] = useState(false);
  const result = actions.results[order.id];
  const itemHref = order.item_id ? `/${order.item_type === "listing" ? "item" : "service"}/${order.item_id}` : null;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-lg font-semibold text-gray-900">Order {shortOrderId(order.id)}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-[13px] text-gray-700">
            {itemHref ? (
              <Link href={itemHref} className="inline-flex items-center gap-1 hover:text-primary-600">
                {order.item_title} <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              order.item_title
            )}
            <span className="text-gray-500"> · {order.item_type} · placed {formatLogTime(order.created_at)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.can_retry_payout && !result?.ok && (
            <button
              type="button"
              onClick={() => actions.retryOne(order)}
              disabled={actions.retryingId === order.id}
              className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {actions.retryingId === order.id ? "Sending…" : "Retry payout"}
            </button>
          )}
          {order.can_mark_refunded && (
            <button
              type="button"
              onClick={() => setIsRefunding(true)}
              className="h-10 rounded-xl border border-earth-200 bg-white px-4 text-[13px] font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600"
            >
              Mark refunded
            </button>
          )}
        </div>
      </div>

      {order.payout_last_attempt_crashed && !order.payout_completed_at && (
        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          The last payout attempt crashed part-way, so the money may already have left. Check the Flutterwave dashboard
          for a transfer to this seller before retrying.
        </p>
      )}
      {result && (
        <p
          role="status"
          className={`rounded-xl px-3.5 py-2.5 text-[12.5px] font-medium ${
            result.ok ? "bg-primary-50 text-primary-700" : "bg-red-50 text-red-700"
          }`}
        >
          {result.ok ? `Payout sent: ${result.message}` : `Payout not sent: ${result.message}`}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Timeline">
            <Timeline steps={order.timeline} />
          </Card>

          <Card title="Money">
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-y-1.5 text-[12.5px]">
              <dt className="text-gray-600">Paid by buyer</dt>
              <dd className="text-right font-semibold text-gray-900">{formatPrice(order.amount)}</dd>
              <dt className="text-gray-600">Platform fee</dt>
              <dd className="text-right text-gray-900">−{formatPrice(order.fee)}</dd>
              <dt className="border-t border-earth-100 pt-1.5 text-gray-600">Seller receives</dt>
              <dd className="border-t border-earth-100 pt-1.5 text-right font-semibold text-gray-900">
                {formatPrice(order.payout_amount)}
              </dd>
            </dl>
            {order.payout_attempts > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {order.payout_attempts} payout attempt{order.payout_attempts === 1 ? "" : "s"}
                {order.payout_last_attempt_at && <>, last {timeAgo(order.payout_last_attempt_at)}</>}
              </p>
            )}
          </Card>

          {(order.completion_photos.length > 0 || order.completion_notes) && (
            <Card title="Completion evidence">
              {order.completion_notes && <p className="whitespace-pre-line text-[12.5px] text-gray-700">{order.completion_notes}</p>}
              {order.completion_photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.completion_photos.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-earth-200">
                      <Image src={url} alt="Completion photo" width={96} height={96} className="h-24 w-24 object-cover" unoptimized />
                    </a>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card title="Transactions">
            {order.transactions.length === 0 ? (
              <p className="text-[12.5px] text-gray-500">No payment was started for this order.</p>
            ) : (
              <div className="-mx-4 overflow-x-auto">
                <table className="w-full min-w-120 text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold tracking-wide text-gray-500">
                      <th scope="col" className="px-4 pb-2">REFERENCE</th>
                      <th scope="col" className="px-2 pb-2">TYPE</th>
                      <th scope="col" className="px-2 pb-2">STATUS</th>
                      <th scope="col" className="px-2 pb-2 text-right">AMOUNT</th>
                      <th scope="col" className="px-4 pb-2 text-right">WHEN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.transactions.map((t) => (
                      <tr key={t.id} className="border-t border-earth-100">
                        <td className="px-4 py-2 font-mono text-[11.5px] text-gray-900">{t.reference}</td>
                        <td className="px-2 py-2 capitalize text-gray-700">{t.type}</td>
                        <td className="px-2 py-2 text-gray-700">{t.status.replaceAll("_", " ")}</td>
                        <td className="px-2 py-2 text-right text-gray-900">{formatPrice(t.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-right text-gray-500">
                          {t.created_at ? timeAgo(t.created_at) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Log entries">
            <LogEntryList logs={order.logs} empty="Nothing logged for this order." />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Person label="Buyer" person={order.buyer} />
          <Person label="Seller" person={order.seller}>
            <div className="mt-2.5 rounded-xl bg-earth-50 px-3 py-2 text-xs">
              {order.seller_bank ? (
                <>
                  <p className="font-medium text-gray-900">{order.seller_bank.bank_name}</p>
                  <p className="text-gray-600">
                    {order.seller_bank.account_name} · ****{order.seller_bank.account_last4}
                  </p>
                </>
              ) : (
                <p className="font-medium text-red-700">No bank account on file</p>
              )}
            </div>
          </Person>
          {order.refunded_at && (
            <Card title="Refund">
              <p className="text-[12.5px] text-gray-900">
                {formatPrice(order.amount)} refunded {formatLogTime(order.refunded_at)}
                {order.refunded_by && <> by {order.refunded_by.name}</>}
              </p>
              {order.refund_reference && <p className="mt-1 font-mono text-[11.5px] text-gray-700">{order.refund_reference}</p>}
              {order.refund_note && <p className="mt-1 whitespace-pre-line text-xs text-gray-600">{order.refund_note}</p>}
            </Card>
          )}
        </div>
      </div>

      {isRefunding && (
        <RefundDialog
          orderId={order.id}
          amount={order.amount}
          buyerName={order.buyer.name}
          isPending={actions.refund.isPending}
          error={actions.refundError}
          onConfirm={(reference, note) =>
            actions.refund.mutate({ id: order.id, reference, note }, { onSuccess: () => setIsRefunding(false) })
          }
          onCancel={() => {
            setIsRefunding(false);
            actions.refund.reset();
          }}
        />
      )}
    </>
  );
}

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isError } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => fetchAdminOrder(id),
  });

  return (
    <main className="flex flex-col gap-4 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <Link href="/admin/orders" className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Orders &amp; money
      </Link>
      {isError ? (
        <p className="py-10 text-center text-[13px] text-red-600">Couldn&apos;t load this order. It may not exist.</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <OrderBody order={data} />
      )}
    </main>
  );
}

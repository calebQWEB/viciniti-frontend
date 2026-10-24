"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminOrderRow from "@/components/admin/AdminOrderRow";
import LogEntryList from "@/components/admin/LogEntryList";
import SuspendDialog from "@/components/admin/SuspendDialog";
import UserBadges from "@/components/admin/UserBadges";
import { apiErrorDetail } from "@/lib/auth";
import { formatLogTime } from "@/lib/adminLogs";
import { fetchAdminUser, suspendUser, unsuspendUser } from "@/lib/adminUsers";
import { formatPrice, getInitials } from "@/lib/utils";
import type { AdminUserDetail } from "@/types/admin";

const statusLine = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([status, count]) => `${count} ${status}`)
    .join(" · ");

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-earth-50 px-3 py-2.5">
      <span className="text-[11.5px] text-gray-500">{label}</span>
      <span className="text-[17px] font-bold leading-tight text-gray-900">{value}</span>
      {sub && <span className="text-[11px] text-gray-500">{sub}</span>}
    </div>
  );
}

function UserBody({ user }: { user: AdminUserDetail }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<"suspend" | "unsuspend" | null>(null);

  const action = useMutation({
    mutationFn: (values: { reason: string; note: string; notify: boolean }) =>
      dialog === "suspend" ? suspendUser(user.id, values) : unsuspendUser(user.id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-user", user.id], updated);
      ["admin-users", "admin-overview", "admin-order-queues", "admin-logs"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
      setDialog(null);
    },
  });
  const closeDialog = () => {
    setDialog(null);
    action.reset();
  };
  const canSuspend = !user.is_admin;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <UserBadges user={user} />
            </div>
            <p className="break-all text-[12.5px] text-gray-600">{user.email}</p>
            <p className="text-[11.5px] text-gray-500">
              {user.location ?? "No area set"}
              {user.intent && <> · here to {user.intent === "both" ? "buy and sell" : user.intent}</>}
              {user.created_at && <> · joined {formatLogTime(user.created_at)}</>}
              {!user.onboarded_at && <> · hasn&apos;t finished onboarding</>}
            </p>
          </div>
        </div>
        {canSuspend &&
          (user.is_suspended ? (
            <button
              type="button"
              onClick={() => setDialog("unsuspend")}
              className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700"
            >
              Lift suspension
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDialog("suspend")}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 text-[13px] font-semibold text-red-700 hover:bg-red-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Suspend
            </button>
          ))}
      </div>

      {user.is_suspended && (
        <section aria-label="Suspension" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-900">
          <p className="font-semibold">
            Suspended{user.suspended_at && <> {formatLogTime(user.suspended_at)}</>}
            {user.suspended_by && <> by {user.suspended_by.name}</>}
          </p>
          <p className="mt-1">
            <span className="text-red-800">Reason (the user sees this):</span> {user.suspension_reason}
          </p>
          {user.suspension_note && (
            <p className="mt-1 whitespace-pre-line">
              <span className="text-red-800">Internal note:</span> {user.suspension_note}
            </p>
          )}
        </section>
      )}

      <section aria-label="Activity" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Stat label="As a buyer" value={formatPrice(user.as_buyer.value)} sub={`${user.as_buyer.count} orders`} />
        <Stat label="As a seller" value={formatPrice(user.as_seller.value)} sub={`${user.as_seller.count} orders`} />
        <Stat
          label="Rating"
          value={user.rating_average !== null ? `${user.rating_average.toFixed(1)} / 5` : "—"}
          sub={`${user.rating_count} review${user.rating_count === 1 ? "" : "s"}`}
        />
        <Stat label="Disputes" value={String(user.disputes)} sub="as buyer or seller" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="user-orders" className="overflow-hidden rounded-2xl border border-earth-200 bg-white">
            <h2 id="user-orders" className="border-b border-earth-100 px-4 py-3 text-[13.5px] font-semibold text-gray-900">
              Recent orders
            </h2>
            {user.recent_orders.length === 0 ? (
              <p className="px-4 py-3 text-[12.5px] text-gray-500">No orders yet.</p>
            ) : (
              <ul>
                {user.recent_orders.map((order) => (
                  <AdminOrderRow key={order.id} order={order} />
                ))}
              </ul>
            )}
          </section>

          <AdminCard title="Recent log entries">
            <LogEntryList logs={user.logs} empty="Nothing logged for this user." />
          </AdminCard>
        </div>

        <div className="flex flex-col gap-4">
          <AdminCard title="Selling">
            <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-y-1.5 text-[12.5px]">
              <dt className="text-gray-500">Listings</dt>
              <dd className="text-gray-900">{statusLine(user.listings_by_status)}</dd>
              <dt className="text-gray-500">Services</dt>
              <dd className="text-gray-900">{statusLine(user.services_by_status)}</dd>
            </dl>
            {user.listings_count + user.services_count > 0 && (
              <Link
                href={`/admin/listings?${user.listings_count === 0 ? "kind=service&" : ""}seller=${user.id}`}
                className="mt-2 inline-block text-xs font-medium text-primary-600 hover:underline"
              >
                View their listings
              </Link>
            )}
          </AdminCard>
          <AdminCard title="Payout account">
            {user.bank ? (
              <p className="text-[12.5px] text-gray-900">
                {user.bank.bank_name}
                <br />
                <span className="text-gray-600">
                  {user.bank.account_name} · ****{user.bank.account_last4}
                </span>
              </p>
            ) : (
              <p className="text-[12.5px] text-gray-500">No bank account on file.</p>
            )}
          </AdminCard>
        </div>
      </div>

      {dialog && (
        <SuspendDialog
          mode={dialog}
          userName={user.name}
          isPending={action.isPending}
          error={action.isError ? (apiErrorDetail(action.error) ?? "Couldn't save. Try again.") : null}
          onConfirm={(values) => action.mutate(values)}
          onCancel={closeDialog}
        />
      )}
    </>
  );
}

export default function AdminUserPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isError } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => fetchAdminUser(id),
  });

  return (
    <main className="flex flex-col gap-4 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <Link href="/admin/users" className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Users
      </Link>
      {isError ? (
        <p className="py-10 text-center text-[13px] text-red-600">Couldn&apos;t load this user. They may not exist.</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <UserBody user={data} />
      )}
    </main>
  );
}

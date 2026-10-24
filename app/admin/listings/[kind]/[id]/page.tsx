"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, EyeOff, ImageOff } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import ListingStatusBadge from "@/components/admin/ListingStatusBadge";
import RemoveListingDialog from "@/components/admin/RemoveListingDialog";
import { apiErrorDetail } from "@/lib/auth";
import { formatLogTime } from "@/lib/adminLogs";
import { KIND_LABELS, fetchAdminListing, publicHref, removeListing, restoreListing } from "@/lib/adminListings";
import { formatPrice } from "@/lib/utils";
import type { AdminListingDetail, ListingKind } from "@/types/admin";

function ListingBody({ item }: { item: AdminListingDetail }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<"remove" | "restore" | null>(null);
  const word = KIND_LABELS[item.kind].one;

  const action = useMutation({
    mutationFn: (values: { reason: string; notify: boolean }) =>
      dialog === "remove"
        ? removeListing(item.kind, item.id, values)
        : restoreListing(item.kind, item.id, { notify: values.notify }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-listing", item.kind, item.id], updated);
      ["admin-listings", "admin-logs", "admin-user"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setDialog(null);
    },
  });
  const closeDialog = () => {
    setDialog(null);
    action.reset();
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-lg font-bold text-gray-900">{item.title}</h1>
            <ListingStatusBadge item={item} />
          </div>
          <p className="text-[12.5px] text-gray-600">
            <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
            <span className="capitalize"> · {word}</span>
            {item.category && <> · {item.category.name}</>}
            {item.location && <> · {item.location}</>}
            {item.created_at && <> · posted {formatLogTime(item.created_at)}</>}
          </p>
          {!item.removed_at && !item.seller_suspended && (
            <Link
              href={publicHref(item.kind, item.id)}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800"
            >
              View public page <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        {item.removed_at ? (
          <button
            type="button"
            onClick={() => setDialog("restore")}
            className="h-10 rounded-xl bg-primary-600 px-4 text-[13px] font-semibold text-white hover:bg-primary-700"
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDialog("remove")}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 text-[13px] font-semibold text-red-700 hover:bg-red-50"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      {item.removed_at && (
        <section aria-label="Removal" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-900">
          <p className="font-semibold">
            Removed {formatLogTime(item.removed_at)}
            {item.removed_by && <> by {item.removed_by.name}</>}
          </p>
          <p className="mt-1">
            <span className="text-red-800">Reason (the seller sees this):</span> {item.removal_reason}
          </p>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <AdminCard title={`Photos (${item.images.length})`}>
            {item.images.length === 0 ? (
              <p className="flex items-center gap-2 text-[12.5px] text-gray-500">
                <ImageOff className="h-4 w-4" /> No photos.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {item.images.map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-earth-200">
                    <Image src={url} alt={`Photo ${i + 1} of ${item.title}`} width={200} height={200} className="aspect-square w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </AdminCard>
          <AdminCard title="Description">
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{item.description}</p>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-4">
          <AdminCard title="Seller">
            <Link href={`/admin/users/${item.seller.id}`} className="text-[13px] font-medium text-primary-700 hover:underline">
              {item.seller.name}
            </Link>
            <p className="break-all text-xs text-gray-500">{item.seller.email}</p>
            {item.seller_suspended && (
              <p className="mt-1.5 text-xs font-medium text-amber-800">Suspended, so this is hidden anyway.</p>
            )}
          </AdminCard>
          <AdminCard title={item.kind === "item" ? "Orders" : "Bookings"}>
            <p className="text-[13px] text-gray-900">
              {item.orders_count} {item.kind === "item" ? "order" : "booking"}
              {item.orders_count === 1 ? "" : "s"} so far
            </p>
            {item.kind === "item" && item.orders_count > 0 && (
              <Link href={`/admin/orders?queue=all&search=${encodeURIComponent(item.seller.email)}`} className="text-xs font-medium text-primary-600 hover:underline">
                See the seller&apos;s orders
              </Link>
            )}
          </AdminCard>
        </div>
      </div>

      {dialog && (
        <RemoveListingDialog
          mode={dialog}
          word={word}
          title={item.title}
          sellerName={item.seller.name}
          isPending={action.isPending}
          error={action.isError ? (apiErrorDetail(action.error) ?? "Couldn't save. Try again.") : null}
          onConfirm={(values) => action.mutate(values)}
          onCancel={closeDialog}
        />
      )}
    </>
  );
}

export default function AdminListingPage() {
  const params = useParams<{ kind: string; id: string }>();
  const kind: ListingKind = params.kind === "service" ? "service" : "item";
  const { data, isError } = useQuery({
    queryKey: ["admin-listing", kind, params.id],
    queryFn: () => fetchAdminListing(kind, params.id),
  });

  return (
    <main className="flex flex-col gap-4 px-4 pb-10 pt-5 sm:px-7 sm:pt-6">
      <Link
        href={kind === "service" ? "/admin/listings?kind=service" : "/admin/listings"}
        className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Listings
      </Link>
      {isError ? (
        <p className="py-10 text-center text-[13px] text-red-600">Couldn&apos;t load this {KIND_LABELS[kind].one}. It may have been deleted.</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <ListingBody item={data} />
      )}
    </main>
  );
}

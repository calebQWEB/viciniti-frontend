"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/types/order";
import MainLayout from "@/components/layout/MainLayout";
import PhotoUploader from "@/components/shared/PhotoUploader";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  ShieldCheck,
  ClipboardCheck,
  ChevronRight,
  PackageCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SuccessModal from "@/components/shared/SuccessModal";

export default function MarkCompletionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data as Order;
    },
  });

  const { mutate: markComplete, isPending } = useMutation({
    mutationFn: async () => {
      if (photos.length === 0) {
        throw new Error("Please upload at least one completion photo.");
      }

      if (!notes.trim()) {
        throw new Error("Please describe the work you completed.");
      }

      const response = await api.post(`/orders/${id}/complete`, {
        photos,
        notes: notes.trim(),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sales"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setError("");
      setShowSuccess(true);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          err.message ||
          "We couldn't submit your completion details. Please try again.",
      );
    },
  });

  const listingImage = order?.listing?.images?.[0]?.url;
  const canSubmit = photos.length > 0 && notes.trim().length > 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-[13px] font-medium text-slate-500">
            Loading your order...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (isError || !order) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] bg-slate-50 px-4 py-12">
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Unable to load order
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              We couldn't retrieve this order. It may not exist, or there may be
              a temporary connection issue.
            </p>
            <Link
              href="/dashboard/purchases"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to purchases
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/dashboard/purchases"
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition group-hover:border-slate-300 group-hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4" />
              </span>
              Back to purchases
            </Link>
          </div>

          {/* Page heading */}
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
              <ClipboardCheck className="h-3 w-3" />
              Order completion
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Mark as complete
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              You&apos;re almost there. Share proof of the completed work and
              provide a brief description so the buyer can review and confirm
              the delivery.
            </p>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Completion form */}
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setError("");
                  markComplete();
                }}
              >
                {/* Form header */}
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <PackageCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-[13px] font-bold text-slate-900">
                        Completion details
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Provide the details of your completed service.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-4 sm:p-6">
                  {/* Photos */}
                  <section>
                    <div className="mb-3 flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Camera className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-bold text-slate-900">
                            Completion photos
                          </h3>
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                            Required
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Show the result of your work with clear photos.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600">
                        {photos.length}/10
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                      <PhotoUploader
                        onPhotosChange={setPhotos}
                        maxPhotos={10}
                        photos={photos}
                      />
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <p>
                        Upload at least one photo, with up to 10 photos allowed.
                        Your evidence can help resolve disputes.
                      </p>
                    </div>
                  </section>

                  <div className="h-px bg-slate-100" />

                  {/* Work description */}
                  <section>
                    <div className="mb-3 flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-bold text-slate-900">
                            Description of work
                          </h3>
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                            Required
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Explain what you did and what was delivered.
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setError("");
                      }}
                      placeholder="Describe the work completed, any important details, and the final result..."
                      rows={5}
                      maxLength={500}
                      required
                      className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-slate-400">
                        Keep your description clear and specific.
                      </p>
                      <span
                        className={`shrink-0 text-[11px] font-medium tabular-nums ${
                          notes.length >= 450
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {notes.length}/500
                      </span>
                    </div>
                  </section>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">
                          Submission failed
                        </p>
                        <p className="mt-1 text-sm leading-5 text-red-700">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Link
                        href="/dashboard/purchases"
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        Cancel
                      </Link>

                      <button
                        type="submit"
                        disabled={isPending || !canSubmit}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting completion...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as complete
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                      Please ensure your details are accurate before submitting.
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Order sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-8">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-[13px] font-bold text-slate-900">
                    Order summary
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    The order you&apos;re completing
                  </p>
                </div>

                {/* Listing image */}
                <div className="p-4">
                  <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100">
                    {listingImage ? (
                      <Image
                        src={listingImage}
                        alt={order.listing?.title || "Listing image"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 340px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PackageCheck className="h-10 w-10 text-slate-300" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/70 bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                        <ClipboardCheck className="h-3 w-3 text-blue-600" />
                        Completion pending
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold leading-6 text-slate-900">
                    {order.listing?.title || "Service order"}
                  </h3>

                  <p className="mt-2 break-all text-[11px] font-medium text-slate-400">
                    ORDER ID: {order.id}
                  </p>

                  <div className="my-4 h-px bg-slate-100" />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500">
                        Order amount
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-slate-900">
                        ₦{order.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500">
                        Transaction fee
                      </span>
                      <span className="text-xs font-medium tabular-nums text-slate-600">
                        ₦{order.fee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900">
                    What happens next?
                  </h3>
                </div>

                <ol className="mt-4 space-y-3">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Submit your evidence
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Upload photos and describe your completed work.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Buyer confirms
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        The buyer is notified to review and confirm completion.
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      3
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Receive your payout
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Your payout follows the buyer&apos;s confirmation,
                        according to the platform&apos;s payout process.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <p className="px-2 text-center text-[11px] leading-5 text-slate-400">
                Keep your evidence relevant to the order and make sure it
                accurately represents the completed work.
              </p>
            </aside>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title="Order Marked Complete!"
          message="The buyer has been notified to confirm completion. You'll receive your payout once they confirm."
          buttonText="View My Sales"
          onClose={() => {
            setShowSuccess(false);
            router.push("/dashboard/purchases");
          }}
        />
      )}
    </MainLayout>
  );
}

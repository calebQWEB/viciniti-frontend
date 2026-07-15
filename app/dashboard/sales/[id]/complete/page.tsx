"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/types/order";
import MainLayout from "@/components/layout/MainLayout";
import PhotoUploader from "@/components/shared/PhotoUploader";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data as Order;
    },
  });

  // Mark completion mutation
  const { mutate: markComplete, isPending } = useMutation({
    mutationFn: async () => {
      if (photos.length === 0) {
        throw new Error("Please upload at least one photo");
      }

      if (!notes.trim()) {
        throw new Error("Please add a description of the work done");
      }

      const response = await api.post(`/orders/${id}/complete`, {
        photos,
        notes,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sales"] });
      setShowSuccess(true);
    },
    onError: (err: any) => {
      setError(
        err.message ||
          err.response?.data?.message ||
          "Failed to mark completion",
      );
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-10">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Order not found
          </div>
        </div>
      </MainLayout>
    );
  }

  const listingImage = order.listing?.images?.[0]?.url;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard/purchases"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mark as Complete</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Order Summary
          </h2>

          <div className="flex gap-4">
            {listingImage && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={listingImage}
                  alt={order.listing?.title || "Listing image"}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {order.listing?.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">Order ID: {order.id}</p>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                  ₦{order.amount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  (Fee: ₦{order.fee.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Document Your Work
              </p>
              <p className="text-sm text-blue-800">
                Upload photos showing the completed service and add a
                description. This proves completion and helps protect you in
                case of disputes.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            markComplete();
          }}
          className="space-y-6"
        >
          {/* Photos Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Completion Photos *
            </label>
            <PhotoUploader
              onPhotosChange={setPhotos}
              maxPhotos={10}
              photos={photos}
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload at least 1 photo showing the completed work. Up to 10
              photos allowed.
            </p>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Description of Work Done *
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError("");
              }}
              placeholder="Describe what you completed (e.g., 'Installed AC unit, tested and working properly')"
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard/purchases"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || photos.length === 0 || !notes.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark as Complete
                </>
              )}
            </button>
          </div>
        </form>
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

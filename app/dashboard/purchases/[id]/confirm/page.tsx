"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/types/order";
import MainLayout from "@/components/layout/MainLayout";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ConfirmCompletionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data as Order;
    },
  });

  const { mutate: confirmCompletion, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/orders/${id}/confirm-completion`, {
        rating,
        review,
      });
      return response.data;
    },
    onSuccess: () => {
      router.back();
    },
    onError: (err: any) => {
      setError(
        err.message ||
          err.response?.data?.message ||
          "Failed to confirm completion",
      );
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-6">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            Order not found
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order.completed_at) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-6">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs">
            Service is not marked as complete yet. Waiting for seller...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (order.buyer_accepted_at) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-6">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs">
            You have already confirmed completion for this order.
          </div>
        </div>
      </MainLayout>
    );
  }

  const listingImage = order.listing?.images?.[0]?.url;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Link
            href="/dashboard/purchases"
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Confirm Completion
          </h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Order Summary
          </h2>
          <div className="flex gap-3">
            {listingImage && (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={listingImage}
                  alt={order.listing?.title || "Listing image"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-xs mb-0.5">
                {order.listing?.title}
              </h3>
              <p className="text-[10px] text-gray-500 mb-2">
                Order ID: {order.id}
              </p>
              <span className="font-semibold text-gray-900 text-xs">
                ₦{order.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Photos */}
        {order.completion_photos && order.completion_photos.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Completion Photos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {order.completion_photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
                >
                  <Image
                    src={photo}
                    alt={`Completion photo ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Notes */}
        {order.completion_notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-4">
            <h2 className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest mb-2">
              Seller's Description
            </h2>
            <p className="text-gray-700 text-xs">{order.completion_notes}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <div className="flex gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 text-xs mb-0.5">
                Service Complete
              </p>
              <p className="text-[10px] text-green-800">
                Please confirm that the work was completed satisfactorily. Your
                confirmation releases payment to the seller and creates proof of
                completion.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmCompletion();
          }}
          className="space-y-4"
        >
          {/* Rating Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Rate This Service *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoveredStar || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {rating} out of 5 stars
            </p>
          </div>

          {/* Review Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Leave a Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => {
                setReview(e.target.value);
                setError("");
              }}
              placeholder="Share your experience with this service..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {review.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-[10px] text-blue-900">
              <strong>Important:</strong> By confirming completion, you're
              confirming the service was delivered as expected. Payment will be
              released to the seller and a permanent record will be created.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Link
              href="/dashboard/purchases"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-center text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-semibold text-xs hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Confirm Completion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

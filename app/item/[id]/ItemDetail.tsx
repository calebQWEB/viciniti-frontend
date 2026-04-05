"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { Listing } from "@/types/listing";
import { formatPrice, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

import {
  MapPin,
  Calendar,
  Tag,
  ArrowLeft,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeImage, setActiveImage] = useState(0);
  const [paymentError, setPaymentError] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data as Listing;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Step 1 — Create order, then initiate payment
  const { mutate: handleBuyNow, isPending } = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Create the order first
      const orderResponse = await api.post("/orders/", { listing_id: id });
      const order = orderResponse.data;

      // Initiate Flutterwave payment
      const paymentResponse = await api.post("/transactions/initiate-payment", {
        amount: order.amount,
        order_id: order.id,
      });

      return paymentResponse.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      // Store reference so callback page can verify it
      localStorage.setItem("payment_reference", data.reference);
      localStorage.setItem("payment_type", "order");
      // Redirect to Flutterwave hosted payment page
      window.location.href = data.payment_link;
    },
    onError: (error: any) => {
      setPaymentError(
        error.response?.data?.detail ||
          "Payment initiation failed. Please try again.",
      );
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-100 rounded-[32px]" />
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-gray-100 rounded-full w-1/4" />
              <div className="h-8 bg-gray-100 rounded-full w-3/4" />
              <div className="h-10 bg-gray-100 rounded-full w-1/3" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Listing not found
          </h2>
          <Link href="/browse/items" className="btn-primary mt-6 inline-block">
            Browse Items
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-[#2D6A4F] transition-colors mb-10 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <Image
                    src={listing.images[activeImage].url}
                    alt={listing.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === 0 ? listing.images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === listing.images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-gray-200" />
                </div>
              )}

              {listing.status === "sold" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-red-500 text-white text-2xl font-black px-8 py-3 rounded-2xl rotate-[-12deg] shadow-2xl">
                    SOLD
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, index) => (
                  <button
                    key={img.public_id}
                    onClick={() => setActiveImage(index)}
                    className={`relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === index
                        ? "border-[#2D6A4F] shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category pill */}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] uppercase tracking-widest mb-4 w-fit px-3 py-1.5 bg-[#2D6A4F]/8 rounded-lg">
              <Tag className="w-3.5 h-3.5" />
              {listing.category}
            </span>

            <Link
              href={`/profile/${listing.user_id}`}
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#2D6A4F] font-medium transition-colors mb-4"
            >
              <span>View seller profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {listing.title}
            </h1>

            {/* Price */}
            <p className="text-4xl font-black text-[#2D6A4F] tracking-tight mb-6 italic">
              {formatPrice(listing.price)}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-6">
              {listing.location && (
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-[#2D6A4F]/60" />
                  {listing.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Calendar className="w-4 h-4 text-[#2D6A4F]/60" />
                Listed {formatDate(listing.created_at)}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                About this item
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {listing.description}
              </p>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              Payments are secured and processed by Flutterwave
            </div>

            {/* Error */}
            {paymentError && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
                {paymentError}
              </div>
            )}

            {/* Buy Now Button */}
            {listing.status === "sold" ? (
              <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-center rounded-2xl cursor-not-allowed">
                This item has been sold
              </div>
            ) : (
              <button
                onClick={() => handleBuyNow()}
                disabled={isPending}
                className="group w-full py-4 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black text-base rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing payment...
                  </>
                ) : (
                  <>
                    Buy Now
                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            )}

            {listing.user_id !== user?.id && listing.status !== "sold" && (
              <Link
                href={`/dashboard/messages?contact=${listing.user_id}`}
                className="group w-full py-4 bg-white hover:bg-gray-50 text-gray-700 font-black text-base rounded-2xl border border-gray-200 hover:border-[#2D6A4F]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-3"
              >
                <MessageSquare className="w-5 h-5 text-[#2D6A4F]" />
                Message Seller
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

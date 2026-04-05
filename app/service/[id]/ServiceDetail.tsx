"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { Service } from "@/types/service";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  MapPin,
  Wrench,
  Calendar,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Tag,
  Clock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [activeImage, setActiveImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data as Service;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Book then pay — chained in one mutation
  const { mutate: handleBookAndPay, isPending } = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Step 1 — Create the booking
      const bookingResponse = await api.post("/bookings/", {
        service_id: id,
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      const booking = bookingResponse.data;

      // Step 2 — Initiate payment using booking amount
      const paymentResponse = await api.post("/transactions/initiate-payment", {
        amount: booking.amount,
        order_id: booking.id,
      });

      return paymentResponse.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      localStorage.setItem("payment_reference", data.reference);
      localStorage.setItem("payment_type", "booking");
      window.location.href = data.payment_link;
    },
    onError: (error: any) => {
      setBookingError(
        error.response?.data?.detail ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const handleSubmit = () => {
    setBookingError(null);
    if (!scheduledAt) {
      setBookingError("Please select a date and time.");
      return;
    }
    if (new Date(scheduledAt) <= new Date()) {
      setBookingError("Please select a future date and time.");
      return;
    }
    handleBookAndPay();
  };

  const handleCloseModal = () => {
    setShowBooking(false);
    setBookingError(null);
    setScheduledAt("");
  };

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

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

  if (!service) return null;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-[#2D6A4F] transition-colors mb-10 font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to services
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
              {service.images && service.images.length > 0 ? (
                <>
                  <Image
                    src={service.images[activeImage].url}
                    alt={service.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === 0 ? service.images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === service.images.length - 1 ? 0 : prev + 1,
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
                  <Wrench className="w-16 h-16 text-gray-200" />
                </div>
              )}

              {service.status === "inactive" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-gray-700 text-white text-xl font-black px-8 py-3 rounded-2xl shadow-2xl">
                    UNAVAILABLE
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {service.images && service.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {service.images.map((img, index) => (
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

          {/* Service Info */}
          <div className="flex flex-col">
            {/* Category pill */}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] uppercase tracking-widest mb-4 w-fit px-3 py-1.5 bg-[#2D6A4F]/8 rounded-lg">
              <Tag className="w-3.5 h-3.5" />
              {service.category}
            </span>

            <Link
              href={`/profile/${service.user_id}`}
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#2D6A4F] font-medium transition-colors mb-4"
            >
              <span>View seller profile</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {service.title}
            </h1>

            {/* Price */}
            <p className="text-4xl font-black text-[#2D6A4F] tracking-tight mb-2 italic">
              {formatPrice(service.price)}
              <span className="text-base font-semibold text-gray-400 ml-2 not-italic">
                / service
              </span>
            </p>

            {service.location && (
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-6">
                <MapPin className="w-4 h-4 text-[#2D6A4F]/60" />
                {service.location}
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                About this service
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {service.description}
              </p>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              Payments are secured and processed by Flutterwave
            </div>

            {/* Book Now Button */}
            {service.status === "inactive" ? (
              <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold text-center rounded-2xl cursor-not-allowed">
                This service is currently unavailable
              </div>
            ) : (
              <button
                onClick={() => setShowBooking(true)}
                className="group w-full py-4 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black text-base rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Calendar className="w-5 h-5" />
                Book Now
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            )}

            {service.user_id !== user?.id && service.status !== "inactive" && (
              <Link
                href={`/dashboard/messages?contact=${service.user_id}`}
                className="group w-full py-4 bg-white hover:bg-gray-50 text-gray-700 font-black text-base rounded-2xl border border-gray-200 hover:border-[#2D6A4F]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-3"
              >
                <MessageSquare className="w-5 h-5 text-[#2D6A4F]" />
                Message Provider
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Book Service
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Pick a date and time that works for you
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Service Summary */}
            <div className="flex items-center justify-between bg-[#2D6A4F]/5 border border-[#2D6A4F]/10 rounded-2xl p-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]/60 mb-0.5">
                  Service
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {service.title}
                </p>
              </div>
              <p className="text-lg font-black text-[#2D6A4F] italic">
                {formatPrice(service.price)}
              </p>
            </div>

            {/* Date & Time Picker */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                <Clock className="w-3.5 h-3.5" />
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDateTime}
                onChange={(e) => {
                  setScheduledAt(e.target.value);
                  setBookingError(null);
                }}
                className="input w-full"
              />
              {bookingError && (
                <p className="text-rose-500 text-xs font-medium mt-2">
                  {bookingError}
                </p>
              )}
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
              You'll be redirected to Flutterwave to complete payment
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="group w-full py-4 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-black rounded-2xl shadow-lg shadow-[#2D6A4F]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing payment...
                </>
              ) : (
                <>
                  Confirm & Pay
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ListingCard from "@/components/listings/ListingCard";
import ServiceCard from "@/components/services/ServiceCard";
import api from "@/lib/api";
import { User } from "@/types/user";
import { Listing } from "@/types/listing";
import { Service } from "@/types/service";
import { Review } from "@/types/review";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  MapPin,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Wrench,
  BadgeCheck,
  ArrowUpRight,
  Wallet,
  Star,
} from "lucide-react";

interface UserStats {
  listings: Listing[];
  services: Service[];
  completed_orders_count: number;
}

type Tab = "listings" | "services" | "reviews";

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  // Fetch user profile
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data as User;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["user-stats", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/stats`);
      return response.data as UserStats;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch reviews
  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["seller-reviews", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/reviews`);
      return response.data as Review[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingUser || loadingStats || loadingReviews;
  const isOwnProfile = currentUser?.id === id;

  // Average rating
  const averageRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  const tabs = [
    {
      key: "listings",
      label: "Listings",
      count: stats?.listings.length ?? 0,
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      key: "services",
      label: "Services",
      count: stats?.services.length ?? 0,
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      key: "reviews",
      label: "Reviews",
      count: reviews?.length ?? 0,
      icon: <Star className="w-4 h-4" />,
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 animate-pulse">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-6">
            <div className="h-20 sm:h-28 bg-gray-50" />
            <div className="px-5 sm:px-7 pb-6">
              <div className="-mt-8 sm:-mt-10 flex items-end gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 ring-4 ring-white" />
                <div className="pb-2 space-y-2 flex-1">
                  <div className="h-5 bg-gray-100 rounded-full w-1/4" />
                  <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl h-24 mb-6" />
          <div className="h-10 bg-gray-100 rounded-full w-1/2 mb-6" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
          <div className="relative overflow-hidden rounded-4xl border border-[#2D6A4F]/10 bg-white shadow-[0_20px_80px_-24px_rgba(45,106,79,0.28)] mb-6">
            <div className="absolute inset-x-0 top-0 h-28" />
            <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute left-10 top-10 h-16 w-16 rounded-full border border-white/20" />

            <div className="relative px-5 sm:px-7 pb-6 pt-6 sm:pt-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full blur-xl opacity-40 scale-110" />
                    <div className="relative w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-[#2D6A4F]/10 shadow-sm">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-2xl font-black text-[#2D6A4F]">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-[#2D6A4F] rounded-full ring-2 ring-white flex items-center justify-center">
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="pt-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl font-black text-gray-900 tracking-tight">
                        {user.name}
                      </h1>
                      {averageRating && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-100 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-700">
                            {averageRating}
                          </span>
                          <span className="text-[10px] text-yellow-600">
                            ({reviews?.length})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3.5 mt-1.5">
                      {user.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                          {user.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Calendar className="w-3 h-3 text-[#2D6A4F]" />
                        Member since{" "}
                        {new Date(user.created_at).toLocaleDateString("en-NG", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-xs transition-all border border-gray-200 shadow-sm"
                    >
                      Edit Profile
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    isAuthenticated && (
                      <Link
                        href={`/dashboard/messages?contact=${user.id}`}
                        className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-bold rounded-2xl text-xs transition-all shadow-sm shadow-[#2D6A4F]/20 active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-gray-100 bg-[#F8FCFA] p-4 sm:p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400 font-semibold mb-2">
                    About
                  </div>
                  {user.bio ? (
                    <p className="text-sm leading-6 text-gray-600">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-gray-500">
                      This profile is still getting started. Check out their
                      listings and services below.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-[#2D6A4F]/10 p-4 sm:p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-gray-400 font-semibold mb-3">
                    Highlights
                  </div>
                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2">
                      <span>Verified profile</span>
                      <span className="font-semibold text-[#2D6A4F]">Yes</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2">
                      <span>Active listings</span>
                      <span className="font-semibold text-[#2D6A4F]">
                        {stats?.listings.length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2">
                      <span>Services offered</span>
                      <span className="font-semibold text-[#2D6A4F]">
                        {stats?.services.length ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 leading-none">
                    {stats?.listings.length ?? 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400 mt-1">
                    Listings
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4A261]/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#F4A261]" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 leading-none">
                    {stats?.services.length ?? 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400 mt-1">
                    Services
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 leading-none">
                    {stats?.completed_orders_count ?? 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-400 mt-1">
                    Transactions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-2 shadow-sm mb-6">
            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as Tab)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#2D6A4F] text-white shadow-sm"
                        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-100 bg-white/80 p-4 sm:p-5 shadow-sm">
            {activeTab === "listings" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      Listings
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Browse what this seller has shared.
                    </p>
                  </div>
                </div>
                {stats?.listings && stats.listings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-[#F8FCFA]">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      No listings yet
                    </h3>
                    <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs">
                      {user.name.split(" ")[0]} hasn&apos;t posted any listings
                      yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      Services
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      See the services this profile offers.
                    </p>
                  </div>
                </div>
                {stats?.services && stats.services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-[#F8FCFA]">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Wrench className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      No services yet
                    </h3>
                    <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs">
                      {user.name.split(" ")[0]} hasn&apos;t offered any services
                      yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-gray-900">
                      Reviews
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      What others have to say.
                    </p>
                  </div>
                </div>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-3">
                    <div className="rounded-3xl border border-gray-100 bg-linear-to-r from-[#F8FCFA] to-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="text-center sm:text-left shrink-0">
                        <p className="text-4xl font-black text-gray-900 italic tracking-tight leading-none">
                          {averageRating}
                        </p>
                        <div className="flex items-center gap-0.5 justify-center sm:justify-start mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(Number(averageRating))
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter(
                            (r) => r.rating === star,
                          ).length;
                          const percentage = Math.round(
                            (count / reviews.length) * 100,
                          );
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-medium w-3">
                                {star}
                              </span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                              <div className="flex-1 bg-gray-200/70 rounded-full h-1.5">
                                <div
                                  className="bg-yellow-400 h-1.5 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium w-6 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-100 rounded-[20px] p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(review.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-[#F8FCFA]">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Star className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">
                      No reviews yet
                    </h3>
                    <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs">
                      {user.name.split(" ")[0]} hasn&apos;t received any reviews
                      yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

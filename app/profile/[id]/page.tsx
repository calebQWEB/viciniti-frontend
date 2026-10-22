"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Check, MapPin, MessageSquare, Share2, ShieldCheck, Star } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import ListingCard from "@/components/listings/ListingCard";
import ServiceCard from "@/components/services/ServiceCard";
import StreetPattern from "@/components/location/StreetPattern";
import api from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { PublicUser } from "@/types/user";
import { Listing } from "@/types/listing";
import { Service } from "@/types/service";
import { PublicReview } from "@/types/review";

interface UserStats {
  listings: Listing[];
  services: Service[];
  completed_orders_count: number;
}

type Tab = "listings" | "services" | "reviews";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function Stars({ rating, size = "h-3.5 w-3.5" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${size} ${n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-earth-200 text-earth-200"}`}
        />
      ))}
    </span>
  );
}

// Uses the phone's share sheet where available, otherwise copies the link
function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on ${BRAND.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked: nothing to do
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : "Share profile"}
      className="inline-flex items-center gap-1.5 rounded-xl border border-earth-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-earth-50 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary-500" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied && "Link copied"}
    </button>
  );
}

function ReviewsTab({ reviews, averageRating }: { reviews: PublicReview[]; averageRating: number }) {
  if (reviews.length === 0) {
    return <p className="py-10 text-center text-[13px] text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="grid max-w-xl grid-cols-1 items-center gap-4 border-b border-earth-200 pb-5 sm:grid-cols-[auto_1fr] sm:gap-6">
        <div>
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-gray-900 tabular-nums">
            {averageRating.toFixed(1)}
          </p>
          <div className="mt-1.5">
            <Stars rating={averageRating} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{plural(reviews.length, "review")}</p>
        </div>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            return (
              <div key={stars} className="grid grid-cols-[12px_1fr_20px] items-center gap-2 text-[11px] text-gray-500 tabular-nums">
                <span>{stars}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-earth-100">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </span>
                <span className="text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="grid grid-cols-[32px_1fr] gap-3 border-b border-earth-100 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-earth-100 text-[11px] font-bold text-gray-500">
              {getInitials(review.reviewer_name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
                <span className="font-bold text-gray-900">{review.reviewer_name}</span>
                <span className="text-gray-500">
                  {review.kind} <span className="font-semibold text-gray-800">{review.subject_title}</span>
                </span>
                <Stars rating={review.rating} size="h-3 w-3" />
                <time className="w-full text-[11.5px] text-gray-400 sm:ml-auto sm:w-auto" dateTime={review.created_at}>
                  {new Date(review.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              {review.review_text && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-700">{review.review_text}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  const { data: user, isLoading: loadingUser, isError } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data as PublicUser;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/stats`);
      return response.data as UserStats;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["seller-reviews", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/reviews`);
      return response.data as PublicReview[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  if (loadingUser) {
    return (
      <MainLayout>
        <div className="h-24 bg-primary-700 sm:h-28" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-pulse">
          <div className="-mt-11 h-[92px] w-[92px] rounded-full border-4 border-earth-50 bg-earth-200" />
          <div className="mt-4 h-5 w-48 rounded-full bg-earth-200" />
          <div className="mt-3 h-3.5 w-72 rounded-full bg-earth-100" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !user) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-lg font-bold text-gray-900">This profile doesn&apos;t exist</h1>
          <p className="mt-1.5 text-[13px] text-gray-500">The link may be wrong, or the account was removed.</p>
          <Link href="/" className="mt-5 inline-block text-[13px] font-bold text-primary-600 hover:underline">
            Back to {BRAND.name}
          </Link>
        </div>
      </MainLayout>
    );
  }

  const firstName = user.name.split(" ")[0];
  const isOwnProfile = currentUser?.id === id;
  const listings = stats?.listings ?? [];
  const services = stats?.services ?? [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "listings", label: "Listings", count: listings.length },
    { key: "services", label: "Services", count: services.length },
    { key: "reviews", label: "Reviews", count: reviews.length },
  ];

  return (
    <MainLayout>
      {/* Band: only the avatar overlaps it, so the name sits on the light background */}
      <div className="relative h-24 overflow-hidden bg-primary-700 sm:h-28" aria-hidden="true">
        <StreetPattern roads />
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-14 sm:px-6">
        <header className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-3 sm:grid-cols-[auto_1fr_auto] sm:gap-x-5">
          <div className="relative -mt-9 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-4 border-earth-50 bg-primary-100 shadow-[0_10px_24px_-14px_rgba(23,61,44,0.6)] sm:-mt-11 sm:h-[92px] sm:w-[92px]">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill sizes="92px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-extrabold text-primary-700 sm:text-2xl">
                {getInitials(user.name)}
              </span>
            )}
          </div>

          <div className="min-w-0 pt-2.5 sm:pt-3.5">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              {user.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12.5px] text-gray-500">
              {user.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-0.5 pl-1.5 pr-2.5 font-semibold text-primary-700">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {user.location}
                </span>
              )}
              {reviews.length > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  {averageRating.toFixed(1)}
                  <span className="font-normal text-gray-500">({plural(reviews.length, "review")})</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary-500" aria-hidden="true" />
                Member since{" "}
                {new Date(user.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="col-span-2 flex gap-2 sm:col-span-1 sm:pt-4">
            {isOwnProfile ? (
              <Link
                href="/dashboard/profile"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-earth-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-earth-50 transition-colors sm:flex-none"
              >
                Edit profile
              </Link>
            ) : (
              <Link
                href={isAuthenticated ? `/dashboard/messages?contact=${user.id}` : "/login"}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors sm:flex-none"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                {isAuthenticated ? `Message ${firstName}` : "Log in to message"}
              </Link>
            )}
            <ShareButton name={user.name} />
          </div>
        </header>

        <p className="mt-4 text-[13px] text-gray-500">
          {[
            { count: listings.length, label: listings.length === 1 ? "listing" : "listings" },
            { count: services.length, label: services.length === 1 ? "service" : "services" },
            { count: stats?.completed_orders_count ?? 0, label: "sales completed" },
          ].map((fact, i) => (
            <span key={fact.label}>
              {i > 0 && <span className="mx-2.5 text-earth-300" aria-hidden="true">·</span>}
              <span className="font-bold text-gray-900 tabular-nums">{fact.count}</span> {fact.label}
            </span>
          ))}
        </p>

        {user.bio && (
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-gray-700">{user.bio}</p>
        )}

        {!isOwnProfile && (
          <div className="mt-4 flex max-w-2xl items-center gap-2.5 rounded-2xl bg-primary-50 px-3.5 py-2.5 text-[12.5px] text-primary-700">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Pay through {BRAND.name}. Your money is held until you confirm you got what you paid for.
          </div>
        )}

        <div role="tablist" aria-label="Profile sections" className="mt-7 flex gap-6 overflow-x-auto border-b border-earth-200 scrollbar-hide">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`relative whitespace-nowrap pb-2.5 text-[13px] font-semibold transition-colors ${
                  active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-[11px] font-medium text-gray-400 tabular-nums">{tab.count}</span>
                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary-500" />}
              </button>
            );
          })}
        </div>

        <div className="pt-5" role="tabpanel">
          {activeTab === "listings" &&
            (listings.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-[13px] text-gray-500">
                {firstName} hasn&apos;t listed any items yet.
              </p>
            ))}

          {activeTab === "services" &&
            (services.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-[13px] text-gray-500">
                {firstName} doesn&apos;t offer any services yet.
              </p>
            ))}

          {activeTab === "reviews" && <ReviewsTab reviews={reviews} averageRating={averageRating} />}
        </div>
      </div>
    </MainLayout>
  );
}

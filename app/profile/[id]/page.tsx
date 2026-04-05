"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import ListingCard from "@/components/listings/ListingCard";
import ServiceCard from "@/components/services/ServiceCard";
import api from "@/lib/api";
import { User } from "@/types/user";
import { Listing } from "@/types/listing";
import { Service } from "@/types/service";
import { formatPrice, getInitials } from "@/lib/utils";
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
} from "lucide-react";

interface UserStats {
  listings: Listing[];
  services: Service[];
  transaction_count: number;
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Fetch user profile
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data as User;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user stats — listings, services, transaction count
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["user-stats", id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}/stats`);
      return response.data as UserStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = loadingUser || loadingStats;
  const isOwnProfile = currentUser?.id === id;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-100 rounded-full w-1/3" />
              <div className="h-4 bg-gray-100 rounded-full w-1/4" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-3xl" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#2D6A4F]/10 border-2 border-[#2D6A4F]/10 flex items-center justify-center">
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
              {/* Verified badge */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#2D6A4F] rounded-xl flex items-center justify-center shadow-md">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {user.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {user.location && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      Member since{" "}
                      {new Date(user.created_at).toLocaleDateString("en-NG", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <Link
                      href="/dashboard/profile"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-sm transition-all"
                    >
                      Edit Profile
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    isAuthenticated && (
                      <Link
                        href={`/dashboard/messages?contact=${user.id}`}
                        className="w-full sm:w-auto group flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#2D6A4F]/20 active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-xl">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <div className="w-10 h-10 bg-[#2D6A4F]/8 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <p className="text-2xl font-black text-gray-900 italic tracking-tight">
              {stats?.listings.length ?? 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              Active Listings
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <div className="w-10 h-10 bg-[#F4A261]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-5 h-5 text-[#F4A261]" />
            </div>
            <p className="text-2xl font-black text-gray-900 italic tracking-tight">
              {stats?.services.length ?? 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              Active Services
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 italic tracking-tight">
              {stats?.transaction_count ?? 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              Transactions
            </p>
          </div>
        </div>

        {/* Active Listings */}
        {stats?.listings && stats.listings.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Listings
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Items {user.name.split(" ")[0]} is selling
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                {stats.listings.length} item
                {stats.listings.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* Active Services */}
        {stats?.services && stats.services.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Services
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Services {user.name.split(" ")[0]} offers
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                {stats.services.length} service
                {stats.services.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state — no listings or services */}
        {stats?.listings.length === 0 && stats?.services.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Nothing here yet
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium">
              {user.name.split(" ")[0]} hasn't posted any listings or services
              yet.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

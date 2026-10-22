"use client";

import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import api from "@/lib/api";
import NeighbourhoodMap from "@/components/location/NeighbourhoodMap";
import HeroSearch from "@/components/home/HeroSearch";
import NearYou from "@/components/home/NearYou";
import CategoryChips from "@/components/home/CategoryChips";
import TrustSection from "@/components/home/TrustSection";
import SellBand from "@/components/home/SellBand";
import { CategoryItem } from "@/components/home/CategoryIcon";
import { Listing } from "@/types/listing";
import { Service } from "@/types/service";

interface PlatformStats {
  active_listings: number;
  total_users: number;
}

// Listings fetched for the home feed (the map shows the first three items)
const FEATURED_LIMIT = 8;

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const { isReady, nearbyParams, hasLocation, locationName, radiusKm } = useLocation();

  const { data: featured } = useQuery({
    // The limit is part of the key: the auth pages' map fetches a different number
    queryKey: ["home-featured", FEATURED_LIMIT, nearbyParams],
    queryFn: async () => {
      const response = await api.get("/home/featured", {
        params: { limit: FEATURED_LIMIT, ...nearbyParams },
      });
      return response.data as { items: Listing[]; services: Service[] };
    },
    enabled: isReady,
  });

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const response = await api.get("/home/stats");
      return response.data as PlatformStats;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const response = await api.get("/categories/");
      return response.data as CategoryItem[];
    },
  });

  const firstName = user?.name?.split(" ")[0];
  const nearbyItems = featured?.items ?? [];
  const sellingNearby = hasLocation && nearbyItems.length > 0;

  return (
    <MainLayout>
      {/* ============================================================
          HERO: search first, with the neighbourhood map beside it
      ============================================================ */}
      <section className="bg-linear-to-b from-primary-50 to-earth-50">
        <div className="max-w-7xl mx-auto grid items-center gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white py-1 pl-2 pr-3 text-xs font-semibold text-primary-700">
              <span className="h-2 w-2 rounded-full bg-accent-500 ring-4 ring-accent-400/25" aria-hidden="true" />
              {isAuthenticated && firstName
                ? `Welcome back, ${firstName}`
                : sellingNearby
                  ? `People are selling near ${locationName} right now`
                  : `Your neighbourhood marketplace`}
            </span>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-gray-900 text-balance">
              {isAuthenticated ? (
                "What are you looking for today?"
              ) : (
                <>
                  Find it <span className="text-primary-500">nearby</span>. Buy, sell and hire in
                  your neighbourhood.
                </>
              )}
            </h1>
            <p className="mt-3 max-w-lg text-sm md:text-[15px] leading-relaxed text-gray-600">
              Second-hand gadgets, furniture, cleaners, tutors and more, from people a short ride
              away. Pay safely through {BRAND.name} and pick up today.
            </p>

            <div className="mt-6">
              <HeroSearch categories={categories ?? []} />
            </div>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-500">
              {stats && stats.active_listings > 0 && (
                <div>
                  <dt className="sr-only">Live listings</dt>
                  <dd className="text-lg font-bold text-gray-900 tabular-nums">{stats.active_listings}</dd>
                  <dd>live listings</dd>
                </div>
              )}
              <div>
                <dt className="sr-only">Cost to list</dt>
                <dd className="text-lg font-bold text-gray-900">₦0</dd>
                <dd>to list</dd>
              </div>
              <div>
                <dt className="sr-only">Seller fee</dt>
                <dd className="text-lg font-bold text-gray-900 tabular-nums">{PLATFORM.feePercent}%</dd>
                <dd>fee, only when it sells</dd>
              </div>
            </dl>
          </div>

          <div
            className="relative aspect-[1/0.85] w-full overflow-hidden rounded-[28px] bg-primary-700 shadow-[0_30px_60px_-32px_rgba(23,61,44,0.7)]"
            aria-label={hasLocation ? `Map of listings around ${locationName}` : "Map of your neighbourhood"}
            role="img"
          >
            <NeighbourhoodMap
              listings={nearbyItems}
              radiusLabel={hasLocation ? `${radiusKm} km around you` : undefined}
            />
          </div>
        </div>
      </section>

      {/* Listings come right after the hero; rendered once loaded so tab defaults are right */}
      {featured && <NearYou items={featured.items} services={featured.services} />}

      <CategoryChips categories={categories ?? []} />

      {/* New visitors only: how payments stay safe, and the pitch to sellers */}
      {!isAuthenticated && (
        <>
          <TrustSection />
          <SellBand />
        </>
      )}
    </MainLayout>
  );
}

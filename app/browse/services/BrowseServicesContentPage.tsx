"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import ServiceCard from "@/components/services/ServiceCard";
import NothingNearby from "@/components/location/NothingNearby";
import api from "@/lib/api";
import { useLocation } from "@/hooks/useLocation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { CategorySummary } from "@/types/listing";
import { Service } from "@/types/service";
import { Search, X, Wrench, Loader2, MapPin } from "lucide-react";

const PAGE_SIZE = 12;

export default function BrowseServicesContentPage({
  initialCategory = "",
  initialQuery = "",
}: {
  // Category slug from ?category=, e.g. when arriving from the landing page
  initialCategory?: string;
  // Search text from ?q=, e.g. from the landing page search bar
  initialQuery?: string;
}) {
  const [search, setSearch] = useState(initialQuery);
  // Searched on the server, once typing pauses
  const query = useDebouncedValue(search.trim());
  // Category slug; empty means all categories
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sort, setSort] = useState<"nearest" | "newest">("nearest");
  const { hasLocation, isReady, nearbyParams, locationName, radiusKm, openDialog } =
    useLocation();

  const { data: categories } = useQuery({
    queryKey: ["categories", "service"],
    queryFn: async () => {
      const response = await api.get("/categories/", { params: { type: "service" } });
      return response.data as CategorySummary[];
    },
  });

  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["services", selectedCategory, query, nearbyParams, sort],
      queryFn: async ({ pageParam = 0 }) => {
        const params = new URLSearchParams();
        if (selectedCategory) params.append("category", selectedCategory);
        if (query) params.append("q", query);
        if (hasLocation) {
          Object.entries(nearbyParams).forEach(([key, value]) =>
            params.append(key, String(value)),
          );
          params.append("sort", sort);
        }
        params.append("skip", String(pageParam));
        params.append("limit", String(PAGE_SIZE));
        const response = await api.get(`/services?${params.toString()}`);
        return response.data as Service[];
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
        return allPages.length * PAGE_SIZE;
      },
      initialPageParam: 0,
      enabled: isReady,
    });

  const allServices = data?.pages.flat() ?? [];
  const filteredServices = allServices.filter(
    (service) => service.status === "active",
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Browse Services
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Find trusted local service providers near you
          </p>
          {isReady && (
            <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              {hasLocation ? (
                <span>
                  Within <strong>{radiusKm} km</strong> of{" "}
                  <strong>{locationName}</strong>
                </span>
              ) : (
                <span>Showing services from everywhere</span>
              )}
              <button
                onClick={openDialog}
                className="font-semibold text-primary-600 hover:underline"
              >
                {hasLocation ? "Change" : "Set your location"}
              </button>
            </p>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="input pl-9 sm:pl-10 text-xs sm:text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {hasLocation && (
            <div className="relative w-full sm:w-48">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "nearest" | "newest")}
                aria-label="Sort services"
                className="input text-xs sm:text-sm"
              >
                <option value="nearest">Nearest first</option>
                <option value="newest">Newest first</option>
              </select>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
          {[{ name: "All", slug: "" }, ...(categories ?? [])].map((category) => (
            <button
              key={category.slug || "all"}
              onClick={() => setSelectedCategory(category.slug)}
              className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === category.slug
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white text-gray-600 border border-earth-200 hover:border-primary-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {isPending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-earth-200 rounded-t-3xl" />
                <div className="p-2.5 sm:p-3 space-y-1.5">
                  <div className="h-2.5 bg-earth-200 rounded w-1/3" />
                  <div className="h-3 bg-earth-200 rounded w-3/4" />
                  <div className="h-4 bg-earth-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {filteredServices.length} service
              {filteredServices.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="group flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 hover:border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/5 text-gray-700 hover:text-[#2D6A4F] font-bold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Services"
                  )}
                </button>
              </div>
            )}
          </>
        ) : hasLocation && !search ? (
          <NothingNearby
            noun="services"
            createHref="/dashboard/services/create"
            createLabel="Be the first to offer a service"
          />
        ) : (
          <div className="text-center py-10 sm:py-14 lg:py-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-earth-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-5 sm:w-6 h-5 sm:h-6 text-earth-300" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
              No services found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

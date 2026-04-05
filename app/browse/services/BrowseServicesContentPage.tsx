"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import ServiceCard from "@/components/services/ServiceCard";
import api from "@/lib/api";
import { Service } from "@/types/service";
import { Search, X, Wrench, Loader2 } from "lucide-react";

const CATEGORIES = [
  "All",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Tutoring",
  "Delivery",
  "Photography",
  "Catering",
  "Repairs",
  "Beauty & Wellness",
  "Other",
];

const PAGE_SIZE = 12;

export default function BrowseServicesContentPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["services", selectedCategory, location],
      queryFn: async ({ pageParam = 0 }) => {
        const params = new URLSearchParams();
        if (selectedCategory !== "All")
          params.append("category", selectedCategory);
        if (location) params.append("location", location);
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
    });

  const allServices = data?.pages.flat() ?? [];
  const filteredServices = allServices.filter(
    (service) =>
      service.title.toLowerCase().includes(search.toLowerCase()) &&
      service.status === "active",
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Browse Services
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Find trusted local service providers near you
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="input pl-10 sm:pl-12 text-sm sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location..."
              className="input text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-primary-500 text-white shadow-md"
                  : "bg-white text-gray-600 border border-earth-200 hover:border-primary-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-earth-200 rounded-t-3xl" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 bg-earth-200 rounded w-1/3" />
                  <div className="h-4 bg-earth-200 rounded w-3/4" />
                  <div className="h-5 bg-earth-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              {filteredServices.length} service
              {filteredServices.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center mt-8 sm:mt-10 lg:mt-12">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="group flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-white border border-gray-200 hover:border-[#2D6A4F]/30 hover:bg-[#2D6A4F]/5 text-gray-700 hover:text-[#2D6A4F] font-bold text-sm sm:text-base rounded-2xl transition-all disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Services"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-earth-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 sm:w-8 h-6 sm:h-8 text-earth-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

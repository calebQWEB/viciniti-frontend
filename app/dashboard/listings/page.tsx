"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Listing } from "@/types/listing";
import { formatPrice, truncateText } from "@/lib/utils";
import {
  Plus,
  ShoppingBag,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch current user's listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: async () => {
      const response = await api.get("/listings/me");
      return response.data as Listing[];
    },
  });

  // Delete mutation
  const { mutate: deleteListing } = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => {
      // Invalidate the cache so the list refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeletingId(id);
    deleteListing(id);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3 h-3" />
              Listings
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              My Listings
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Manage your items for sale
            </p>
          </div>
          <Link
            href="/dashboard/listings/create"
            className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-4 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6 font-medium">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 sm:w-12 h-8 sm:h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Status badge */}
                    {listing.status === "sold" && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                        SOLD
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-[#2D6A4F] font-semibold uppercase tracking-wide mb-1">
                      {listing.category}
                    </p>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      {truncateText(listing.title, 40)}
                    </h3>
                    <p className="text-lg sm:text-xl font-bold text-[#2D6A4F] mb-2">
                      {formatPrice(listing.price)}
                    </p>
                    {listing.location && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm mb-3">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{truncateText(listing.location, 25)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-[#2D6A4F] transition-colors py-2 sm:py-1"
                      >
                        <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Edit
                      </Link>
                      <div className="w-px h-3 sm:h-4 bg-gray-200" />
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-red-500 transition-colors py-2 sm:py-1 disabled:opacity-50"
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        )}
                        {deletingId === listing.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-[40px] border-2 border-dashed border-gray-100 mx-4 sm:mx-0">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
              <ShoppingBag className="w-6 sm:w-8 h-6 sm:h-8 text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium text-sm sm:text-base">
              Create your first listing to start selling your items
            </p>
            <Link
              href="/dashboard/listings/create"
              className="inline-flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md mt-6"
            >
              <Plus className="w-4 h-4" />
              Create a Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

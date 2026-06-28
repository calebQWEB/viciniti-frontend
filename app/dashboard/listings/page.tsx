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

  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: async () => {
      const response = await api.get("/listings/me");
      return response.data as Listing[];
    },
  });

  const { mutate: deleteListing } = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => {
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
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider">
              <ShoppingBag className="w-2.5 h-2.5" />
              Listings
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              My Listings
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Manage your items for sale
            </p>
          </div>
          <Link
            href="/dashboard/listings/create"
            className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            New Listing
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mb-3 sm:mb-4 font-medium">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-xl">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7 text-gray-300" />
                      </div>
                    )}

                    {/* Status badge */}
                    {listing.status === "sold" && (
                      <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SOLD
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-2.5">
                    <p className="text-[10px] text-[#2D6A4F] font-semibold uppercase tracking-wide mb-0.5">
                      {listing.category}
                    </p>
                    <h3 className="font-bold text-gray-900 mb-0.5 text-xs leading-tight">
                      {truncateText(listing.title, 40)}
                    </h3>
                    <p className="text-sm font-bold text-[#2D6A4F] mb-1.5">
                      {formatPrice(listing.price)}
                    </p>
                    {listing.location && (
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{truncateText(listing.location, 25)}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] text-gray-600 hover:text-[#2D6A4F] transition-colors py-1"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        Edit
                      </Link>
                      <div className="w-px h-3 bg-gray-200" />
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] text-gray-600 hover:text-red-500 transition-colors py-1 disabled:opacity-50"
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-2.5 h-2.5" />
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
          <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 mx-2 sm:mx-0">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ShoppingBag className="w-5 h-5 text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              No listings yet
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-1 font-medium text-xs">
              Create your first listing to start selling your items
            </p>
            <Link
              href="/dashboard/listings/create"
              className="inline-flex items-center gap-1.5 bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md mt-5"
            >
              <Plus className="w-3 h-3" />
              Create a Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

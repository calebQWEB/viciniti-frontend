"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Listing, ListingStatus } from "@/types/listing";
import { formatPrice, truncateText } from "@/lib/utils";
import {
  Plus,
  ShoppingBag,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface StatusCounts {
  all: number;
  active: number;
  sold: number;
}

const PAGE_SIZE = 20;

const STATUS_META: Record<
  ListingStatus,
  { label: string; tone: "green" | "gray" }
> = {
  active: { label: "Active", tone: "green" },
  sold: { label: "Sold", tone: "gray" },
};

const TONE_CLASSES: Record<string, string> = {
  green: "text-[#2D6A4F] bg-[#2D6A4F]/10 border-[#2D6A4F]/15",
  gray: "text-gray-500 bg-gray-100 border-gray-200",
};

const FILTER_ORDER: (ListingStatus | "all")[] = ["all", "active", "sold"];

function StatusPill({ status }: { status: ListingStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${TONE_CLASSES[meta.tone]}`}
    >
      {meta.label}
    </span>
  );
}

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-listings", page, statusFilter],
    queryFn: async () => {
      const response = await api.get("/listings/me", {
        params: {
          page,
          limit: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      return response.data as PaginatedListings;
    },
    placeholderData: (previousData) => previousData,
  });

  const { data: counts } = useQuery({
    queryKey: ["my-listings-counts"],
    queryFn: async () => {
      const response = await api.get("/listings/me/counts");
      return response.data as StatusCounts;
    },
  });

  const { mutate: deleteListing } = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings-counts"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeletingId(id);
    deleteListing(id);
  };

  const listings = data?.items;
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
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

        {/* Status filter pills */}
        <div className="-mx-4 sm:-mx-6 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pb-1">
            {FILTER_ORDER.map((key) => {
              const isActive = statusFilter === key;
              const label = key === "all" ? "All" : STATUS_META[key].label;
              const count = counts?.[key] ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#2D6A4F] border-[#2D6A4F] text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-[#2D6A4F]/40 hover:text-gray-700"
                  }`}
                >
                  {label}
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 ${
                      isActive ? "bg-white/20" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-full bg-gray-50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <>
            {/* Desktop dense table */}
            <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-2.5">
                        Item
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-2.5">
                        Category
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-2.5">
                        Price
                      </th>
                      <th className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-2.5">
                        Status
                      </th>
                      <th className="text-right text-[9px] font-bold uppercase tracking-widest text-gray-400 px-4 py-2.5">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-7 h-7 rounded-md overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
                              {listing.images && listing.images.length > 0 ? (
                                <Image
                                  src={listing.images[0].url}
                                  alt={listing.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-3 h-3 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-gray-900 text-xs truncate max-w-[220px]">
                              {truncateText(listing.title, 45)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-[11px] text-gray-500 font-semibold">
                            {listing.category}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs font-black text-[#2D6A4F]">
                            {formatPrice(listing.price)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <StatusPill status={listing.status} />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/listings/${listing.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-[#2D6A4F] hover:bg-[#2D6A4F]/5 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(listing.id)}
                              disabled={deletingId === listing.id}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === listing.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile compact rows */}
            <div className="sm:hidden space-y-1.5">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-2.5"
                >
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-50 ring-1 ring-gray-100 shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 text-xs truncate">
                        {truncateText(listing.title, 30)}
                      </p>
                      <StatusPill status={listing.status} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium truncate">
                      {listing.category} ·{" "}
                      <span className="text-[#2D6A4F] font-bold">
                        {formatPrice(listing.price)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-[#2D6A4F] rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deletingId === listing.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
                    >
                      {deletingId === listing.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Page {page} of {totalPages} · {total} total
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-14 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
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

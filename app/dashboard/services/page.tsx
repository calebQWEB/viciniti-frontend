"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Service } from "@/types/service";
import { formatPrice, truncateText } from "@/lib/utils";
import { Plus, Wrench, MapPin, Pencil, Trash2, Loader2 } from "lucide-react";

export default function MyServicesPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["my-services"],
    queryFn: async () => {
      const response = await api.get("/services/me");
      return response.data as Service[];
    },
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setDeletingId(id);
    deleteService(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Services
          </h1>
          <p className="text-gray-500 mt-0.5 text-xs">
            Manage the services you offer
          </p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="btn-primary flex items-center gap-1.5 w-full sm:w-auto justify-center py-2 text-xs"
        >
          <Plus className="w-3 h-3" />
          New Service
        </Link>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-square bg-earth-200 rounded-t-xl" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-2.5 bg-earth-200 rounded w-1/3" />
                <div className="h-3 bg-earth-200 rounded w-3/4" />
                <div className="h-4 bg-earth-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <>
          <p className="text-xs text-gray-500 mb-3">
            {services.length} service{services.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {services.map((service) => (
              <div key={service.id} className="card group overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square bg-earth-100 overflow-hidden rounded-t-xl">
                  {service.images && service.images.length > 0 ? (
                    <Image
                      src={service.images[0].url}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="w-7 h-7 text-earth-300" />
                    </div>
                  )}

                  {/* Status badge */}
                  {service.status === "inactive" && (
                    <div className="absolute top-1.5 left-1.5 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      INACTIVE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-2.5">
                  <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-wide mb-0.5">
                    {service.category}
                  </p>
                  <h3 className="font-bold text-gray-900 text-xs mb-0.5">
                    {truncateText(service.title, 40)}
                  </h3>
                  <p className="text-sm font-bold text-primary-600 mb-1.5">
                    {formatPrice(service.price)}
                  </p>
                  {service.location && (
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{truncateText(service.location, 25)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-earth-100">
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] text-gray-600 hover:text-[#2D6A4F] transition-colors py-1 rounded border border-gray-100 hover:border-[#2D6A4F]/20"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={deletingId === service.id}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] text-gray-600 hover:text-red-500 transition-colors py-1 rounded border border-gray-100 hover:border-red-100 disabled:opacity-50"
                    >
                      {deletingId === service.id ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-2.5 h-2.5" />
                      )}
                      {deletingId === service.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-14">
          <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-5 h-5 text-earth-300" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            No services yet
          </h3>
          <p className="text-gray-500 text-xs mb-4">
            Start offering your skills to people near you
          </p>
          <Link
            href="/dashboard/services/create"
            className="btn-primary text-xs py-2 px-4"
          >
            Offer a Service
          </Link>
        </div>
      )}
    </div>
  );
}

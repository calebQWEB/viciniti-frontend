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
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            My Services
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage the services you offer
          </p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center py-3 sm:py-2"
        >
          <Plus className="w-4 h-4" />
          New Service
        </Link>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-square bg-earth-200 rounded-t-3xl" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-earth-200 rounded w-1/3" />
                <div className="h-4 bg-earth-200 rounded w-3/4" />
                <div className="h-5 bg-earth-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {services.length} service{services.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service) => (
              <div key={service.id} className="card group overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square bg-earth-100 overflow-hidden rounded-t-3xl">
                  {service.images && service.images.length > 0 ? (
                    <Image
                      src={service.images[0].url}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="w-12 h-12 text-earth-300" />
                    </div>
                  )}

                  {/* Status badge */}
                  {service.status === "inactive" && (
                    <div className="absolute top-3 left-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      INACTIVE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">
                    {service.category}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {truncateText(service.title, 40)}
                  </h3>
                  <p className="text-xl font-bold text-primary-600 mb-2">
                    {formatPrice(service.price)}
                  </p>
                  {service.location && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{truncateText(service.location, 25)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-earth-100">
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 text-sm sm:text-base text-gray-600 hover:text-[#2D6A4F] transition-colors py-2 sm:py-1 rounded-lg border border-gray-100 hover:border-[#2D6A4F]/20"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={deletingId === service.id}
                      className="flex-1 flex items-center justify-center gap-1 text-sm sm:text-base text-gray-600 hover:text-red-500 transition-colors py-2 sm:py-1 rounded-lg border border-gray-100 hover:border-red-100 disabled:opacity-50"
                    >
                      {deletingId === service.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-earth-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-earth-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No services yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start offering your skills to people near you
          </p>
          <Link href="/dashboard/services/create" className="btn-primary">
            Offer a Service
          </Link>
        </div>
      )}
    </div>
  );
}

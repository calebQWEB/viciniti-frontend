"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Listing,
  ListingCreate,
  ImageObject,
  ListingStatus,
} from "@/types/listing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Furniture",
  "Vehicles",
  "Books",
  "Sports",
  "Home & Garden",
  "Toys & Games",
  "Food & Drinks",
  "Other",
];

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"active" | "sold">("active");

  const [form, setForm] = useState<ListingCreate>({
    title: "",
    description: "",
    price: 0,
    category: "",
    images: [],
    location: "",
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ListingCreate, string>>
  >({});

  // Fetch existing listing data
  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data as Listing;
    },
  });

  // Pre-populate form once data is loaded
  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: listing.images,
        location: listing.location || "",
        latitude: listing.latitude || null,
        longitude: listing.longitude || null,
      });

      setStatus(listing.status);
    }
  }, [listing]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ListingCreate) =>
      api.put(`/listings/${id}`, { ...data, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      router.push("/dashboard/listings");
    },
    onError: (error: any) => {
      console.error("Failed to update listing:", error);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name as keyof ListingCreate]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImagesChange = (images: ImageObject[]) => {
    setForm((prev) => ({ ...prev, images }));
  };

  const handleLocationChange = (
    location: string,
    latitude: number | null,
    longitude: number | null,
  ) => {
    setForm((prev) => ({ ...prev, location, latitude, longitude }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ListingCreate, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!form.category) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate(form);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
            <div className="h-12 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider mb-4">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Listing
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Update Listing
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-2">
            Make changes to your listing details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter listing title"
              className="w-full px-4 py-3 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400 transition-all"
            />
            {errors.title && (
              <p className="text-red-500 text-xs font-medium">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your item in detail"
              className="w-full px-4 py-3 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400 resize-none transition-all"
            />
            {errors.description && (
              <p className="text-red-500 text-xs font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400 transition-all"
              />
              {errors.price && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 transition-all appearance-none"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Images
            </label>
            <ImageUploader
              images={form.images || []}
              onChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Location
            </label>
            <LocationPicker
              location={form.location || ""}
              latitude={form.latitude ?? null}
              longitude={form.longitude ?? null}
              onChange={handleLocationChange}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "sold")}
              className="w-full px-4 py-3 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 transition-all appearance-none"
            >
              <option value="active">Active — visible to everyone</option>
              <option value="sold">Sold — mark as sold</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-6 py-3 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

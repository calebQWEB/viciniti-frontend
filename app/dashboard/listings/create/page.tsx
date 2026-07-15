"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { ImageObject, ListingCreate } from "@/types/listing";
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

export default function CreateListingPage() {
  const router = useRouter();

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

  const [generalError, setGeneralError] = useState("");

  const [errors, setErrors] = useState<
    Partial<Record<keyof ListingCreate, string>>
  >({});

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ListingCreate) => api.post("/listings/", data),
    onSuccess: () => {
      router.push("/dashboard/listings");
    },
    onError: (error: any) => {
      setGeneralError(
        error.response?.data?.detail ||
          "Failed to create listing. Please try again.",
      );
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-bold uppercase tracking-wider mb-2.5">
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Listing
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Create a Listing
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Fill in the details to list your item for sale
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-900">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 13 Pro Max 256GB"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 text-xs placeholder-gray-400 transition-all"
            />
            {errors.title && (
              <p className="text-red-500 text-[10px] font-medium">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-900">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your item — condition, age, any defects..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 text-xs placeholder-gray-400 resize-none transition-all"
            />
            {errors.description && (
              <p className="text-red-500 text-[10px] font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-900">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 text-xs placeholder-gray-400 transition-all"
              />
              {errors.price && (
                <p className="text-red-500 text-[10px] font-medium">
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] bg-white text-gray-900 text-xs transition-all appearance-none"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-[10px] font-medium">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-900">
              Images
            </label>
            <ImageUploader
              images={form.images || []}
              onChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-900">
              Location
            </label>
            <LocationPicker
              location={form.location || ""}
              latitude={form.latitude ?? null}
              longitude={form.longitude ?? null}
              onChange={handleLocationChange}
            />
          </div>

          {/* Submit */}
          {generalError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {generalError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-[#2D6A4F] hover:bg-[#1b4332] text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {isPending ? "Publishing..." : "Publish Listing"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

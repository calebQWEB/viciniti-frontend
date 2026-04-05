"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { ImageObject } from "@/types/listing";
import { ServiceCreate } from "@/types/service";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
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

export default function CreateServicePage() {
  const router = useRouter();

  const [form, setForm] = useState<ServiceCreate>({
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
    Partial<Record<keyof ServiceCreate, string>>
  >({});

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ServiceCreate) => api.post("/services/", data),
    onSuccess: () => {
      router.push("/dashboard/services");
    },
    onError: (error: any) => {
      console.error("Failed to create service:", error);
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
    if (errors[name as keyof ServiceCreate]) {
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
    const newErrors: Partial<Record<keyof ServiceCreate, string>> = {};

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
    <div className="min-h-screen bg-[#FDFDFD] py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Offer a Service
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm md:text-base">
            Tell people what service you provide and how to book you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Professional Home Cleaning"
              className="input w-full"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your service — what's included, your experience, availability..."
              rows={4}
              className="input w-full resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Price (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="input w-full"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <ImageUploader
              images={form.images || []}
              onChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 sm:py-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Publishing..." : "Publish Service"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline w-full sm:w-auto flex items-center justify-center py-3 sm:py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

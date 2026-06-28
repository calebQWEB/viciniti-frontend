"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Service, ServiceCreate } from "@/types/service";
import { ImageObject } from "@/types/listing";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";
import { ArrowLeft, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Technology",
  "Repairs",
  "Tutoring",
  "Cleaning",
  "Design",
  "Photography",
  "Writing",
  "Marketing",
  "Fitness",
  "Cooking",
  "Music",
  "Other",
];

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

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
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceCreate, string>>
  >({});

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data as Service;
    },
  });

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
        images: service.images,
        location: service.location || "",
        latitude: service.latitude || null,
        longitude: service.longitude || null,
      });
      setStatus(service.status);
    }
  }, [service]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ServiceCreate & { status: string }) =>
      api.put(`/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      router.push("/dashboard/services");
    },
    onError: (error: any) => {
      console.error("Failed to update service:", error);
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
    mutate({ ...form, status });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors mb-2.5 text-xs font-medium"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Edit Service
        </h1>
        <p className="mt-0.5 text-gray-500 text-xs">
          Update your service details
        </p>
      </div>

      {/* Form Card */}
      <div className="card p-3 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Service Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input text-xs py-2 px-3 rounded-lg"
              placeholder="e.g. Professional Web Design"
            />
            {errors.title && (
              <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input min-h-24 resize-none text-xs py-2 px-3 rounded-lg"
              placeholder="Describe your service in detail..."
            />
            {errors.description && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Price (₦)
              </label>
              <input
                type="number"
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                className="input text-xs py-2 px-3 rounded-lg"
                placeholder="e.g. 150000"
                min="0"
              />
              {errors.price && (
                <p className="text-red-500 text-[10px] mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input text-xs py-2 px-3 rounded-lg"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "inactive")
              }
              className="input text-xs py-2 px-3 rounded-lg"
            >
              <option value="active">Active — visible to everyone</option>
              <option value="inactive">Inactive — hidden from browse</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 btn-outline py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

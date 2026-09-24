"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import SuccessModal from "@/components/shared/SuccessModal";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  PenLine,
  Tag,
  Wrench,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";
import { ImageObject } from "@/types/listing";
import { ServiceCreate } from "@/types/service";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: "item" | "service";
}

export default function CreateServicePage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", "service"],
    queryFn: async () => {
      const response = await api.get("/categories/", {
        params: { type: "service" },
      });
      return response.data as Category[];
    },
  });

  const [form, setForm] = useState<ServiceCreate>({
    title: "",
    description: "",
    price: 0,
    category_id: "",
    images: [],
    location: "",
    latitude: null,
    longitude: null,
  });

  const [generalError, setGeneralError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (generalError) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [generalError]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceCreate, string>>
  >({});

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ServiceCreate) => api.post("/services/", data),

    onSuccess: () => {
      setShowSuccess(true);
    },

    onError: (error: any) => {
      setGeneralError(
        error.response?.data?.detail ||
          "Something went wrong while creating your service. Please try again.",
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

    if (errors[name as keyof ServiceCreate]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (generalError) {
      setGeneralError("");
    }
  };

  const handleImagesChange = (images: ImageObject[]) => {
    setForm((prev) => ({
      ...prev,
      images,
    }));
  };

  const handleLocationChange = (
    location: string,
    latitude: number | null,
    longitude: number | null,
  ) => {
    setForm((prev) => ({
      ...prev,
      location,
      latitude,
      longitude,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceCreate, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = "Give your service a title";
    }

    if (!form.description.trim()) {
      newErrors.description = "Add some details about your service";
    }

    if (!form.price || form.price <= 0) {
      newErrors.price = "Enter a valid price";
    }

    if (!form.category_id) {
      newErrors.category_id = "Choose a service category";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setGeneralError("");
    mutate(form);
  };

  const descriptionLength = form.description.length;
  const selectedCategory = categories?.find((c) => c.id === form.category_id);

  const completion = useMemo(() => {
    let completed = 0;

    if (form.title.trim()) completed++;
    if (form.description.trim()) completed++;
    if (form.price > 0) completed++;
    if (form.category_id) completed++;
    if (form.images?.length) completed++;
    if (form.location) completed++;

    return Math.round((completed / 6) * 100);
  }, [form]);

  const formattedPrice = form.price
    ? new Intl.NumberFormat("en-NG").format(form.price)
    : "0";

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      {/* Top navigation */}
      <header className="border-b border-gray-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition group-hover:border-gray-300 group-hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4" />
            </span>

            <span className="hidden sm:inline">Back to services</span>
          </button>

          <div className="hidden items-center gap-2 text-sm font-semibold text-gray-900 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
              <Wrench className="h-4 w-4" />
            </span>
            Create Service
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="hidden sm:inline">Progress</span>

            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
              {completion}%
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/10 px-3 py-1.5 text-xs font-bold text-[#2D6A4F]">
            <Wrench className="h-3.5 w-3.5" />
            New service
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            What service do you offer?
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Tell customers what you do, what you charge, and where you provide
            your service.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General error */}
            {generalError && (
              <div
                ref={errorRef}
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">Unable to publish service</p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {generalError}
                  </p>
                </div>
              </div>
            )}

            {/* Service information */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F]">
                    <PenLine className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-950">
                      Service information
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Give customers enough information to understand what you
                      offer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                {/* Title */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="title"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Service title
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <span className="text-[11px] text-gray-400">
                      {form.title.length}/100
                    </span>
                  </div>

                  <input
                    id="title"
                    type="text"
                    name="title"
                    maxLength={100}
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Professional Home Cleaning"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                      errors.title
                        ? "border-red-300 ring-4 ring-red-500/5"
                        : "border-gray-200 hover:border-gray-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10"
                    }`}
                  />

                  {errors.title ? (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.title}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-gray-400">
                      Keep it clear and specific so customers immediately know
                      what you offer.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="description"
                      className="text-sm font-semibold text-gray-900"
                    >
                      Description
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <span className="text-[11px] text-gray-400">
                      {descriptionLength} characters
                    </span>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={6}
                    placeholder="Describe what you offer, what's included, your experience, availability, and anything else customers should know..."
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                      errors.description
                        ? "border-red-300 ring-4 ring-red-500/5"
                        : "border-gray-200 hover:border-gray-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10"
                    }`}
                  />

                  {errors.description ? (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.description}
                    </p>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Info className="h-3 w-3" />
                      Clear service details help customers understand what
                      they're booking.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Price & category */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Tag className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-950">
                      Pricing & category
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Help customers find your service and understand its price.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Service price
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div
                    className={`flex overflow-hidden rounded-xl border bg-white transition-all ${
                      errors.price
                        ? "border-red-300 ring-4 ring-red-500/5"
                        : "border-gray-200 focus-within:border-[#2D6A4F] focus-within:ring-4 focus-within:ring-[#2D6A4F]/10"
                    }`}
                  >
                    <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-500">
                      ₦
                    </span>

                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={form.price || ""}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>

                  {errors.price && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category_id"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Service category
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="category_id"
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      disabled={loadingCategories}
                      className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition-all ${
                        errors.category_id
                          ? "border-red-300 ring-4 ring-red-500/5"
                          : "border-gray-200 hover:border-gray-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10"
                      }`}
                    >
                      <option value="">
                        {loadingCategories
                          ? "Loading categories..."
                          : "Select a category"}
                      </option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>

                  {errors.category_id && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.category_id}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ImageIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-gray-950">
                        Photos
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Show customers what your service looks like.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                    {form.images?.length || 0}/5
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <ImageUploader
                  images={form.images || []}
                  onChange={handleImagesChange}
                  maxImages={5}
                />

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <p className="text-[11px] leading-5 text-gray-500">
                    Add clear photos that help customers understand the quality
                    of your work or what they can expect from your service.
                  </p>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-950">
                      Location
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Let customers know where you provide your service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <LocationPicker
                  location={form.location || ""}
                  latitude={form.latitude ?? null}
                  longitude={form.longitude ?? null}
                  onChange={handleLocationChange}
                />
              </div>
            </section>

            {/* Mobile action buttons */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1b4332] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

                {isPending ? "Publishing..." : "Publish Service"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isPending}
                className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-5">
              {/* Preview */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        Service preview
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        This is how customers will see it.
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Wrench className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Preview image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {form.images?.[0] ? (
                    <img
                      src={
                        (form.images[0] as any).url ||
                        (form.images[0] as any).image ||
                        ""
                      }
                      alt={form.title || "Service preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>

                      <p className="text-xs font-semibold text-gray-400">
                        Your first photo will appear here
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="line-clamp-2 text-sm font-bold text-gray-950">
                    {form.title || "Your service title"}
                  </p>

                  <p className="mt-2 text-lg font-black text-[#2D6A4F]">
                    ₦{formattedPrice}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCategory && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                        {selectedCategory.name}
                      </span>
                    )}

                    {form.location && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {form.location}
                      </span>
                    )}
                  </div>

                  {form.description && (
                    <p className="mt-4 line-clamp-3 text-xs leading-5 text-gray-500">
                      {form.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Completion */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-950">
                      Service quality
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Complete more details to make your service more appealing.
                    </p>
                  </div>

                  <span className="text-sm font-black text-[#2D6A4F]">
                    {completion}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#2D6A4F] transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  <CompletionItem
                    completed={!!form.title.trim()}
                    label="Add a service title"
                  />

                  <CompletionItem
                    completed={!!form.description.trim()}
                    label="Describe your service"
                  />

                  <CompletionItem
                    completed={form.price > 0}
                    label="Set a price"
                  />

                  <CompletionItem
                    completed={!!form.category_id}
                    label="Choose a category"
                  />

                  <CompletionItem
                    completed={!!form.images?.length}
                    label="Add photos"
                  />

                  <CompletionItem
                    completed={!!form.location}
                    label="Add a location"
                  />
                </div>
              </div>

              {/* Publish actions */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <button
                  type="submit"
                  disabled={isPending}
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1b4332] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

                  {isPending ? "Publishing..." : "Publish Service"}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isPending}
                  className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showSuccess && (
        <SuccessModal
          title="Service Published!"
          message="Your Service is now live and visible to buyers nearby."
          buttonText="View My Services"
          onClose={() => router.push("/dashboard/services")}
        />
      )}
    </div>
  );
}

/* --------------------------------
   Completion item
--------------------------------- */

function CompletionItem({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          completed
            ? "bg-[#2D6A4F] text-white"
            : "border border-gray-200 bg-white"
        }`}
      >
        {completed && <Check className="h-3 w-3" />}
      </span>

      <span
        className={`text-xs ${
          completed ? "font-medium text-gray-700" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

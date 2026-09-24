"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SuccessModal from "@/components/shared/SuccessModal";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleCheck,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  PenLine,
  Tag,
  XCircle,
  BriefcaseBusiness,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Service, ServiceCreate } from "@/types/service";
import { ImageObject } from "@/types/listing";

import api from "@/lib/api";
import ImageUploader from "@/components/ui/ImageUploader";
import LocationPicker from "@/components/ui/LocationPicker";

interface Category {
  id: string;
  name: string;
  slug: string;
  type: "item" | "service";
}

type ServiceStatus = "active" | "inactive";

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", "service"],
    queryFn: async () => {
      const response = await api.get("/categories/", {
        params: { type: "service" },
      });
      return response.data as Category[];
    },
  });

  const [status, setStatus] = useState<ServiceStatus>("active");

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

  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceCreate, string>>
  >({});

  const [generalError, setGeneralError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (generalError) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [generalError]);
  /*
   * -----------------------------------------
   * Fetch service
   * -----------------------------------------
   */

  const {
    data: service,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data as Service;
    },
  });

  /*
   * -----------------------------------------
   * Populate form
   * -----------------------------------------
   */

  useEffect(() => {
    if (!service) return;

    setForm({
      title: service.title,
      description: service.description,
      price: service.price,
      category_id: service.category_id,
      images: service.images,
      location: service.location || "",
      latitude: service.latitude ?? null,
      longitude: service.longitude ?? null,
    });

    setStatus(service.status);
  }, [service]);

  /*
   * -----------------------------------------
   * Update service
   * -----------------------------------------
   */

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ServiceCreate) =>
      api.put(`/services/${id}`, {
        ...data,
        status,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-listings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["listing", id],
      });

      setShowSuccess(true);
    },

    onError: (error: any) => {
      setGeneralError(
        error.response?.data?.detail ||
          "We couldn't save your changes. Please try again.",
      );
    },
  });

  /*
   * -----------------------------------------
   * Form handlers
   * -----------------------------------------
   */

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

    setGeneralError("");
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

    setGeneralError("");
  };

  /*
   * -----------------------------------------
   * Validation
   * -----------------------------------------
   */

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

    if (!validate()) return;

    setGeneralError("");
    mutate(form);
  };

  /*
   * -----------------------------------------
   * Service completion
   * -----------------------------------------
   */
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

  /*
   * -----------------------------------------
   * Loading state
   * -----------------------------------------
   */

  if (isLoading) {
    return <EditServiceSkeleton />;
  }

  /*
   * -----------------------------------------
   * Error state
   * -----------------------------------------
   */

  if (isError || !service) {
    return (
      <div className="min-h-screen bg-[#F7F8F7]">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-950">
              Service couldn't be loaded
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              We couldn't retrieve this service. Please try again or return to
              your services.
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard/services")}
              className="mt-6 rounded-xl bg-[#2D6A4F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b4332]"
            >
              Back to services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      {/* --------------------------------
          Header
      --------------------------------- */}

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
              <PenLine className="h-4 w-4" />
            </span>
            Edit Service
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-gray-400 sm:inline">
              Service quality
            </span>

            <span className="rounded-full bg-[#2D6A4F]/10 px-2.5 py-1 text-xs font-bold text-[#2D6A4F]">
              {completion}%
            </span>
          </div>
        </div>
      </header>

      {/* --------------------------------
          Main
      --------------------------------- */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}

        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/10 px-3 py-1.5 text-xs font-bold text-[#2D6A4F]">
            <PenLine className="h-3.5 w-3.5" />
            Editing service
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Make your service better
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Update your service details, photos, location, or availability. Your
            changes will be reflected once you save.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* --------------------------------
              FORM
          --------------------------------- */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General error */}

            {generalError && (
              <div
                ref={errorRef}
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">Changes couldn't be saved</p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {generalError}
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------
                Service details
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<PenLine className="h-5 w-5" />}
                iconClass="bg-[#2D6A4F]/10 text-[#2D6A4F]"
                title="Service details"
                description="Keep your service title and description clear and useful for potential clients."
              />

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
                    value={form.title}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Professional Web Design"
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
                      Use a clear title that tells clients exactly what service
                      you provide.
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
                      {form.description.length}/1000
                    </span>
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={6}
                    placeholder="Describe your service, what you offer, your experience, what is included, and anything else clients should know..."
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
                      <Info className="h-3 w-3" />A detailed description helps
                      clients understand what they can expect from your service.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* --------------------------------
                Pricing
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<Tag className="h-5 w-5" />}
                iconClass="bg-amber-50 text-amber-600"
                title="Pricing & category"
                description="Update your service price or move it into a different category."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {/* Price */}

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-gray-900"
                  >
                    Price
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
                      min="0"
                      step="1"
                      placeholder="0"
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
                    Category
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

                  {selectedCategory && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                      {selectedCategory.name}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* --------------------------------
                Photos
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<ImageIcon className="h-5 w-5" />}
                iconClass="bg-blue-50 text-blue-600"
                title="Photos"
                description="Manage the photos clients will see when viewing your service."
                badge={`${form.images?.length || 0}/5`}
              />

              <div className="p-5 sm:p-6">
                <ImageUploader
                  images={form.images || []}
                  onChange={handleImagesChange}
                  maxImages={5}
                />

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                  <p className="text-[11px] leading-5 text-gray-500">
                    You can replace or remove existing photos and add new ones.
                    Use clear images that showcase your work or service
                    professionally.
                  </p>
                </div>
              </div>
            </section>

            {/* --------------------------------
                Location
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<MapPin className="h-5 w-5" />}
                iconClass="bg-purple-50 text-purple-600"
                title="Location"
                description="Update where you provide or operate your service."
              />

              <div className="p-5 sm:p-6">
                <LocationPicker
                  location={form.location || ""}
                  latitude={form.latitude ?? null}
                  longitude={form.longitude ?? null}
                  onChange={handleLocationChange}
                />
              </div>
            </section>

            {/* --------------------------------
                Status
            --------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SectionHeader
                icon={<CircleCheck className="h-5 w-5" />}
                iconClass={
                  status === "active"
                    ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
                    : "bg-gray-100 text-gray-500"
                }
                title="Service status"
                description="Control whether clients can currently find and view this service."
              />

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Active */}

                  <StatusOption
                    selected={status === "active"}
                    title="Active"
                    description="Visible to clients"
                    icon={<CircleCheck className="h-5 w-5" />}
                    onClick={() => setStatus("active")}
                  />

                  {/* Inactive */}

                  <StatusOption
                    selected={status === "inactive"}
                    title="Inactive"
                    description="Hide service from browse"
                    icon={<Check className="h-5 w-5" />}
                    onClick={() => setStatus("inactive")}
                  />
                </div>
              </div>
            </section>

            {/* --------------------------------
                Mobile actions
            --------------------------------- */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1b4332] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

                {isPending ? "Saving changes..." : "Save Changes"}
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

          {/* --------------------------------
              Desktop sidebar
          --------------------------------- */}

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-5">
              {/* Preview */}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-950">
                        Live preview
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Preview your service as clients will see it.
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <BriefcaseBusiness className="h-4 w-4 text-gray-500" />
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
                        No service photo
                      </p>
                    </div>
                  )}

                  {/* Status badge */}

                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${
                        status === "active"
                          ? "bg-white text-[#2D6A4F]"
                          : "bg-gray-900 text-white"
                      }`}
                    >
                      {status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
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

                        <span className="max-w-[180px] truncate">
                          {form.location}
                        </span>
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

              {/* Service quality */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-950">
                      Service quality
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Complete information makes your service stronger.
                    </p>
                  </div>

                  <span className="text-sm font-black text-[#2D6A4F]">
                    {completion}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#2D6A4F] transition-all duration-500"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  <CompletionItem
                    completed={!!form.title.trim()}
                    label="Add a title"
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

              {/* Save panel */}

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CircleCheck
                      className={`h-4 w-4 ${
                        status === "active" ? "text-[#2D6A4F]" : "text-gray-400"
                      }`}
                    />

                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {status === "active"
                          ? "Service is active"
                          : "Service is inactive"}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Changes will be saved when you click below.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1b4332] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

                  {isPending ? "Saving changes..." : "Save Changes"}
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
          title="Changes Saved!"
          message="Your Service has been updated."
          buttonText="View My Services"
          onClose={() => router.push("/dashboard/services")}
        />
      )}
    </div>
  );
}

/* =========================================================
   Section Header
========================================================= */

function SectionHeader({
  icon,
  iconClass,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-950">{title}</h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
              {description}
            </p>
          </div>
        </div>

        {badge && (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Status Option
========================================================= */

function StatusOption({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-[#2D6A4F] bg-[#2D6A4F]/5 ring-4 ring-[#2D6A4F]/5"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-[#2D6A4F] text-white" : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gray-900">{title}</span>

        <span className="mt-0.5 block text-xs text-gray-500">
          {description}
        </span>
      </span>

      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          selected
            ? "border-[#2D6A4F] bg-[#2D6A4F] text-white"
            : "border-gray-300"
        }`}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}

/* =========================================================
   Completion Item
========================================================= */

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

/* =========================================================
   Loading Skeleton
========================================================= */

function EditServiceSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

          <div className="hidden h-8 w-32 animate-pulse rounded-lg bg-gray-200 sm:block" />

          <div className="h-7 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 space-y-3">
          <div className="h-7 w-28 animate-pulse rounded-full bg-gray-200" />

          <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-200" />

          <div className="h-5 w-[420px] max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SkeletonCard height="300px" />
            <SkeletonCard height="190px" />
            <SkeletonCard height="250px" />
            <SkeletonCard height="220px" />
            <SkeletonCard height="170px" />
          </div>

          <div className="hidden space-y-5 lg:block">
            <SkeletonCard height="430px" />
            <SkeletonCard height="260px" />
            <SkeletonCard height="150px" />
          </div>
        </div>
      </main>
    </div>
  );
}

function SkeletonCard({ height }: { height: string }) {
  return (
    <div
      className="animate-pulse rounded-2xl border border-gray-200 bg-white"
      style={{ height }}
    />
  );
}

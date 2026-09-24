"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ShoppingBag,
  ShieldCheck,
  Wrench,
  ArrowRight,
  PlusCircle,
  LayoutDashboard,
  Users,
  Package,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: "item" | "service";
  icon: string | null;
}

interface FeaturedListing {
  id: string;
  title: string;
  price: number;
  images: { url: string; public_id: string }[];
}

interface FeaturedService {
  id: string;
  title: string;
  price: number;
  images: { url: string; public_id: string }[];
}

interface PlatformStats {
  active_listings: number;
  total_users: number;
}

function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const pascalCase = (name || "package")
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
  const Icon = (LucideIcons as any)[pascalCase] || Package;
  return <Icon className={className} />;
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [categoryTab, setCategoryTab] = useState<"item" | "service">("item");

  const { data: featured } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const response = await api.get("/home/featured", { params: { limit: 6 } });
      return response.data as { items: FeaturedListing[]; services: FeaturedService[] };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const response = await api.get("/home/stats");
      return response.data as PlatformStats;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", categoryTab],
    queryFn: async () => {
      const response = await api.get("/categories/", { params: { type: categoryTab } });
      return response.data as CategoryItem[];
    },
  });

  const heroListings = featured?.items?.slice(0, 3) ?? [];
  const firstName = user?.name?.split(" ")[0];

  return (
      <MainLayout>
        {/* ============================================================
          HERO
      ============================================================ */}
        <section className="bg-earth-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Copy */}
              <div>
                {isAuthenticated ? (
                    <>
                      <p className="text-primary-600 font-semibold text-sm mb-3">
                        Welcome back, {firstName}
                      </p>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                        What are you looking for today?
                      </h1>
                      <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                        Pick up where you left off, list something new, or see what's happening in your dashboard.
                      </p>
                      <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/dashboard"
                            className="btn-primary text-sm md:text-base px-6 py-3 flex items-center justify-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Go to Dashboard
                        </Link>
                        <Link
                            href="/dashboard/listings/create"
                            className="btn-outline bg-white text-sm md:text-base px-6 py-3 flex items-center justify-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                          List an Item
                        </Link>
                      </div>
                    </>
                ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                        Buy, sell, and hire
                        <br />
                        right in your neighborhood.
                      </h1>
                      <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                        Viciniti connects you with people nearby — for items you need, skills you're looking for, or things you're ready to let go of.
                      </p>
                      <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/browse/items"
                            className="btn-primary text-sm md:text-base px-6 md:px-8 py-3 flex items-center justify-center gap-2"
                        >
                          Browse Items
                        </Link>
                        <Link
                            href="/browse/services"
                            className="btn-outline bg-white text-sm md:text-base px-6 md:px-8 py-3 flex items-center justify-center gap-2"
                        >
                          Hire Services
                        </Link>
                      </div>
                    </>
                )}

                {stats && stats.active_listings > 0 && (
                    <div className="mt-10 flex items-center gap-6">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.active_listings}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Live listings</p>
                      </div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                        <p className="text-xs text-gray-500 mt-0.5">People on Viciniti</p>
                      </div>
                    </div>
                )}
              </div>

              {/* Live listings stack */}
              {heroListings.length > 0 && (
                  <div className="relative h-[340px] sm:h-[400px] hidden sm:block">
                    {heroListings.map((listing, idx) => {
                      const rotations = ["-rotate-3", "rotate-2", "-rotate-1"];
                      const offsets = ["top-0 left-4", "top-16 right-0", "top-32 left-16"];
                      return (
                          <Link
                              key={listing.id}
                              href={`/item/${listing.id}`}
                              className={`absolute w-56 bg-white rounded-2xl border border-gray-100 shadow-lg p-3 transition-transform hover:scale-[1.03] hover:z-10 ${rotations[idx]} ${offsets[idx]}`}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2.5">
                              {listing.images?.[0]?.url ? (
                                  <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                                  </div>
                              )}
                            </div>
                            <p className="text-xs font-bold text-gray-900 truncate">{listing.title}</p>
                            <p className="text-sm font-black text-primary-600 mt-0.5">{formatPrice(listing.price)}</p>
                          </Link>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
          HOW IT WORKS
      ============================================================ */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 md:mb-12 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How Viciniti works</h2>
              <p className="mt-3 text-gray-500 text-sm md:text-base">
                Simple, secure, and built around your community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: <MapPin className="w-5 h-5 text-primary-600" />,
                  title: "Set your location",
                  description: "Tell us where you are so we can show you what's actually nearby.",
                },
                {
                  icon: <ShoppingBag className="w-5 h-5 text-primary-600" />,
                  title: "Buy, sell, or hire",
                  description: "List items you no longer need, or find people for the job you need done.",
                },
                {
                  icon: <ShieldCheck className="w-5 h-5 text-primary-600" />,
                  title: "Pay securely",
                  description: "Payments are held safely until both sides confirm the transaction is complete.",
                },
              ].map((item, index) => (
                  <div
                      key={index}
                      className="p-5 md:p-6 rounded-2xl border border-gray-100 bg-white hover:border-primary-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
          CATEGORIES
      ============================================================ */}
        <section className="py-12 md:py-16 bg-earth-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by category</h2>
                <p className="mt-2 text-gray-500 text-sm md:text-base">
                  Find exactly what you're after.
                </p>
              </div>

              <div className="flex bg-white border border-gray-200 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setCategoryTab("item")}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        categoryTab === "item" ? "bg-primary-500 text-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Items
                </button>
                <button
                    onClick={() => setCategoryTab("service")}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        categoryTab === "service" ? "bg-primary-500 text-white" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Services
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories?.map((category) => (
                  <Link
                      key={category.id}
                      href={`/browse/${categoryTab === "item" ? "items" : "services"}?category=${category.slug}`}
                      className="flex flex-col items-center p-4 md:p-5 bg-white rounded-xl border border-transparent hover:border-primary-200 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="text-gray-400 group-hover:text-primary-500 mb-2.5">
                      <CategoryIcon name={category.icon} className="w-5 h-5" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-800 font-bold text-center">{category.name}</p>
                  </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
          LIVE LISTINGS PREVIEW
      ============================================================ */}
        {(featured?.items?.length ?? 0) > 0 || (featured?.services?.length ?? 0) > 0 ? (
            <section className="py-12 md:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-6 md:mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Happening right now</h2>
                    <p className="mt-2 text-gray-500 text-sm md:text-base">Fresh listings from your community.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {featured?.items?.map((listing) => (
                      <Link
                          key={listing.id}
                          href={`/item/${listing.id}`}
                          className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden"
                      >
                        <div className="relative aspect-square bg-gray-50">
                          {listing.images?.[0]?.url ? (
                              <Image
                                  src={listing.images[0].url}
                                  alt={listing.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-gray-300" />
                              </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-gray-900 truncate">{listing.title}</p>
                          <p className="text-sm font-black text-primary-600 mt-0.5">{formatPrice(listing.price)}</p>
                        </div>
                      </Link>
                  ))}
                  {featured?.services?.map((service) => (
                      <Link
                          key={service.id}
                          href={`/services/${service.id}`}
                          className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden"
                      >
                        <div className="relative aspect-square bg-gray-50">
                          {service.images?.[0]?.url ? (
                              <Image
                                  src={service.images[0].url}
                                  alt={service.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-gray-300" />
                              </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-gray-900 truncate">{service.title}</p>
                          <p className="text-sm font-black text-primary-600 mt-0.5">{formatPrice(service.price)}</p>
                        </div>
                      </Link>
                  ))}
                </div>
              </div>
            </section>
        ) : null}

        {/* ============================================================
          CTA — only for logged-out visitors
      ============================================================ */}
        {!isAuthenticated && (
            <section className="py-10 md:py-16 px-4">
              <div className="max-w-6xl mx-auto bg-primary-600 rounded-3xl md:rounded-[2rem] p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-52 md:h-52 bg-primary-500 rounded-full opacity-50" />
                <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-48 h-48 md:w-72 md:h-72 bg-primary-400 rounded-full opacity-20" />

                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Your neighborhood is waiting.
                  </h2>
                  <p className="text-primary-100 text-sm md:text-base mb-6 md:mb-8 max-w-xl mx-auto">
                    Create an account in under a minute and start connecting with people near you.
                  </p>
                  <Link
                      href="/signup"
                      className="inline-block w-full sm:w-auto bg-white text-primary-600 px-6 md:px-8 py-3 rounded-xl text-sm md:text-base font-bold hover:bg-earth-50 transition-all shadow-xl"
                  >
                    Get started for free
                  </Link>
                </div>
              </div>
            </section>
        )}
      </MainLayout>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import ServiceCard from "@/components/services/ServiceCard";
import NothingNearby from "@/components/location/NothingNearby";
import { useLocation } from "@/hooks/useLocation";
import { BRAND } from "@/lib/brand";
import { Listing } from "@/types/listing";
import { Service } from "@/types/service";

type Tab = "items" | "services";

interface NearYouProps {
  items: Listing[];
  services: Service[];
}

// Listings right under the hero: nearest first when a location is set, newest otherwise
export default function NearYou({ items, services }: NearYouProps) {
  const { hasLocation, locationName, radiusKm } = useLocation();
  const [tab, setTab] = useState<Tab>(items.length === 0 && services.length > 0 ? "services" : "items");

  const isEmpty = items.length === 0 && services.length === 0;
  // Without a location there's nothing useful to say about an empty feed, so the section hides
  if (isEmpty && !hasLocation) return null;

  const shown = tab === "items" ? items : services;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
              {hasLocation ? `Near you in ${locationName}` : `Fresh on ${BRAND.name}`}
            </h2>
            <p className="mt-1 text-[13px] text-gray-500">
              {hasLocation
                ? `Listings within ${radiusKm} km, closest first.`
                : "The newest listings from your community."}
            </p>
          </div>
          {!isEmpty && (
            <Link
              href={`/browse/${tab}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 hover:underline"
            >
              {hasLocation ? "See everything nearby" : "See everything"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {isEmpty ? (
          <NothingNearby
            noun="listings"
            createHref="/dashboard/listings/create"
            createLabel="Be the first to list something"
          />
        ) : (
          <>
            <div role="tablist" aria-label="Listing type" className="mb-4 inline-grid grid-flow-col rounded-xl bg-earth-100 p-1">
              {(["items", "services"] as Tab[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {key} ({key === "items" ? items.length : services.length})
                </button>
              ))}
            </div>

            {shown.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                {tab === "items"
                  ? items.map((listing) => <ListingCard key={listing.id} listing={listing} />)
                  : services.map((service) => <ServiceCard key={service.id} service={service} />)}
              </div>
            ) : (
              <p className="py-8 text-center text-[13px] text-gray-500">
                No {tab} {hasLocation ? "nearby" : "yet"}.{" "}
                <Link
                  href={tab === "items" ? "/dashboard/listings/create" : "/dashboard/services/create"}
                  className="font-bold text-primary-600 hover:underline"
                >
                  {tab === "items" ? "List an item" : "Offer a service"}
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

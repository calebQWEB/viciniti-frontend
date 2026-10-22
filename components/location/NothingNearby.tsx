"use client";

import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { RADIUS_OPTIONS } from "@/store/locationStore";

interface NothingNearbyProps {
  // What was searched for, e.g. "items" or "services"
  noun: string;
  // Optional call to action, e.g. inviting the visitor to list something
  createHref?: string;
  createLabel?: string;
}

// Empty state for location-filtered results: offers a wider radius or everywhere
export default function NothingNearby({ noun, createHref, createLabel }: NothingNearbyProps) {
  const { locationName, radiusKm, setRadiusKm, clearLocation } = useLocation();
  const widerRadius = RADIUS_OPTIONS.find((radius) => radius > radiusKm);

  return (
    <div className="text-center py-10 sm:py-14 lg:py-16">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-primary-400" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
        No {noun} within {radiusKm} km of {locationName} yet
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-5">
        {BRAND.name} is still growing in your area. Look a little further out, or see everything.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {widerRadius && (
          <button
            onClick={() => setRadiusKm(widerRadius)}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-all"
          >
            Widen to {widerRadius} km
          </button>
        )}
        <button
          onClick={clearLocation}
          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-earth-200 hover:border-primary-300 text-gray-700 text-sm font-bold rounded-xl transition-all"
        >
          Show everywhere
        </button>
        {createHref && createLabel && (
          <Link
            href={createHref}
            className="w-full sm:w-auto px-5 py-2.5 text-primary-600 hover:underline text-sm font-bold"
          >
            {createLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

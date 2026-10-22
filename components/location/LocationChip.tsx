"use client";

import { MapPin } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

export default function LocationChip() {
  const { locationName, radiusKm, hasLocation, isReady, openDialog } = useLocation();
  const showLocation = isReady && hasLocation;

  return (
    <button
      onClick={openDialog}
      title={showLocation ? `Within ${radiusKm} km of ${locationName}` : "Set your location"}
      className={`flex items-center gap-1 max-w-[150px] sm:max-w-[220px] px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
        showLocation
          ? "border-earth-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
          : "border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-400"
      }`}
    >
      <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
      <span className="truncate">{showLocation ? locationName : "Set location"}</span>
      {showLocation && (
        <span className="hidden sm:inline shrink-0 text-gray-400">· {radiusKm} km</span>
      )}
    </button>
  );
}

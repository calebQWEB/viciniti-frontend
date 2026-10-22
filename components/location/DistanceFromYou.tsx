"use client";

import { useLocation } from "@/hooks/useLocation";
import { distanceKm } from "@/lib/geo";
import { formatDistance } from "@/lib/utils";

interface DistanceFromYouProps {
  latitude?: number | null;
  longitude?: number | null;
}

// "2.3 km from you" badge; renders nothing unless both sides have coordinates
export default function DistanceFromYou({ latitude, longitude }: DistanceFromYouProps) {
  const { latitude: myLat, longitude: myLng, hasLocation, isReady } = useLocation();
  if (!isReady || !hasLocation || latitude == null || longitude == null) return null;

  const km = distanceKm(myLat!, myLng!, latitude, longitude);
  return (
    <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700">
      {formatDistance(km).replace("away", "from you")}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { MapPin, Loader2 } from "lucide-react";

interface LocationPickerProps {
  location: string;
  latitude: number | null;
  longitude: number | null;
  onChange: (
    location: string,
    latitude: number | null,
    longitude: number | null,
  ) => void;
}

export default function LocationPicker({
  location,
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const { detectLocation } = useLocation();
  const [detecting, setDetecting] = useState(false);

  const handleDetect = async () => {
    setDetecting(true);

    // Wrap detectLocation in a promise so we can await it
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await response.json();
          const locationName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Unknown location";

          // Update both the store and the form
          onChange(locationName, latitude, longitude);
          resolve();
        },
        (error) => {
          console.error("Location error:", error);
          resolve();
        },
      );
    });

    setDetecting(false);
  };

  return (
    <div className="space-y-2">
      {/* Manual text input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => onChange(e.target.value, latitude, longitude)}
          placeholder="Enter your location"
          className="input pl-9 w-full"
        />
      </div>

      {/* Detect button */}
      <button
        type="button"
        onClick={handleDetect}
        disabled={detecting}
        className="flex items-center gap-2 text-sm text-[#2D6A4F] hover:underline disabled:opacity-50"
      >
        {detecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        {detecting ? "Detecting..." : "Use my current location"}
      </button>

      {/* Confirmation — show coordinates once detected */}
      {latitude && longitude && (
        <p className="text-xs text-gray-400">
          Coordinates captured ({latitude.toFixed(4)}, {longitude.toFixed(4)})
        </p>
      )}
    </div>
  );
}

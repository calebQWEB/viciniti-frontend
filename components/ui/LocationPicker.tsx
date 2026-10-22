"use client";

import { useState } from "react";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { detectCurrentLocation, Place } from "@/lib/geo";
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
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only search while the user is typing, not for a saved value loaded into an edit form
  const [isTyping, setIsTyping] = useState(false);
  const { results, isSearching } = usePlaceSearch(isTyping ? location : "");

  const hasCoordinates = latitude !== null && longitude !== null;

  const handleDetect = async () => {
    setDetecting(true);
    setError(null);
    try {
      const place = await detectCurrentLocation();
      onChange(place.name, place.latitude, place.longitude);
      setIsTyping(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetecting(false);
    }
  };

  const handlePick = (place: Place) => {
    onChange(place.name, place.latitude, place.longitude);
    setIsTyping(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => {
            // Free text has no coordinates until a suggestion is picked
            onChange(e.target.value, null, null);
            setIsTyping(true);
          }}
          onBlur={() => setIsTyping(false)}
          placeholder="Search for your area"
          className="input pl-9 w-full"
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}

        {isTyping && results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-white border border-earth-200 rounded-2xl shadow-lg divide-y divide-gray-100 overflow-hidden">
            {results.map((place) => (
              <li key={place.detail ?? `${place.latitude},${place.longitude}`}>
                <button
                  type="button"
                  // Fire before the input's blur hides the list
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePick(place);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-900">{place.name}</p>
                  {place.detail && (
                    <p className="text-[11px] text-gray-400 truncate">{place.detail}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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

      {error && <p className="text-xs text-red-600">{error}</p>}

      {hasCoordinates ? (
        <p className="text-xs text-gray-400">
          Location pinned ({latitude.toFixed(4)}, {longitude.toFixed(4)})
        </p>
      ) : (
        location.trim() && (
          <p className="text-xs text-amber-600">
            Pick a suggestion from the list so people nearby can find this.
          </p>
        )
      )}
    </div>
  );
}

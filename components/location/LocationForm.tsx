"use client";

import { useState } from "react";
import { Loader2, LocateFixed, Search } from "lucide-react";
import { usePlaceSearch } from "@/hooks/usePlaceSearch";
import { detectCurrentLocation, Place } from "@/lib/geo";
import { LocationSource } from "@/store/locationStore";

interface LocationFormProps {
  onPick: (place: Place, source: LocationSource) => void;
}

// "Use my current location" plus area search; shared by the location dialog and the welcome flow
export default function LocationForm({ onPick }: LocationFormProps) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { results, isSearching } = usePlaceSearch(query);

  const handleDetect = async () => {
    setDetecting(true);
    setError(null);
    try {
      const place = await detectCurrentLocation();
      onPick(place, "device");
      setQuery("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetecting(false);
    }
  };

  const handlePick = (place: Place) => {
    onPick(place, "search");
    setQuery("");
    setError(null);
  };

  const showNoResults =
    query.trim().length >= 3 && !isSearching && results.length === 0;

  return (
    <div>
      <button
        type="button"
        onClick={handleDetect}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-60"
      >
        {detecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LocateFixed className="w-4 h-4" />
        )}
        {detecting ? "Finding you..." : "Use my current location"}
      </button>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          or search for your area
        </span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Yaba, Lekki Phase 1, Wuse 2"
          className="input pl-9 text-sm"
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-2 border border-earth-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
          {results.map((place) => (
            <li key={place.detail ?? `${place.latitude},${place.longitude}`}>
              <button
                type="button"
                onClick={() => handlePick(place)}
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

      {showNoResults && (
        <p className="mt-2 text-xs text-gray-500">
          No areas found. Try a nearby landmark or the city name.
        </p>
      )}
    </div>
  );
}

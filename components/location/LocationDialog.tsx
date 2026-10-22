"use client";

import { useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { RADIUS_OPTIONS } from "@/store/locationStore";
import LocationForm from "./LocationForm";

interface LocationDialogProps {
  onClose: () => void;
}

export default function LocationDialog({ onClose }: LocationDialogProps) {
  const {
    locationName,
    radiusKm,
    hasLocation,
    setLocation,
    setRadiusKm,
    clearLocation,
  } = useLocation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-dialog-title"
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 bg-primary-50 rounded-2xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2
                id="location-dialog-title"
                className="text-lg font-black text-gray-900 tracking-tight"
              >
                {hasLocation ? "Your location" : "Where are you?"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                We&apos;ll show you items and services nearby.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasLocation && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-3 text-sm">
            <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
            <span className="text-gray-600">Showing results near</span>
            <span className="font-bold text-gray-900 truncate">
              {locationName}
            </span>
          </div>
        )}

        <LocationForm
          onPick={(place, source) =>
            setLocation(place.latitude, place.longitude, place.name, source)
          }
        />

        {hasLocation && (
          <div className="mt-5">
            <p className="text-xs font-bold text-gray-700 mb-2">Show results within</p>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((radius) => (
                <button
                  key={radius}
                  onClick={() => setRadiusKm(radius)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    radiusKm === radius
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-white text-gray-600 border border-earth-200 hover:border-primary-300"
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {hasLocation ? (
            <>
              <button
                onClick={() => {
                  clearLocation();
                  onClose();
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Show everywhere
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-2xl transition-all"
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

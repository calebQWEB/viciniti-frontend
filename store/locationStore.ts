import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationSource = "device" | "search" | "profile";

export const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
export const DEFAULT_RADIUS_KM = 25;

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  radiusKm: number;
  source: LocationSource | null;
  // True once the visitor has seen the location dialog (or we filled it from their profile)
  hasBeenAsked: boolean;
  // True once the saved location has been loaded from localStorage
  hasHydrated: boolean;
  isDialogOpen: boolean;
  setLocation: (lat: number, lng: number, name: string, source: LocationSource) => void;
  setRadiusKm: (radius: number) => void;
  clearLocation: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      locationName: null,
      radiusKm: DEFAULT_RADIUS_KM,
      source: null,
      hasBeenAsked: false,
      hasHydrated: false,
      isDialogOpen: false,
      setLocation: (lat, lng, name, source) =>
        set({
          latitude: lat,
          longitude: lng,
          locationName: name,
          source,
          hasBeenAsked: true,
        }),
      setRadiusKm: (radius) => set({ radiusKm: radius }),
      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          locationName: null,
          source: null,
        }),
      openDialog: () => set({ isDialogOpen: true }),
      closeDialog: () => set({ isDialogOpen: false, hasBeenAsked: true }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "junction-location",
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        locationName: state.locationName,
        radiusKm: state.radiusKm,
        source: state.source,
        hasBeenAsked: state.hasBeenAsked,
      }),
      // Rehydrated by LocationGate after mount, so the server and first client render match
      skipHydration: true,
    },
  ),
);

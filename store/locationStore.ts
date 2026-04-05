import { create } from "zustand";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  radiusKm: number;
  setLocation: (lat: number, lng: number, name: string) => void;
  setRadiusKm: (radius: number) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  locationName: null,
  radiusKm: 50,
  setLocation: (lat, lng, name) =>
    set({
      latitude: lat,
      longitude: lng,
      locationName: name,
    }),
  setRadiusKm: (radius) => set({ radiusKm: radius }),
  clearLocation: () =>
    set({
      latitude: null,
      longitude: null,
      locationName: null,
    }),
}));

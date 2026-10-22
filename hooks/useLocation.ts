import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

/** Load the saved location from localStorage once, after mount (keeps server and first client render identical). */
export const useHydrateLocation = () => {
  const setHasHydrated = useLocationStore((state) => state.setHasHydrated);

  useEffect(() => {
    if (useLocationStore.getState().hasHydrated) return;
    Promise.resolve(useLocationStore.persist.rehydrate()).then(() =>
      setHasHydrated(true),
    );
  }, [setHasHydrated]);
};

export const useLocation = () => {
  const {
    latitude,
    longitude,
    locationName,
    radiusKm,
    source,
    hasHydrated,
    setLocation,
    setRadiusKm,
    clearLocation,
    openDialog,
  } = useLocationStore();

  const hasLocation = latitude !== null && longitude !== null;

  // Query params for the nearby-aware endpoints; empty means "everywhere"
  const nearbyParams = hasLocation
    ? { latitude, longitude, radius_km: radiusKm }
    : {};

  return {
    latitude,
    longitude,
    locationName,
    radiusKm,
    source,
    hasLocation,
    // Don't query until the saved location has loaded, or results flash from "everywhere" to "nearby"
    isReady: hasHydrated,
    nearbyParams,
    setLocation,
    setRadiusKm,
    clearLocation,
    openDialog,
  };
};

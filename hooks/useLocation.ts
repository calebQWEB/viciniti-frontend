import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

export const useLocation = () => {
  const {
    latitude,
    longitude,
    locationName,
    radiusKm,
    setLocation,
    setRadiusKm,
    clearLocation,
  } = useLocationStore();

  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get location name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        const data = await response.json();
        const locationName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown location";

        setLocation(latitude, longitude, locationName);
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  };

  return {
    latitude,
    longitude,
    locationName,
    radiusKm,
    detectLocation,
    setLocation,
    setRadiusKm,
    clearLocation,
  };
};

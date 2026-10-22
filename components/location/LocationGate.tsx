"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { useHydrateLocation } from "@/hooks/useLocation";
import LocationDialog from "./LocationDialog";

// Loads the saved location, fills it from the user's profile or asks on first visit,
// and renders the one shared location dialog.
export default function LocationGate() {
  const { user, isLoading: authLoading } = useAuthStore();
  const {
    hasHydrated,
    hasBeenAsked,
    isDialogOpen,
    setLocation,
    openDialog,
    closeDialog,
  } = useLocationStore();

  useHydrateLocation();

  useEffect(() => {
    // Wait for the saved location and the logged-in user before deciding anything
    if (!hasHydrated || authLoading || hasBeenAsked) return;

    if (user?.latitude != null && user?.longitude != null) {
      setLocation(user.latitude, user.longitude, user.location || "Your area", "profile");
    } else {
      openDialog();
    }
  }, [hasHydrated, authLoading, hasBeenAsked, user, setLocation, openDialog]);

  return isDialogOpen ? <LocationDialog onClose={closeDialog} /> : null;
}

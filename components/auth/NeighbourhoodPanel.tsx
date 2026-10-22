"use client";

import { BRAND } from "@/lib/brand";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ShieldCheck, Users } from "lucide-react";
import api from "@/lib/api";
import { useHydrateLocation, useLocation } from "@/hooks/useLocation";
import NeighbourhoodMap, { MapListing } from "@/components/location/NeighbourhoodMap";

const VALUE_POINTS = [
  {
    icon: MapPin,
    title: "Nearby first",
    description: "See what's around the corner before anything else.",
  },
  {
    icon: ShieldCheck,
    title: "Paid safely",
    description: "Money is held until both sides confirm the deal is done.",
  },
  {
    icon: Users,
    title: "Real neighbours",
    description: "Profiles and reviews from people in your area.",
  },
];

// Marketing panel for the auth pages: a stylised map with real nearby listings
export default function NeighbourhoodPanel({ headline }: { headline: string }) {
  useHydrateLocation();
  const { isReady, nearbyParams } = useLocation();

  const { data: featured } = useQuery({
    // The limit is part of the key: the home page fetches a different number
    queryKey: ["home-featured", 3, nearbyParams],
    queryFn: async () => {
      const response = await api.get("/home/featured", {
        params: { limit: 3, ...nearbyParams },
      });
      return response.data as { items: MapListing[] };
    },
    enabled: isReady,
  });

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const response = await api.get("/home/stats");
      return response.data as { active_listings: number; total_users: number };
    },
  });

  const listings = featured?.items?.slice(0, 3) ?? [];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-primary-700 text-white">
      {/* Map */}
      <div className="relative flex-1 min-h-[320px]">
        <NeighbourhoodMap listings={listings} />
      </div>

      {/* Copy */}
      <div className="relative px-10 pb-10 xl:px-14 xl:pb-14">
        <h2 className="max-w-md text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
          {headline}
        </h2>

        <ul className="mt-6 space-y-3.5">
          {VALUE_POINTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-4 w-4 text-primary-200" />
              </span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-sm text-primary-100/80">{description}</p>
              </div>
            </li>
          ))}
        </ul>

        {stats && stats.active_listings > 0 && (
          <p className="mt-6 text-xs font-semibold text-primary-200">
            {stats.active_listings} live listing{stats.active_listings !== 1 ? "s" : ""} ·{" "}
            {stats.total_users} neighbour{stats.total_users !== 1 ? "s" : ""} on {BRAND.name}
          </p>
        )}
      </div>
    </div>
  );
}

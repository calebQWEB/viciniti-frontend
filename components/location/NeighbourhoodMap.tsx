import Image from "next/image";
import { MapPin, ShoppingBag } from "lucide-react";
import { formatDistance, formatPrice } from "@/lib/utils";
import StreetPattern from "./StreetPattern";

export interface MapListing {
  id: string;
  title: string;
  price: number;
  images: { url: string; public_id: string }[];
  distance_km?: number | null;
}

interface NeighbourhoodMapProps {
  // Up to three real listings to float on the map; with none, only pins show
  listings: MapListing[];
  // e.g. "25 km around you"; draws the dashed radius ring when set
  radiusLabel?: string;
}

// Where the floating listing cards sit on the map
const CARD_POSITIONS = [
  "top-[10%] left-[7%] -rotate-3",
  "top-[32%] right-[5%] rotate-2",
  "bottom-[12%] left-[14%] -rotate-1",
];

// Map pins that are always shown, even before there are any listings
const PIN_POSITIONS = [
  "top-[22%] left-[62%]",
  "top-[56%] left-[9%]",
  "top-[70%] left-[72%]",
  "top-[13%] left-[38%]",
];

// Stylised neighbourhood map: street grid, "you are here", optional radius ring and real listings.
// Fills its parent, which sets the size and background.
export default function NeighbourhoodMap({ listings, radiusLabel }: NeighbourhoodMapProps) {
  return (
    <div className="absolute inset-0 text-white">
      <StreetPattern roads />

      {radiusLabel && (
        <>
          <div
            aria-hidden="true"
            className="absolute top-[44%] left-[48%] w-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-white/25"
          />
          <span className="absolute top-[15%] left-[48%] -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-900/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/75">
            {radiusLabel}
          </span>
        </>
      )}

      {PIN_POSITIONS.map((position) => (
        <MapPin
          key={position}
          aria-hidden="true"
          className={`absolute h-5 w-5 text-primary-300/70 ${position}`}
        />
      ))}

      {/* You are here */}
      <div className="absolute top-[44%] left-[48%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <span className="absolute -inset-3 rounded-full bg-accent-400/40 animate-ping motion-reduce:animate-none" />
        <span className="relative block h-4 w-4 rounded-full border-[3px] border-white bg-accent-500 shadow-lg" />
      </div>

      {listings.slice(0, 3).map((listing, i) => (
        <div
          key={listing.id}
          className={`absolute w-44 sm:w-48 rounded-2xl bg-white p-2.5 text-gray-900 shadow-2xl shadow-primary-900/40 ${CARD_POSITIONS[i]}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-earth-100">
              {listing.images?.[0]?.url ? (
                <Image src={listing.images[0].url} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <ShoppingBag className="absolute inset-0 m-auto h-5 w-5 text-earth-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{listing.title}</p>
              <p className="text-xs font-black text-primary-600">{formatPrice(listing.price)}</p>
              {listing.distance_km != null && (
                <p className="text-[10px] font-semibold text-gray-500">
                  {formatDistance(listing.distance_km)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

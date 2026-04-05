import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/types/listing";
import { formatPrice, truncateText } from "@/lib/utils";
import { MapPin, ShoppingBag } from "lucide-react";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/item/${listing.id}`}>
      <div className="card group cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-earth-100 overflow-hidden rounded-t-3xl">
          {listing.images && listing.images.length > 0 ? (
            <Image
              src={listing.images[0].url}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-earth-300" />
            </div>
          )}

          {/* Status badge */}
          {listing.status === "sold" && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              SOLD
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">
            {listing.category}
          </p>
          <h3 className="font-bold text-gray-900 mb-1">
            {truncateText(listing.title, 40)}
          </h3>
          <p className="text-xl font-bold text-primary-600 mb-2">
            {formatPrice(listing.price)}
          </p>
          {listing.location && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{truncateText(listing.location, 25)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

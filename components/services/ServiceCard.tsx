import Link from "next/link";
import Image from "next/image";
import { Service } from "@/types/service";
import { formatPrice, truncateText } from "@/lib/utils";
import { MapPin, Wrench } from "lucide-react";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/service/${service.id}`}>
      <div className="card group cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-earth-100 overflow-hidden rounded-t-3xl">
          {service.images && service.images.length > 0 ? (
            <Image
              src={service.images[0].url}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Wrench className="w-12 h-12 text-earth-300" />
            </div>
          )}

          {/* Status badge */}
          {service.status === "inactive" && (
            <div className="absolute top-3 left-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              INACTIVE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">
            {service.category}
          </p>
          <h3 className="font-bold text-gray-900 mb-1">
            {truncateText(service.title, 40)}
          </h3>
          <p className="text-xl font-bold text-primary-600 mb-2">
            {formatPrice(service.price)}
          </p>
          {service.location && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{truncateText(service.location, 25)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { CategoryItem, browseHref } from "./CategoryIcon";

type SearchType = "items" | "services";

// Search bar for the landing hero: sends the visitor to the browse page with ?q= set
export default function HeroSearch({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const { hasLocation, locationName, isReady, openDialog } = useLocation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("items");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(`/browse/${type}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <div>
      <form
        role="search"
        onSubmit={handleSubmit}
        className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-[22px] border border-primary-100 bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.03),0_22px_44px_-26px_rgba(29,77,56,0.45)]"
      >
        <label htmlFor="hero-search" className="flex min-w-0 flex-1 basis-full sm:basis-auto items-center gap-2.5 px-3">
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <span className="sr-only">Search {type}</span>
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={type === "items" ? "Search for a phone, a desk, a bike…" : "Search for a cleaner, a tutor, a plumber…"}
            autoComplete="off"
            className="w-full bg-transparent py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as SearchType)}
          aria-label="What to search"
          className="flex-1 sm:flex-none rounded-xl bg-earth-100 px-3 py-2.5 text-xs font-semibold text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <option value="items">Items</option>
          <option value="services">Services</option>
        </select>

        <button
          type="button"
          onClick={openDialog}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-earth-100 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-earth-200 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 text-primary-500" aria-hidden="true" />
          {isReady && hasLocation ? `Near ${locationName}` : "Set location"}
        </button>

        <button
          type="submit"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-600 transition-colors"
        >
          Search
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      {categories.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Browse:</span>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={browseHref(category)}
              className="rounded-full border border-earth-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-primary-300 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

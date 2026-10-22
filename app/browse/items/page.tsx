import { BRAND } from "@/lib/brand";
import BrowseItemsContentPage from "./BrowseItemsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Items",
  description:
    `Find great deals on items near you — electronics, fashion, furniture, vehicles and more. Buy locally on ${BRAND.name}.`,
  openGraph: {
    title: `Browse Items | ${BRAND.name}`,
    description: `Find great deals on items near you on ${BRAND.name}.`,
  },
};

export default async function BrowseItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  return <BrowseItemsContentPage initialCategory={category ?? ""} initialQuery={q ?? ""} />;
}

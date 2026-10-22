import { BRAND } from "@/lib/brand";
import BrowseServicesContentPage from "./BrowseServicesContentPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    `Hire trusted local service providers near you — cleaning, plumbing, tutoring, photography and more. Find help on ${BRAND.name}.`,
  openGraph: {
    title: `Browse Services | ${BRAND.name}`,
    description: `Hire trusted local service providers near you on ${BRAND.name}.`,
  },
};

export default async function BrowseServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  return <BrowseServicesContentPage initialCategory={category ?? ""} initialQuery={q ?? ""} />;
}

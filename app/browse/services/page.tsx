import BrowseServicesContentPage from "./BrowseServicesContentPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Hire trusted local service providers near you — cleaning, plumbing, tutoring, photography and more. Find help on Viciniti.",
  openGraph: {
    title: "Browse Services | Viciniti",
    description: "Hire trusted local service providers near you on Viciniti.",
  },
};

export default function BrowseServicesPage() {
  return <BrowseServicesContentPage />;
}

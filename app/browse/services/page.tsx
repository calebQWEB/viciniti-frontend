import BrowseItemsContentPage from "../items/BrowseItemsContent";
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

export default function BrowseItemsPage() {
  return <BrowseItemsContentPage />;
}

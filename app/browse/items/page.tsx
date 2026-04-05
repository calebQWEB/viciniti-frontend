import BrowseItemsContentPage from "./BrowseItemsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Items",
  description:
    "Find great deals on items near you — electronics, fashion, furniture, vehicles and more. Buy locally on Viciniti.",
  openGraph: {
    title: "Browse Items | Viciniti",
    description: "Find great deals on items near you on Viciniti.",
  },
};

export default function BrowseItemsPage() {
  return <BrowseItemsContentPage />;
}

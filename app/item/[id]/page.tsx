import type { Metadata } from "next";
import ItemDetail from "./ItemDetail";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/${params.id}`,
    );
    const listing = await response.json();

    return {
      title: listing.title,
      description: listing.description?.slice(0, 160),
      openGraph: {
        title: `${listing.title} | Viciniti`,
        description: listing.description?.slice(0, 160),
        images: listing.images?.[0]?.url
          ? [
              {
                url: listing.images[0].url,
                width: 800,
                height: 800,
                alt: listing.title,
              },
            ]
          : [],
      },
    };
  } catch {
    return {
      title: "Item Listing",
      description: "View this item for sale on Viciniti.",
    };
  }
}

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  return <ItemDetail />;
}

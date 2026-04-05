import type { Metadata } from "next";
import ServiceDetail from "./ServiceDetail";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/services/${params.id}`,
    );
    const service = await response.json();

    return {
      title: service.title,
      description: service.description?.slice(0, 160),
      openGraph: {
        title: `${service.title} | Viciniti`,
        description: service.description?.slice(0, 160),
        images: service.images?.[0]?.url
          ? [
              {
                url: service.images[0].url,
                width: 800,
                height: 800,
                alt: service.title,
              },
            ]
          : [],
      },
    };
  } catch {
    return {
      title: "Service",
      description: "View this service on Viciniti.",
    };
  }
}

export default function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ServiceDetail />;
}

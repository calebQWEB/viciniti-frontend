export type ListingStatus = "active" | "sold";

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category?: CategorySummary;
  images: ImageObject[];
  status: "active" | "sold";
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  // Only present when the request included a location
  distance_km?: number | null;
}

export interface ListingCreate {
  title: string;
  description: string;
  price: number;
  category_id: string;
  images?: ImageObject[];
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ImageObject {
  url: string;
  public_id: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  images: ImageObject[];
}

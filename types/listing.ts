export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: ImageObject[];
  status: "active" | "sold";
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface ListingCreate {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: ImageObject[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface ImageObject {
  url: string;
  public_id: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  images: ImageObject[];
}

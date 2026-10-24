import { ImageObject } from "./listing";

export type ServiceStatus = "active" | "inactive";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  location?: string;
  latitude?: number;
  longitude?: number;
  images: { url: string; public_id: string }[];
  status: ServiceStatus;
  user_id: string;
  created_at: string;
  // Set when an admin removed it; the seller can't edit it until it's restored
  removed_at?: string | null;
  removal_reason?: string | null;
  // Only present when the request included a location
  distance_km?: number | null;
  owner?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface ServiceCreate {
  title: string;
  description: string;
  price: number;
  category_id: string;
  images?: ImageObject[];
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

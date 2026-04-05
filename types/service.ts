import { ImageObject } from "./listing";

export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: ImageObject[];
  status: "active" | "inactive";
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface ServiceCreate {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: ImageObject[];
  location?: string;
  latitude?: number;
  longitude?: number;
}

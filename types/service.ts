import { ImageObject } from "./listing";

export type ServiceStatus = "active" | "inactive";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  images: { url: string; public_id: string }[];
  status: ServiceStatus;
  user_id: string;
  created_at: string;
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
  category: string;
  images?: ImageObject[];
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

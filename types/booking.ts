export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BookingUserSummary {
  id: string;
  name: string;
  avatar: string | null;
}

export interface BookingService {
  id: string;
  title: string;
  images: { url: string; public_id: string }[];
}

export interface Booking {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  order_id: string | null;
  amount: number;
  fee: number;
  scheduled_at: string;
  status: BookingStatus;
  created_at: string;
  service?: {
    id: string;
    title: string;
    images: { url: string; public_id: string }[];
  };
  client?: BookingUserSummary;
  provider?: BookingUserSummary;
}

export interface BookingCreate {
  service_id: string;
  scheduled_at: string;
}

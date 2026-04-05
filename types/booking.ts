export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  amount: number;
  fee: number;
  status: BookingStatus;
  scheduled_at: string;
  created_at: string;
}

export interface BookingCreate {
  service_id: string;
  scheduled_at: string;
}

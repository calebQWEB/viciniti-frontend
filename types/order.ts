export type OrderStatus = "pending" | "completed" | "cancelled" | "disputed";

export interface ListingInfo {
  id: string;
  title: string;
  images: { url: string; public_id: string }[];
}

export interface CompletionProof {
  photos: string[]; // Array of photo URLs
  notes: string | null;
  completed_at: string | null;
  buyer_accepted_at: string | null;
}

export interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  fee: number;
  status: OrderStatus;
  created_at: string;

  // Completion proof fields
  completion_photos: string[];
  completion_notes: string | null;
  completed_at: string | null;
  buyer_accepted_at: string | null;

  // Relationship fields
  listing?: ListingInfo;
  buyer?: {
    id: string;
    full_name: string;
    email: string;
  };
  seller?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface OrderCompletionPayload {
  photos: string[];
  notes: string;
}

export interface OrderConfirmationPayload {
  rating: number; // 1-5
  review: string;
}

export interface CompletionEvidence {
  order_id: string;
  service: string;
  amount: number;
  completion: {
    photos: string[];
    notes: string | null;
    completed_at: string | null;
    buyer_accepted_at: string | null;
    buyer_confirmed: boolean;
  };
}

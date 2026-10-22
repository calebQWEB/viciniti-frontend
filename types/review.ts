export interface Review {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

// A review as shown on a seller's public profile (no user or order IDs)
export interface PublicReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  // First name and last initial, e.g. "Tunde A."
  reviewer_name: string;
  kind: "bought" | "booked";
  subject_title: string;
}

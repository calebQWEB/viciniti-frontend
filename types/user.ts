export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  intent?: UserIntent | null;
  // Null until the user finishes or skips the welcome flow
  onboarded_at?: string | null;
}

export type UserIntent = "buy" | "sell" | "both";

// Another user's public profile (GET /users/{id}): no email, coordinates or onboarding fields
export interface PublicUser {
  id: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  // Area name only, e.g. "Ikeja"
  location?: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

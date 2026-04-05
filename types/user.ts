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
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

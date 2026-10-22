import api from "./api";
import { AuthResponse, User } from "@/types/user";

// Hidden until Google OAuth is wired up on the backend
export const GOOGLE_SIGN_IN_ENABLED = false;

// FastAPI error message from a failed request, if it's a readable string
export const apiErrorDetail = (err: unknown): string | null => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : null;
};

// Where to send a user right after they sign in
export const postLoginPath = (user: User): string =>
  user.onboarded_at ? "/dashboard" : "/welcome";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", { email, password });
  const data: AuthResponse = response.data;
  localStorage.setItem("access_token", data.access_token);
  return data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("access_token");
  window.location.href = "login";
};

export const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

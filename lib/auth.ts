import api from "./api";
import { AuthResponse, User } from "@/types/user";

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

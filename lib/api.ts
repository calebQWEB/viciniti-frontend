import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://viciniti-backend-production.up.railway.app";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The API's message when a logged-in user's account gets suspended (see app/services/suspension.py)
export const SUSPENDED_PREFIX = "This account has been suspended";

// Handle expired token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    // The login form shows this message itself, reason included
    const isLogin = error.config?.url === "/auth/login";
    if (
      error.response?.status === 403 &&
      !isLogin &&
      typeof detail === "string" &&
      detail.startsWith(SUSPENDED_PREFIX)
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/login?notice=suspended";
      // Never settles, so no caller's error handling redirects somewhere else first
      return new Promise(() => {});
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

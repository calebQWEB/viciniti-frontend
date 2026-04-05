import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    setIsLoading,
    logout,
  } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isAuthenticated, isLoading, logout };
};

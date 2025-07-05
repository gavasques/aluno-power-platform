
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isAdmin = user?.role === "admin";
  const isSupport = user?.role === "support";
  const hasAdminAccess = isAdmin || isSupport;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isSupport,
    hasAdminAccess
  };
}

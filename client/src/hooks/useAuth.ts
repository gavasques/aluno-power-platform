
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity, // Never consider stale to prevent refetches
    gcTime: Infinity, // Keep in cache forever
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
    hasAdminAccess,
    error
  };
}

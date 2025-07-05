
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once to avoid loops
    if (hasChecked) return;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setHasChecked(true);
      }
    };

    checkAuth();
  }, [hasChecked]);

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

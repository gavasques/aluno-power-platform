import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Enhanced useAuth hook that provides authentication state and helper methods
 * Replaces the previous mock implementation with proper authentication
 */
export const useAuth = () => {
  const auth = useAuthContext();
  
  const isAdmin = auth.user?.role === "admin";
  const isSupport = auth.user?.role === "support";
  const hasAdminAccess = isAdmin || isSupport;

  return {
    // Core auth state
    user: auth.user,
    token: auth.token,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    
    // Actions
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    
    // Helper methods
    isAdmin,
    isSupport,
    hasAdminAccess
  };
};

import { useAuth as useAuthContext } from '@/contexts/UserContext';

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
const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'USER_NOT_FOUND') {
        console.log('🔄 [AUTH] Token expired or user not found, logging out');
        logout();
        return;
      }
    }
    console.error('API Error:', error);
  };
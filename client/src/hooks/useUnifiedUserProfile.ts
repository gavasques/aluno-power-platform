/**
 * Unified User Profile Hook
 * Consolidates all user data fetching to prevent duplicate API calls
 * and implement strategic caching for user profile and credits
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  credits: string | number;
  subscription?: any;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  groupNames?: string[];
}

interface UserProfileResponse {
  user: User;
}

interface ProcessedUserData {
  user: User;
  credits: {
    current: number;
    balance: number;
  };
  subscription: any;
}

export function useUnifiedUserProfile() {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery<UserProfileResponse, Error, ProcessedUserData>({
    queryKey: ['/api/auth/me'],
    enabled: !!user && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false, // Don't refetch on every focus
    select: (data: UserProfileResponse): ProcessedUserData => {
      const creditValue = parseFloat(data?.user?.credits?.toString() || '0');
      return {
        user: data.user,
        credits: {
          current: creditValue,
          balance: creditValue
        },
        subscription: data.user?.subscription
      };
    }
  });
}

/**
 * Optimized hook for credit balance only
 * Uses the unified profile query with selective data
 */
export function useOptimizedUserCredits() {
  const { data, isLoading, error } = useUnifiedUserProfile();
  
  return {
    credits: {
      current: data?.credits?.current || 0,
      totalEarned: 0, // These would need separate API if needed
      totalSpent: 0,
      usageThisMonth: '0'
    },
    isLoading,
    error
  };
}

/**
 * Hook for credit balance only - optimized version
 */
export function useOptimizedUserCreditBalance() {
  const { data, isLoading, error } = useUnifiedUserProfile();
  
  return {
    balance: data?.credits?.balance || 0,
    isLoading,
    error
  };
}

/**
 * Hook to get user profile data only
 */
export function useUserProfile() {
  const { data, isLoading, error } = useUnifiedUserProfile();
  
  return {
    user: data?.user,
    isLoading,
    error
  };
}
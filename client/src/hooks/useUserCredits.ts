/**
 * @deprecated Use useOptimizedUserCredits from useUnifiedUserProfile instead
 * This hook now delegates to the optimized unified approach to prevent duplicate API calls
 */
import { useOptimizedUserCredits, useOptimizedUserCreditBalance } from './useUnifiedUserProfile';

interface UserCreditsData {
  current: number;
  totalEarned: number;
  totalSpent: number;
  usageThisMonth: string;
}

interface UserCreditsResponse {
  credits: UserCreditsData;
}

/**
 * @deprecated Use useOptimizedUserCredits instead
 * Legacy wrapper for backward compatibility
 */
export function useUserCredits(): { data: UserCreditsResponse | undefined; isLoading: boolean; error: any } {
  const { credits, isLoading, error } = useOptimizedUserCredits();
  
  return {
    data: credits ? { credits } : undefined,
    isLoading,
    error
  };
}

/**
 * @deprecated Use useOptimizedUserCreditBalance instead
 * Legacy wrapper for backward compatibility
 */
export function useUserCreditBalance(): {
  balance: number;
  isLoading: boolean;
  error: any;
} {
  return useOptimizedUserCreditBalance();
}
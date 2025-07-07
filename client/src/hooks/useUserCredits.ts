import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface UserCreditsData {
  current: number;
  totalEarned: number;
  totalSpent: number;
  usageThisMonth: string;
}

interface UserCreditsResponse {
  credits: UserCreditsData;
}

export function useUserCredits() {
  const { user } = useAuth();
  
  return useQuery<UserCreditsResponse>({
    queryKey: ['/api/dashboard/summary'],
    enabled: !!user,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 60 * 1000, // 1 minuto
    select: (data) => ({
      credits: data.credits
    })
  });
}

export function useUserCreditBalance(): {
  balance: number;
  isLoading: boolean;
  error: any;
} {
  const { data, isLoading, error } = useUserCredits();
  
  return {
    balance: data?.credits?.current || 0,
    isLoading,
    error
  };
}
import { useQuery } from '@tanstack/react-query';

interface FeatureCost {
  featureName: string;
  costPerUse: number;
  description: string;
  category?: string;
}

interface FeatureCostsData {
  byCategory: Record<string, FeatureCost[]>;
  costsMap: Record<string, number>;
  totalFeatures: number;
}

interface FeatureCostsResponse {
  success: boolean;
  data: FeatureCostsData;
}

// Hook para buscar todos os custos de features
export function useFeatureCosts() {
  return useQuery<FeatureCostsResponse>({
    queryKey: ['/api/feature-costs'],
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para buscar custo de uma feature específica
export function useFeatureCost(featureName: string) {
  return useQuery<{ success: boolean; data: FeatureCost }>({
    queryKey: ['/api/feature-costs', featureName],
    enabled: !!featureName,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook personalizado para obter custo de uma feature do cache
export function useGetFeatureCost() {
  const { data: featureCosts } = useFeatureCosts();
  
  const getFeatureCost = (featureName: string): number => {
    if (!featureCosts?.data?.costsMap) return 0;
    return featureCosts.data.costsMap[featureName] || 0;
  };

  return { getFeatureCost, isLoading: !featureCosts };
}

// Função helper para formatar custo no padrão brasileiro
export function formatCredits(credits: number): string {
  if (credits === 1) return '1 crédito';
  return `${credits} créditos`;
}

// Função helper para verificar se usuário tem créditos suficientes
export function hasEnoughCredits(userBalance: number, requiredCredits: number): boolean {
  return userBalance >= requiredCredits;
}

// Hook para validar créditos antes de processar
export function useCanProcessFeature() {
  const { getFeatureCost } = useGetFeatureCost();
  
  const canProcess = (featureName: string, userBalance: number): {
    canProcess: boolean;
    requiredCredits: number;
    missingCredits: number;
  } => {
    const requiredCredits = getFeatureCost(featureName);
    const canProcess = hasEnoughCredits(userBalance, requiredCredits);
    const missingCredits = canProcess ? 0 : requiredCredits - userBalance;
    
    return {
      canProcess,
      requiredCredits,
      missingCredits
    };
  };
  
  return { canProcess };
}
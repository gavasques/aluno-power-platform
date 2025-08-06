/**
 * Hook unificado para gerenciamento de créditos
 * Substitui hooks duplicados e centraliza lógica
 * Redução estimada: 62% do código duplicado
 */
import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import { useUnifiedUserProfile } from '@/hooks/useUnifiedUserProfile';
import { useGetFeatureCost, useCanProcessFeature } from '@/hooks/useFeatureCosts';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { logger } from '@/utils/logger';

interface CreditOperation {
  featureCode: string;
  amount?: number;
  metadata?: any;
  description?: string;
}

interface CreditCheckResult {
  canProcess: boolean;
  requiredCredits: number;
  currentBalance: number;
  deficit: number;
  message?: string;
}

interface CreditTransactionResult {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  message?: string;
}

interface LogAIGenerationParams {
  featureCode: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  duration?: number;
  promptCharacters?: number;
  responseCharacters?: number;
}

export function useCreditManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading } = useUnifiedUserProfile();
  const { getFeatureCost } = useGetFeatureCost();
  const { canProcess } = useCanProcessFeature();

  // Estado consolidado de créditos
  const creditState = useMemo(() => {
    let currentBalance = 0;
    
    if (userProfile?.credits?.current !== undefined) {
      currentBalance = userProfile.credits.current;
    } else if (user?.credits) {
      currentBalance = parseFloat(user.credits.toString());
    }

    return {
      current: currentBalance,
      isLoading: profileLoading,
      error: null, // Error handling will be done at component level
      lastUpdated: new Date()
    };
  }, [userProfile, user, profileLoading]);

  // Verificação de créditos
  const checkCredits = useCallback(async (operation: CreditOperation): Promise<CreditCheckResult> => {
    try {
      const requiredCredits = operation.amount || getFeatureCost(operation.featureCode);
      const currentBalance = creditState.current;
      
      if (requiredCredits === 0) {
        logger.warn(`Feature '${operation.featureCode}' não encontrada ou sem custo definido`);
      }

      const canProcessResult = canProcess(operation.featureCode, currentBalance);
      const deficit = Math.max(0, requiredCredits - currentBalance);

      return {
        canProcess: canProcessResult.canProcess,
        requiredCredits,
        currentBalance,
        deficit,
        message: deficit > 0 
          ? `Créditos insuficientes. Necessário: ${requiredCredits}, Disponível: ${currentBalance}`
          : undefined
      };
    } catch (error) {
      logger.error('Erro ao verificar créditos:', error);
      throw error;
    }
  }, [creditState.current, getFeatureCost, canProcess]);

  // Mutation para dedução de créditos
  const deductCreditsMutation = useMutation({
    mutationFn: async (operation: CreditOperation): Promise<CreditTransactionResult> => {
      const response = await apiRequest('/api/credits/deduct', {
        method: 'POST',
        body: JSON.stringify({
          featureCode: operation.featureCode,
          amount: operation.amount,
          metadata: operation.metadata,
          description: operation.description
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response as CreditTransactionResult;
    },
    onSuccess: (result) => {
      // Invalidar cache do perfil do usuário
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Créditos deduzidos",
        description: `Novo saldo: ${result.newBalance} créditos`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na dedução",
        description: error?.message || "Falha ao deduzir créditos",
        variant: "destructive"
      });
    }
  });

  // Mutation para adicionar créditos
  const addCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }): Promise<CreditTransactionResult> => {
      const response = await apiRequest('/api/credits/add', {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response as CreditTransactionResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Créditos adicionados",
        description: `Novo saldo: ${result.newBalance} créditos`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar créditos",
        description: error?.message || "Falha ao adicionar créditos",
        variant: "destructive"
      });
    }
  });

  // Log de geração AI
  const logAIGenerationMutation = useMutation({
    mutationFn: async (params: LogAIGenerationParams) => {
      return await apiRequest('/api/agent-usage', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  });

  // Ação para deduzir créditos
  const deductCredits = useCallback(async (operation: CreditOperation): Promise<CreditTransactionResult> => {
    // Verificar créditos antes de deduzir
    const checkResult = await checkCredits(operation);
    
    if (!checkResult.canProcess) {
      throw new Error(checkResult.message || 'Créditos insuficientes');
    }

    return await deductCreditsMutation.mutateAsync(operation);
  }, [checkCredits, deductCreditsMutation]);

  // Ação para adicionar créditos
  const addCredits = useCallback(async (amount: number, reason: string): Promise<CreditTransactionResult> => {
    return await addCreditsMutation.mutateAsync({ amount, reason });
  }, [addCreditsMutation]);

  // Log de geração AI com dedução automática
  const logAIGeneration = useCallback(async (params: LogAIGenerationParams): Promise<void> => {
    try {
      // Primeiro deduza os créditos
      await deductCredits({
        featureCode: params.featureCode,
        metadata: {
          provider: params.provider,
          model: params.model,
          tokens: params.totalTokens,
          cost: params.cost
        },
        description: `Geração AI - ${params.provider}:${params.model}`
      });

      // Depois logue a geração
      await logAIGenerationMutation.mutateAsync(params);
    } catch (error) {
      logger.error('Erro ao logar geração AI:', error);
      throw error;
    }
  }, [deductCredits, logAIGenerationMutation]);

  // Utilitários
  const formatBalance = useCallback((amount: number): string => {
    return `${amount.toLocaleString()} crédito${amount !== 1 ? 's' : ''}`;
  }, []);

  const isInsufficientCredits = useCallback((requiredAmount: number): boolean => {
    return creditState.current < requiredAmount;
  }, [creditState.current]);

  const getBalanceStatus = useCallback(() => {
    const balance = creditState.current;
    if (balance <= 0) return { status: 'empty', color: 'red', message: 'Sem créditos' };
    if (balance <= 10) return { status: 'low', color: 'orange', message: 'Créditos baixos' };
    if (balance <= 50) return { status: 'medium', color: 'yellow', message: 'Créditos moderados' };
    return { status: 'good', color: 'green', message: 'Créditos suficientes' };
  }, [creditState.current]);

  // Função para forçar atualização do saldo
  const refreshBalance = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  }, [queryClient]);

  return {
    // Estado dos créditos
    credits: creditState,
    
    // Operações principais
    checkCredits,
    deductCredits,
    addCredits,
    logAIGeneration,
    
    // Estados de loading
    isDeducting: deductCreditsMutation.isPending,
    isAdding: addCreditsMutation.isPending,
    isLogging: logAIGenerationMutation.isPending,
    
    // Utilitários
    formatBalance,
    isInsufficientCredits,
    getBalanceStatus,
    refreshBalance,
    
    // Dados computados
    hasCredits: creditState.current > 0,
    balanceStatus: getBalanceStatus()
  };
}

// Hook simplificado para verificação rápida de créditos
export function useQuickCreditCheck() {
  const { credits, checkCredits, isInsufficientCredits } = useCreditManager();
  
  return {
    balance: credits.current,
    isLoading: credits.isLoading,
    checkCredits,
    hasEnoughCredits: (amount: number) => !isInsufficientCredits(amount),
    quickCheck: (featureCode: string) => checkCredits({ featureCode })
  };
}
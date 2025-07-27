/**
 * Hook unificado para sistema de créditos
 * Previne inconsistências e duplicação de código
 */
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGetFeatureCost, useCanProcessFeature } from "@/hooks/useFeatureCosts";
import { logger } from "@/utils/logger";
import { queryClient } from "@/lib/queryClient";

interface CreditCheckResult {
  canProcess: boolean;
  requiredCredits: number;
  currentBalance: number;
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

export function useCreditSystem() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getFeatureCost } = useGetFeatureCost();
  const { canProcess } = useCanProcessFeature();

  /**
   * Verifica se o usuário tem créditos suficientes
   */
  const checkCredits = async (featureCode: string): Promise<CreditCheckResult> => {
    try {
      // Primeiro, tentar obter o saldo de créditos
      let currentBalance = 0;
      
      if (user?.credits) {
        // Se já temos o saldo no contexto do usuário
        currentBalance = parseFloat(user.credits.toString());
      } else {
        // Fazer requisição para obter dados atualizados
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const dashboardResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!dashboardResponse.ok) {
          throw new Error(`Erro HTTP ${dashboardResponse.status}: ${dashboardResponse.statusText}`);
        }

        const data = await dashboardResponse.json();
        currentBalance = parseFloat(data.user?.credits || '0');
      }

      // Obter custo da feature
      const requiredCredits = getFeatureCost(featureCode);
      if (requiredCredits === 0) {
        logger.warn(`Feature '${featureCode}' não encontrada ou sem custo definido`);
      }

      // Verificar se pode processar
      const canProcessResult = canProcess(featureCode, currentBalance);

      return {
        canProcess: canProcessResult.canProcess,
        requiredCredits: canProcessResult.requiredCredits,
        currentBalance,
        message: canProcessResult.canProcess 
          ? `✅ Créditos suficientes (${currentBalance})` 
          : `❌ Créditos insuficientes. Necessário: ${canProcessResult.requiredCredits}, Atual: ${currentBalance}`
      };
    } catch (error: any) {
      logger.error('Erro ao verificar créditos:', {
        error: error.message || error,
        featureCode,
        userId: user?.id
      });
      
      return {
        canProcess: false,
        requiredCredits: 0,
        currentBalance: 0,
        message: `Erro ao verificar saldo de créditos: ${error.message || 'Erro desconhecido'}`
      };
    }
  };

  /**
   * Salva log de IA com dedução automática de créditos
   * Usa LoggingService no backend quando creditsUsed = 0
   */
  const logAIGeneration = async (params: LogAIGenerationParams): Promise<boolean> => {
    if (!user?.id) {
      logger.warn('Usuário não logado - log não salvo');
      return false;
    }

    try {
      const response = await fetch('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          provider: params.provider,
          model: params.model,
          prompt: params.prompt,
          response: params.response,
          promptCharacters: params.promptCharacters || params.prompt.length,
          responseCharacters: params.responseCharacters || params.response.length,
          inputTokens: params.inputTokens || 0,
          outputTokens: params.outputTokens || 0,
          totalTokens: params.totalTokens || 0,
          cost: params.cost || 0,
          duration: params.duration || 0,
          creditsUsed: 0, // LoggingService deduz automaticamente quando 0
          feature: params.featureCode
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar log');
      }

      const requiredCredits = getFeatureCost(params.featureCode);
      logger.debug(`💾 Log AI salvo - Feature: ${params.featureCode}, Créditos: ${requiredCredits}, Usuário: ${user.id}`);
      
      // Invalidar cache de créditos para atualizar o saldo na interface
      try {
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/credits/balance'] });
        await queryClient.refetchQueries({ queryKey: ['/api/dashboard/summary'] });
      } catch (cacheError) {
        console.error('❌ Error invalidating cache:', cacheError);
      }
      
      return true;
    } catch (error) {
      logger.error('Erro ao salvar log AI:', error);
      return false;
    }
  };

  /**
   * Mostra toast de créditos insuficientes
   */
  const showInsufficientCreditsToast = (required: number, current: number) => {
    toast({
      variant: "destructive",
      title: "❌ Créditos Insuficientes",
      description: `Você precisa de ${required} créditos para usar este agente. Saldo atual: ${current} créditos.`
    });
  };

  /**
   * Mostra toast de erro na verificação de créditos
   */
  const showCreditCheckErrorToast = (errorMessage?: string) => {
    toast({
      variant: "destructive",
      title: "❌ Erro ao verificar créditos",
      description: errorMessage || "Não foi possível verificar seu saldo de créditos. Tente novamente."
    });
  };

  /**
   * Verifica créditos e exibe toast automaticamente em caso de erro ou insuficiência
   */
  const checkCreditsWithToast = async (featureCode: string): Promise<boolean> => {
    const result = await checkCredits(featureCode);
    
    if (!result.canProcess) {
      if (result.message?.includes('Erro ao verificar')) {
        showCreditCheckErrorToast(result.message);
      } else {
        showInsufficientCreditsToast(result.requiredCredits, result.currentBalance);
      }
      return false;
    }
    
    return true;
  };

  return {
    checkCredits,
    checkCreditsWithToast,
    logAIGeneration,
    showInsufficientCreditsToast,
    showCreditCheckErrorToast,
    getFeatureCost,
    canProcess
  };
}
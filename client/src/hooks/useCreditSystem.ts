/**
 * Hook unificado para sistema de créditos
 * Previne inconsistências e duplicação de código
 */
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGetFeatureCost } from "@/hooks/useGetFeatureCost";
import { logger } from "@/utils/logger";

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
  const { getFeatureCost, canProcess } = useGetFeatureCost();

  /**
   * Verifica se o usuário tem créditos suficientes
   */
  const checkCredits = async (featureCode: string): Promise<CreditCheckResult> => {
    try {
      const dashboardResponse = await fetch('/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!dashboardResponse.ok) {
        throw new Error('Erro ao verificar créditos');
      }

      const data = await dashboardResponse.json();
      const currentBalance = data.user?.creditBalance || 0;
      const requiredCredits = getFeatureCost(featureCode);
      const canProcessResult = canProcess(featureCode, currentBalance);

      return {
        canProcess: canProcessResult.canProcess,
        requiredCredits: canProcessResult.requiredCredits,
        currentBalance,
        message: canProcessResult.canProcess 
          ? `✅ Créditos suficientes (${currentBalance})` 
          : `❌ Créditos insuficientes. Necessário: ${canProcessResult.requiredCredits}, Atual: ${currentBalance}`
      };
    } catch (error) {
      logger.error('Erro ao verificar créditos:', error);
      return {
        canProcess: false,
        requiredCredits: 0,
        currentBalance: 0,
        message: 'Erro ao verificar saldo de créditos'
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
  const showCreditCheckErrorToast = () => {
    toast({
      variant: "destructive",
      title: "❌ Erro ao verificar créditos",
      description: "Não foi possível verificar seu saldo de créditos."
    });
  };

  return {
    checkCredits,
    logAIGeneration,
    showInsufficientCreditsToast,
    showCreditCheckErrorToast,
    getFeatureCost,
    canProcess
  };
}
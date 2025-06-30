import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AIGenerationConfig {
  model: string;
  provider: string;
  maxTokens: number;
  temperature: number;
}

interface AIGenerationResult {
  success: boolean;
  response?: string;
  cost?: number;
  responseReceived?: string;
  message?: string;
}

const DEFAULT_CONFIG: AIGenerationConfig = {
  model: 'gpt-4o-mini',
  provider: 'openai',
  maxTokens: 1000,
  temperature: 0.7
};

export const useAIGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createPrompt = useCallback((productDescription: string): string => {
    return `${productDescription}

Baseando-se na breve descrição que te dei do meu produto, por favor escreva uma descrição de produto PODEROSA e PERSUASIVA para Amazon. A descrição deve captar a atenção dos compradores e convencê-los de que meu produto é a melhor opção disponível na Amazon.

Comprimento da descrição:
a. Deve ter entre 1400 a 1800 Caracteres
b. Não pode ter menos de 1400 caracteres no total
c. Não pode ter mais de 1800 caracteres.

Tom da Descrição:
A descrição deve ser envolvente, divertida e atraente, NUNCA entediante ou corporativa. O texto deve brilhar e se destacar da concorrência, transmitindo confiança e emoção ao comprador.
a. Mantenha um foco nos benefícios principais do produto, e como este melhora a vida do cliente.

Objetivo:
A descrição deve gerar urgência e levar o cliente a querer comprar o produto imediatamente. Deve soar natural, mas também ser incrivelmente persuasiva, destacando porque meu produto é o melhor que qualquer outra opção.

Fechamento Persuasivo:
Termine a descrição com uma chamada para ação direta e convincente, motivando o cliente a adicionar o produto ao carrinho imediatamente.`;
  }, []);

  const generateWithAI = useCallback(async (
    productDescription: string,
    config: Partial<AIGenerationConfig> = {}
  ): Promise<{ success: boolean; result?: string }> => {
    if (!productDescription.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Digite uma descrição básica do produto antes de gerar com IA"
      });
      return { success: false };
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Usuário não autenticado"
      });
      return { success: false };
    }

    const startTime = Date.now();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const prompt = createPrompt(productDescription);

    try {
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: finalConfig.provider,
          model: finalConfig.model,
          prompt,
          maxTokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da OpenAI');
      }

      const data: AIGenerationResult = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Erro na resposta da API');
      }

      const responseText = data.response || '';
      const duration = Date.now() - startTime;

      // Salvar log da geração
      await saveGenerationLog({
        userId: user.id,
        provider: finalConfig.provider,
        model: finalConfig.model,
        prompt,
        response: responseText,
        promptCharacters: prompt.length,
        responseCharacters: responseText.length,
        inputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.inputTokens || 0 : 0,
        outputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.outputTokens || 0 : 0,
        totalTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.totalTokens || 0 : 0,
        cost: data.cost || 0,
        duration,
        feature: 'html-description'
      });

      return { success: true, result: responseText };

    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Falha ao gerar descrição com IA. Tente novamente."
      });
      return { success: false };
    }
  }, [user, toast, createPrompt]);

  const saveGenerationLog = useCallback(async (logData: any) => {
    try {
      await fetch('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(logData)
      });
      
      console.log(`💾 Log salvo - Usuário: ${logData.userId}, Custo: $${logData.cost}, Caracteres: ${logData.responseCharacters}, Duração: ${logData.duration}ms`);
    } catch (logError) {
      console.error('Erro ao salvar log de IA:', logError);
    }
  }, []);

  return { generateWithAI };
};
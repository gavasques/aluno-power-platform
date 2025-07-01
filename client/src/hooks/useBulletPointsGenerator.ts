import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Agent } from '@shared/schema';
import { BULLET_POINTS_CONFIG } from '@/lib/bulletPointsConfig';

interface UseBulletPointsGeneratorProps {
  agent?: Agent;
}

interface GenerationState {
  productName: string;
  brand: string;
  textInput: string;
  targetAudience: string;
  keywords: string;
  bulletPointsOutput: string;
  isGenerating: boolean;
  generatedBulletPoints: string;
  showReplaceDialog: boolean;
}

const BULLET_POINTS_PROMPT = `PROMPT PARA CRIAÇÃO DE BULLET POINTS AMAZON - ALTA CONVERSÃO

INSTRUÇÕES GERAIS

Você é um especialista em copywriting para Amazon com mais de 10 anos de experiência em otimização de listings que convertem. Sua missão é criar 8 bullet points extremamente persuasivos e comerciais que despertem o desejo de compra imediato.

FORMATO OBRIGATÓRIO DOS BULLET POINTS

BENEFÍCIO EM MAIÚSCULAS - Características que respaldem esse benefício de maneira clara e precisa.

ESPECIFICAÇÕES TÉCNICAS:

• Cada bullet point deve ter entre 180 e 250 caracteres
• SEMPRE terminar o terceiro Bullet Points com "ADICIONAR AO CARRINHO"
• Benefício principal em MAIÚSCULAS no início
• Características de apoio após o hífen
• Tom comercial e persuasivo extremamente forte
• Foco em despertar desejo de compra AGORA

ESTRUTURA DOS 8 BULLET POINTS

BULLET POINT 1: PÚBLICO-ALVO + PROPOSTA ÚNICA DE VALOR
Foco: Quem é o produto + diferencial único + credibilidade
Elementos: Autoridade, confiança, superioridade sobre concorrentes
Tom: Transformacional, não incremental

BULLET POINT 2: BENEFÍCIO EMOCIONAL PRINCIPAL
Foco: Principal benefício emocional + ponte para características técnicas
Elementos: Resultado real que o cliente vai sentir + como isso é possível
Tom: Experiencial, sensorial

BULLET POINT 3: CARACTERÍSTICAS TÉCNICAS + BENEFÍCIOS
Foco: Recursos técnicos mais importantes + FAQ + ponte para benefícios
Elementos: Diferenciação técnica + resposta a objeções comuns
Tom: Educativo mas persuasivo

BULLET POINT 4: FACILIDADE DE USO
Foco: Como usar + facilidade de propriedade + manutenção
Elementos: Processo simples + conveniência + praticidade
Tom: Tranquilizador, remove barreiras

BULLET POINT 5: REDUÇÃO DE RISCO + VALORES
Foco: Garantias + certificações + alinhamento com valores do cliente
Elementos: Warranty, garantias, certificações, origem, causas apoiadas
Tom: Confiável, seguro

BULLET POINT 6: TRANSFORMAÇÃO/RESULTADO FINAL
Foco: Transformação completa que o produto proporciona
Elementos: Antes vs depois + impacto na vida + urgência
Tom: Inspiracional, transformacional

BULLET POINT 7: EXCLUSIVIDADE + ESCASSEZ
Foco: O que torna este produto único + elementos de escassez
Elementos: Tecnologia exclusiva + limitações + diferenciação
Tom: Urgente, exclusivo

BULLET POINT 8: CALL TO ACTION FINAL
Foco: Chamada final irresistível para ação
Elementos: Síntese dos benefícios + urgência + facilidade de compra
Tom: Urgente, irresistível

TÉCNICAS DE COPYWRITING OBRIGATÓRIAS

PALAVRAS DE PODER A USAR:
• FINALMENTE, REVOLUCIONÁRIO, EXCLUSIVO, COMPROVADO, SUPERIOR
• IMEDIATO, INSTANTÂNEO, TRANSFORME, EXPERIMENTE, DESCUBRA
• GARANTIDO, CLINICAMENTE TESTADO, PREMIUM, PROFISSIONAL
• ÚNICO, AVANÇADO, INOVADOR, EFICAZ, PODEROSO

TÉCNICAS PSICOLÓGICAS:
1. Agitação da Dor: Mencione o problema que resolve
2. Ponte Benefício-Característica: Sempre conecte recursos técnicos aos benefícios reais
3. Prova Social: Use indicadores de autoridade e credibilidade
4. Urgência: Crie senso de que precisam agir agora
5. Propriedade Mental: Faça o cliente se imaginar usando o produto
6. Transformação: Posicione como experiência transformadora, não melhoria incremental

EVITAR ABSOLUTAMENTE:
• Palavras como "nosso", "nós" (use "seu", "você")
• Menções de preço ou promoções
• Políticas de envio ou devolução
• Jargões técnicos sem explicação
• Linguagem genérica ou vaga
• Referir ao produto como "este" ou "isso"
• NUNCA invente funcionalidades que não foram mencionadas sobre o produto

INSTRUÇÕES DE EXECUÇÃO

PASSO 1: Analise as informações técnicas do produto fornecidas
PASSO 2: Identifique o público-alvo principal e suas dores/desejos
PASSO 3: Extraia os 3 benefícios mais poderosos
PASSO 4: Identifique as características técnicas que suportam cada benefício
PASSO 5: Crie os 8 bullet points seguindo a estrutura exata
PASSO 6: Verifique se cada bullet tem 180-250 caracteres
PASSO 7: Confirme que todos terminam com "ADICIONAR AO CARRINHO"
PASSO 8: Revise o tom para máxima persuasão comercial

EXEMPLO DE APLICAÇÃO:
ALÍVIO INSTANTÂNEO E DURADOURO DA DOR COMPROVADO CLINICAMENTE - Tecnologia de alta frequência penetra profundamente como massagem suave, superior a TENS tradicionais. ADICIONAR AO CARRINHO

REGRAS DO QUE NUNCA FAZER:
• NUNCA fuja do tema do produto
• NUNCA invente funcionalidades não mencionadas

IMPORTANTE: Na sua resposta, escreva APENAS os 8 bullet points, sem prefixos como "BULLET POINT 1:", "BULLET POINT 2:", etc. Comece diretamente com o benefício em maiúsculas.

Agora, com base nas informações do produto abaixo, crie 8 bullet points seguindo exatamente as especificações:

{{PRODUCT_INFO}}`;

export const useBulletPointsGenerator = ({ agent }: UseBulletPointsGeneratorProps) => {
  const [state, setState] = useState<GenerationState>({
    productName: '',
    brand: '',
    textInput: '',
    targetAudience: '',
    keywords: '',
    bulletPointsOutput: '',
    isGenerating: false,
    generatedBulletPoints: '',
    showReplaceDialog: false,
  });

  const [agentConfig, setAgentConfig] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAgentConfig = useCallback(() => {
    if (agent) {
      setAgentConfig({
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o-mini',
        temperature: parseFloat(agent.temperature || '0.7'),
        maxTokens: agent.maxTokens || 2000
      });
    }
  }, [agent]);

  const generateWithAI = useCallback(async () => {
    if (!state.productName.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Por favor, insira o nome do produto",
      });
      return;
    }

    if (!state.textInput.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Por favor, insira as informações do produto",
      });
      return;
    }

    if (state.textInput.trim().length < BULLET_POINTS_CONFIG.MIN_CHARS) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: `Informações do produto deve ter pelo menos ${BULLET_POINTS_CONFIG.MIN_CHARS} caracteres. Você tem ${state.textInput.trim().length} caracteres.`,
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Usuário não autenticado",
      });
      return;
    }

    updateState({ isGenerating: true });

    try {
      const startTime = Date.now();
      
      const productInfo = `
NOME DO PRODUTO: ${state.productName}
${state.brand ? `MARCA: ${state.brand}` : ''}
${state.targetAudience ? `PÚBLICO-ALVO: ${state.targetAudience}` : ''}
${state.keywords ? `PALAVRAS-CHAVE: ${state.keywords}` : ''}

INFORMAÇÕES DETALHADAS DO PRODUTO:
${state.textInput}
      `.trim();

      const prompt = BULLET_POINTS_PROMPT.replace('{{PRODUCT_INFO}}', productInfo);

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: agentConfig.provider,
          model: agentConfig.model,
          prompt: prompt,
          maxTokens: agentConfig.maxTokens,
          temperature: agentConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da IA');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro na geração de bullet points');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const responseText = data.response;

      // Salvar log da geração
      await fetch('/api/ai-generation-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          provider: agentConfig.provider,
          model: agentConfig.model,
          prompt: prompt,
          response: responseText,
          promptCharacters: prompt.length,
          responseCharacters: responseText.length,
          inputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.inputTokens || 0 : 0,
          outputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.outputTokens || 0 : 0,
          totalTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.totalTokens || 0 : 0,
          cost: data.cost || 0,
          duration: duration,
          feature: 'bullet-points-generator'
        })
      });

      if (state.bulletPointsOutput && state.bulletPointsOutput.trim()) {
        updateState({ 
          generatedBulletPoints: responseText,
          showReplaceDialog: true 
        });
      } else {
        updateState({ bulletPointsOutput: responseText });
        toast({
          title: "✓ Bullet Points Gerados!",
          description: "Bullet points criados com sucesso usando IA",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao gerar bullet points",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      updateState({ isGenerating: false });
    }
  }, [state.productName, state.textInput, state.brand, state.targetAudience, state.keywords, state.bulletPointsOutput, user, agentConfig, toast, updateState]);

  const copyBulletPoints = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.bulletPointsOutput);
      toast({
        title: "✓ Copiado!",
        description: "Bullet points copiados para a área de transferência",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: "Erro ao copiar bullet points",
      });
    }
  }, [state.bulletPointsOutput, toast]);

  const handleReplace = useCallback(() => {
    updateState({
      bulletPointsOutput: state.generatedBulletPoints,
      showReplaceDialog: false,
      generatedBulletPoints: ''
    });
    toast({
      title: "✓ Bullet Points Substituídos!",
      description: "Novos bullet points aplicados com sucesso",
    });
  }, [state.generatedBulletPoints, toast, updateState]);

  const handleKeepBoth = useCallback(() => {
    const separator = '\n\n--- NOVA VERSÃO ---\n\n';
    updateState({
      bulletPointsOutput: state.bulletPointsOutput + separator + state.generatedBulletPoints,
      showReplaceDialog: false,
      generatedBulletPoints: ''
    });
    toast({
      title: "✓ Versões Combinadas!",
      description: "Ambas as versões foram mantidas",
    });
  }, [state.bulletPointsOutput, state.generatedBulletPoints, toast, updateState]);

  const handleClearAll = useCallback(() => {
    updateState({
      productName: '',
      brand: '',
      textInput: '',
      targetAudience: '',
      keywords: '',
      bulletPointsOutput: '',
      generatedBulletPoints: '',
      showReplaceDialog: false
    });
  }, [updateState]);

  return {
    state,
    agentConfig,
    updateState,
    updateAgentConfig,
    generateWithAI,
    copyBulletPoints,
    handleReplace,
    handleKeepBoth,
    handleClearAll
  };
};
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGetFeatureCost } from '@/hooks/useFeatureCosts';
import type { Agent } from '@shared/schema';
import { BULLET_POINTS_CONFIG } from '@/lib/bulletPointsConfig';
import { logger } from '@/utils/logger';

interface UseBulletPointsGeneratorProps {
  agent?: Agent;
}

interface GenerationState {
  productName: string;
  brand: string;
  textInput: string;
  targetAudience: string;
  keywords: string;
  uniqueDifferential: string;
  materials: string;
  warranty: string;
  bulletPointsOutput: string;
  isGenerating: boolean;
  generatedBulletPoints: string;
  showReplaceDialog: boolean;
}

const BULLET_POINTS_PROMPT = `# PROMPT OTIMIZADO: BULLET POINTS DE ALTA CONVERSÃO PARA AMAZON

Você é um especialista em copywriting para Amazon, com 10+ anos de experiência em gerar listings que vendem. Sua missão é criar 8 bullet points extremamente persuasivos e comerciais, despertando desejo de compra imediato.  
Siga as instruções abaixo à risca.

---

##  OBJETIVO PRINCIPAL

Criar 8 bullet points poderosos, focados em benefícios reais, que façam o cliente querer comprar AGORA. Vamos atingir o subconciente do consumidor. Usando tambem gatilhos mentais que levem ele a querer esse produto. 

---

##  FORMATO E ESTILO

- Cada bullet point começa com o BENEFÍCIO PRINCIPAL EM MAIÚSCULAS, seguido de hífen e características que sustentam o benefício.
- Caracteres: 200–275 caracteres (com espaços) por bullet.
- NUNCA deixa o bullet points com menos de 200 caracteres
- NUNCA exceda 275 caracteres no Bullet Point. 
- Bullet 3: Sempre termina com "ADICIONAR AO CARRINHO".
- Bullet da Garantia: Um bullet dedicado à garantia, reforçando que só é válida para compras de vendedores autorizados.
- Tom: Comercial, direto, urgência máxima, fácil de entender. 
- NUNCA use palavras complicadas ou complexas. O texto deve ser fácil de entender por qualquer pessoa. 
- Não use "nosso/nós", nem fale de preço, envio, devolução, estoque limitado ou políticas. 
- NUNCA Invente caracteristicas, e nunca fale que o item faz algo que não esteja explicito nas informações que você recebeu no promt. 
- LEMBRANDO: Só use informações fornecidas. Nunca invente funcionalidades/benefícios.

---

##  ESTRUTURA DOS BULLET POINTS

1. Público-alvo + Proposta Única de Valor: Quem é o produto, diferencial, credibilidade.
2. Benefício Emocional Principal: O que o cliente sente, resultado prático.
3. Características Técnicas + Benefícios (com CTA): Destaque técnico + benefício + "ADICIONAR AO CARRINHO".
4. Facilidade de Uso: Simplicidade, praticidade, uso diário.
5. GARANTIA OFICIAL: Explicitar que a garantia só é válida para produtos comprados de vendedores autorizados. (Este bullet é obrigatório.)
6. Transformação/Resultado Final: O antes e depois, impacto real.
7. Exclusividade/Inovação: O que só esse produto oferece, inovação, tecnologia, design.
8. Call to Action Final: Síntese dos benefícios + chamada para ação urgente.

---

##  TÉCNICAS 

- Palavras de poder: finalmente, revolucionário, exclusivo, superior, imediato, instantâneo, transforme, experimente, descubra, garantido, premium, único, avançado, inovador, eficaz, poderoso.
- Psicologia: agitação da dor, ponte benefício-característica, urgência, transformação, prova social, propriedade mental (fazer o cliente se imaginar usando).

---

## 🚫 NUNCA FAZER

- Não usar "nós", "nosso".
- Não citar preço, estoque, envio, devolução, cor disponível.
- Não usar termos técnicos sem explicação clara do benefício.
- Não inventar características.
- Não sair do tema do produto.

## 🔎 PALAVRAS-CHAVE E SEO

- Antes de gerar os bullets, identifique as 3 principais palavras-chave para o produto no seu nicho.
- Use cada palavra-chave de forma natural, espalhada nos bullets, SEM repetições forçadas (evite keyword stuffing).
- Priorize as palavras-chave nos primeiros bullets ou início de frase para maximizar o efeito no algoritmo de busca e na leitura rápida.

##  ESCANEABILIDADE (SKIMMABILITY)

- O benefício principal deve aparecer logo no começo de cada bullet (primeiras 5-7 palavras).
- Escreva como se o cliente só fosse ler a primeira linha ou metade do bullet.

## ❗️ RESTRIÇÃO DE PROMESSAS EXAGERADAS

- Evite expressões absolutas ("o melhor", "top 1", "o único") a não ser que haja comprovação real.
- Foque em benefícios concretos, ancorados em fatos e recursos do produto.

##  PERGUNTAS IMPACTANTES (OPCIONAL)

- Pode começar o primeiro bullet com uma pergunta direta que aponte para a dor do cliente, seguida imediatamente do benefício que resolve.

---

##  ETAPA 1: ANÁLISE PRÉVIA DO PRODUTO

Preencha antes de gerar os bullets:
- Diferencial Único: 
- Materiais: 
- Cores/Design: 
- Embalagem: 
- Detalhes Adicionais: 
- Top 7 Benefícios (ordem de relevância): 
- Principais Reclamações/Elogios dos concorrentes (opcional):

---

## ETAPA 2: GERAR OS BULLET POINTS

Com base na análise acima, crie os 8 bullets nesta ordem (cada um com 200–275 caracteres):

1. PÚBLICO-ALVO + PROPOSTA ÚNICA DE VALOR – [benefício + característica]
2. BENEFÍCIO EMOCIONAL PRINCIPAL – [benefício sensorial + característica]
3. CARACTERÍSTICA TÉCNICA + BENEFÍCIO – [destaque técnico + benefício]. ADICIONAR AO CARRINHO
4. FACILIDADE DE USO – [simplicidade, praticidade]
5. GARANTIA OFICIAL – Garantia válida exclusivamente para produtos adquiridos de vendedores autorizados, proporcionando total segurança e tranquilidade.
6. TRANSFORMAÇÃO/RESULTADO FINAL – [antes/depois, impacto]
7. EXCLUSIVIDADE/INOVAÇÃO – [tecnologia, diferencial, inovação]
8. CALL TO ACTION FINAL – [resumo dos benefícios + convite à ação imediata]

O RETORNO, será apenas o BULLET POINTS, a ETAPA 1 é apenas para você ter base para a ETAPA 2. 

Lembre-se
- NUNCA deixa o bullet points com menos de 200 caracteres
- NUNCA exceda 275 caracteres no Bullet Point. 

Agora siga as etapas e gere bullets prontos para dominar seu nicho. Sem enrolação, só alta conversão.

Dados do Produto 
Nome do Produto = {{PRODUCT_NAME}}
Marca = {{BRAND}}
Publico Alvo = {{TARGET_AUDIENCE}}
Garantia = {{WARRANTY}}
Palavras chave = {{KEYWORDS}}
Diferencial Unico = {{UNIQUE_DIFFERENTIAL}}
Materiais = {{MATERIALS}}
Informações do Produto = {{PRODUCT_INFO}}`;

export const useBulletPointsGenerator = ({ agent }: UseBulletPointsGeneratorProps) => {
  const [state, setState] = useState<GenerationState>({
    productName: '',
    brand: '',
    textInput: '',
    targetAudience: '',
    keywords: '',
    uniqueDifferential: '',
    materials: '',
    warranty: '',
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
  const { getFeatureCost } = useGetFeatureCost();
  
  const FEATURE_CODE = 'agents.bullet_points';

  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Atualizar configuração automaticamente quando o agente mudar
  useEffect(() => {
    if (agent) {
      const newConfig = {
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o-mini',
        temperature: typeof agent.temperature === 'string' ? parseFloat(agent.temperature) : agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 2000
      };
      logger.debug('🔧 [BULLET_POINTS] Auto-updating agent config:', newConfig);
      setAgentConfig(newConfig);
    }
  }, [agent]);

  const updateAgentConfig = useCallback(() => {
    if (agent) {
      const newConfig = {
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o-mini',
        temperature: typeof agent.temperature === 'string' ? parseFloat(agent.temperature) : agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 2000
      };
      logger.debug('🔧 [BULLET_POINTS] Manual update agent config:', newConfig);
      setAgentConfig(newConfig);
    }
  }, [agent]);

  const generateWithAI = useCallback(async () => {
    if (!state.productName.trim() || !state.textInput.trim()) {
      toast({
        variant: "destructive",
        title: "❌ Campos obrigatórios",
        description: "Preencha o nome do produto e as informações detalhadas.",
      });
      return;
    }

    updateState({ isGenerating: true });

    try {
      // SEMPRE buscar as configurações mais recentes do agente antes de gerar
      const agentResponse = await fetch('/api/agents/bullet-points-generator', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!agentResponse.ok) {
        throw new Error('Erro ao buscar configurações do agente');
      }
      
      const agentData = await agentResponse.json();
      const currentConfig = {
        provider: agentData.provider || 'openai',
        model: agentData.model || 'gpt-4o-mini',
        temperature: typeof agentData.temperature === 'string' ? parseFloat(agentData.temperature) : agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 2000
      };

      logger.debug('🚀 [BULLET_POINTS] Starting generation with FRESH config:', currentConfig);
      setAgentConfig(currentConfig); // Atualizar o estado local também

      const startTime = Date.now();

      // Substituir as variáveis no prompt com os dados do formulário
      let prompt = BULLET_POINTS_PROMPT
        .replace('{{PRODUCT_NAME}}', state.productName || 'Não informado')
        .replace('{{BRAND}}', state.brand || 'Não informado')
        .replace('{{TARGET_AUDIENCE}}', state.targetAudience || 'Não informado')
        .replace('{{WARRANTY}}', state.warranty || 'Não informado')
        .replace('{{KEYWORDS}}', state.keywords || 'Não informado')
        .replace('{{UNIQUE_DIFFERENTIAL}}', state.uniqueDifferential || 'Não informado')
        .replace('{{MATERIALS}}', state.materials || 'Não informado')
        .replace('{{PRODUCT_INFO}}', state.textInput || 'Não informado');

      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          provider: currentConfig.provider,
          model: currentConfig.model,
          prompt: prompt,
          maxTokens: currentConfig.maxTokens,
          temperature: currentConfig.temperature
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
      const creditsToDeduct = getFeatureCost(FEATURE_CODE);

      // Salvar log da geração (somente se usuário estiver logado)
      // LoggingService deduze automaticamente os créditos quando creditsUsed = 0
      if (user && user.id) {
        await fetch('/api/ai-generation-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            userId: user.id,
            provider: currentConfig.provider,
            model: currentConfig.model,
            prompt: prompt,
            response: responseText,
            promptCharacters: prompt.length,
            responseCharacters: responseText.length,
            inputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.inputTokens || 0 : 0,
            outputTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.outputTokens || 0 : 0,
            totalTokens: data.responseReceived ? JSON.parse(data.responseReceived).usage?.totalTokens || 0 : 0,
            cost: data.cost || 0,
            creditsUsed: 0, // LoggingService deduz automaticamente quando 0
            duration: duration,
            feature: FEATURE_CODE
          })
        });
        
        logger.debug(`💾 Log salvo - Usuário: ${user.id}, Créditos: ${creditsToDeduct}, Caracteres: ${responseText.length}, Duração: ${duration}ms`);
      }

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
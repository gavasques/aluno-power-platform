import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/UserContext';
import { useCreditSystem } from '@/hooks/useCreditSystem';
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
  // Amazon Reviews fields
  asin: string;
  country: string;
  reviewsData: string;
  isExtractingReviews: boolean;
  extractionProgress: number;
  asinList: string[];
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
Informações do Produto = {{PRODUCT_INFO}}
Avaliações dos Clientes = {{REVIEWS_DATA}}`;

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
    // Amazon Reviews fields
    asin: '',
    country: 'BR',
    reviewsData: '',
    isExtractingReviews: false,
    extractionProgress: 0,
    asinList: [],
  });

  const [agentConfig, setAgentConfig] = useState({
    provider: 'webhook',
    model: 'n8n-bullet-points',
    temperature: 0.7,
    maxTokens: 6000
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const { logAIGeneration, getFeatureCost, checkCredits, showInsufficientCreditsToast } = useCreditSystem();
  
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

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    updateState({ isGenerating: true });

    try {
      // Configuração simplificada para webhook
      const currentConfig = {
        provider: 'webhook',
        model: 'n8n-bullet-points',
        temperature: 0.7,
        maxTokens: 6000
      };

      logger.debug('🚀 [BULLET_POINTS] Starting generation with webhook config:', currentConfig);
      setAgentConfig(currentConfig);

      // Log para verificar se há dados de reviews disponíveis
      if (state.reviewsData) {
        logger.debug('📊 [BULLET_POINTS] Reviews data available:', {
          reviewsLength: state.reviewsData.length,
          totalReviews: state.reviewsData.split('---').length - 1,
          reviewsPreview: state.reviewsData.substring(0, 200)
        });
      } else {
        logger.debug('📊 [BULLET_POINTS] No reviews data available');
      }

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
        .replace('{{PRODUCT_INFO}}', state.textInput || 'Não informado')
        .replace('{{REVIEWS_DATA}}', state.reviewsData || '');

      // Preparar dados estruturados combinados para o webhook
      const combinedProductInfo = {
        informacoes_basicas: {
          nome_produto: state.productName || 'Não informado',
          marca: state.brand || 'Não informado',
          publico_alvo: state.targetAudience || 'Não informado',
          garantia: state.warranty || 'Não informado',
          palavras_chave: state.keywords || 'Não informado',
          diferencial_unico: state.uniqueDifferential || 'Não informado',
          materiais: state.materials || 'Não informado',
          informacoes_detalhadas: state.textInput || 'Não informado'
        },
        avaliacoes_clientes: state.reviewsData ? {
          dados_disponiveis: true,
          total_avaliacoes: state.reviewsData.split('---').length - 1,
          conteudo: state.reviewsData
        } : {
          dados_disponiveis: false,
          total_avaliacoes: 0,
          conteudo: 'Nenhuma avaliação disponível'
        }
      };

      const webhookData = {
        productName: state.productName || 'Não informado',
        brand: state.brand || 'Não informado',
        targetAudience: state.targetAudience || 'Não informado',
        warranty: state.warranty || 'Não informado',
        keywords: state.keywords || 'Não informado',
        uniqueDifferential: state.uniqueDifferential || 'Não informado',
        materials: state.materials || 'Não informado',
        productInfo: JSON.stringify(combinedProductInfo, null, 2),
        reviewsData: state.reviewsData || '',
        config: {
          provider: currentConfig.provider,
          model: currentConfig.model,
          temperature: currentConfig.temperature,
          maxTokens: currentConfig.maxTokens
        },
        prompt: prompt,
        userId: user?.id,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('https://n8n.guivasques.app/webhook-test/gerar-bullet-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro no webhook: ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      // Extrair os bullet points gerados do webhook
      let responseText = '';
      if (data.bulletPoints) {
        responseText = data.bulletPoints;
      } else if (data.response) {
        responseText = data.response;
      } else if (data.content) {
        responseText = data.content;
      } else if (data.message) {
        responseText = data.message;
      } else {
        responseText = JSON.stringify(data);
      }

      logger.debug('🎯 [BULLET_POINTS] Structured data sent to webhook:', {
        combinedProductInfo,
        webhookDataStructure: {
          hasReviews: !!state.reviewsData,
          reviewsCount: state.reviewsData ? state.reviewsData.split('---').length - 1 : 0,
          productInfoType: typeof webhookData.productInfo,
          productInfoLength: webhookData.productInfo.length
        }
      });

      logger.debug('🎯 [BULLET_POINTS] Webhook response:', {
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 100),
        webhookData: data
      });

      // Log da geração via webhook (simulando tokens para compatibilidade)
      const estimatedInputTokens = Math.ceil(prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(responseText.length / 4);
      const estimatedCost = ((estimatedInputTokens + estimatedOutputTokens) / 1000) * 0.0125;

      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'webhook',
        model: 'n8n-bullet-points',
        prompt: prompt,
        response: responseText,
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        totalTokens: estimatedInputTokens + estimatedOutputTokens,
        cost: estimatedCost,
        duration: duration
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
          description: "Bullet points criados com sucesso via webhook",
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
      uniqueDifferential: '',
      materials: '',
      warranty: '',
      bulletPointsOutput: '',
      generatedBulletPoints: '',
      showReplaceDialog: false,
      asin: '',
      country: 'BR',
      reviewsData: '',
      isExtractingReviews: false,
      extractionProgress: 0,
      asinList: []
    });
    toast({
      title: "✅ Campos limpos",
      description: "Todos os campos foram limpos com sucesso",
    });
  }, [toast, updateState]);

  const extractAmazonReviews = useCallback(async () => {
    if (state.asinList.length === 0) {
      toast({
        variant: "destructive",
        title: "❌ ASINs obrigatórios",
        description: "Adicione pelo menos um ASIN para extrair reviews",
      });
      return;
    }

    updateState({ isExtractingReviews: true, extractionProgress: 0 });

    try {
      const allReviewsData = [];
      const totalAsins = state.asinList.length;
      const maxPagesPerAsin = 2; // 2 páginas por ASIN para múltiplos ASINs
      
      for (let asinIndex = 0; asinIndex < state.asinList.length; asinIndex++) {
        const currentAsin = state.asinList[asinIndex];
        
        // Atualizar progresso baseado no ASIN atual
        const baseProgress = (asinIndex / totalAsins) * 100;
        updateState({ extractionProgress: baseProgress });
        
        for (let page = 1; page <= maxPagesPerAsin; page++) {
          const pageProgress = baseProgress + ((page / maxPagesPerAsin) * (100 / totalAsins));
          updateState({ extractionProgress: pageProgress });
          
          const response = await fetch('/api/amazon-reviews/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
              asin: currentAsin,
              page: page,
              country: state.country,
              sort_by: 'MOST_RECENT'
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`Erro ao extrair reviews do ASIN ${currentAsin}, página ${page}:`, errorData.message);
            continue; // Continuar com próxima página/ASIN em caso de erro
          }

          const data = await response.json();
          
          if (data.success && data.reviews && data.reviews.length > 0) {
            // Adicionar informação do ASIN às reviews
            const reviewsWithAsin = data.reviews.map((review: any) => ({
              ...review,
              source_asin: currentAsin
            }));
            allReviewsData.push(...reviewsWithAsin);
          }
          
          // Pequena pausa entre requests
          if (page < maxPagesPerAsin || asinIndex < state.asinList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
      }

      if (allReviewsData.length === 0) {
        throw new Error('Nenhuma avaliação encontrada para os ASINs informados');
      }

      // Formatar reviews em texto com informação do ASIN
      const formattedReviews = allReviewsData.map((review, index) => 
        `Avaliação ${index + 1} (ASIN: ${review.source_asin}):
Título: ${review.review_title || 'Sem título'}
Nota: ${review.review_star_rating || 'Sem nota'}
Comentário: ${review.review_comment || 'Sem comentário'}
---`
      ).join('\n\n');

      updateState({ 
        reviewsData: formattedReviews,
        isExtractingReviews: false,
        extractionProgress: 100
      });

      toast({
        title: "✅ Reviews extraídas!",
        description: `${allReviewsData.length} avaliações de ${totalAsins} ASINs extraídas com sucesso`,
      });

    } catch (error) {
      updateState({ isExtractingReviews: false, extractionProgress: 0 });
      toast({
        variant: "destructive",
        title: "❌ Erro na extração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [state.asinList, state.country, toast, updateState]);

  return {
    state,
    agentConfig,
    updateState,
    updateAgentConfig,
    generateWithAI,
    copyBulletPoints,
    handleReplace,
    handleKeepBoth,
    handleClearAll,
    extractAmazonReviews
  };
};
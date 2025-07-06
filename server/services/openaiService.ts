import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { aiProviderService } from './aiProviderService';
import type { AIProvider } from './aiProviderService';

interface ProcessListingRequest {
  agentId: string;
  userId: string;
  userName: string;
  productName: string;
  productInfo?: string;
  reviewsData: string;
  format: 'csv' | 'text';
}

interface ProcessListingOptimizerRequest {
  agentId: string;
  userId: string;
  userName: string;
  productName: string;
  category: string;
  keywords: string;
  longTailKeywords?: string;
  features?: string;
  targetAudience?: string;
  reviewsData: string;
  format: 'csv' | 'text';
}

interface EnhancedAnalysis {
  mainBenefits: string[];
  painPoints: string[];
  keyFeatures: string[];
  targetAudience: string;
  competitorWeaknesses: string[];
  opportunityAreas: string[];
  emotionalTriggers: string[];
  searchIntentAnalysis: string;
  pricePositioning: string;
  marketDifferentiators: string[];
}

interface ProcessListingOptimizerResponse {
  analysis: EnhancedAnalysis;
  titles: string[];
  bulletPoints: string[];
  description: string;
  processingTime: number;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  usageId: string;
  generationId: string;
}

interface ProcessListingResponse {
  analysis: {
    mainBenefits: string[];
    painPoints: string[];
    keyFeatures: string[];
    targetAudience: string;
  };
  titles: string[];
  bulletPoints: string[];
  description: string;
  processingTime: number;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  usageId: string;
  generationId: string;
}

export class OpenAIService {
  async processAmazonListing(request: ProcessListingRequest): Promise<ProcessListingResponse> {
    const startTime = Date.now();
    
    // Get agent with prompts
    const agent = await storage.getAgentWithPrompts(request.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get prompts by type
    const systemPrompt = agent.prompts.find(p => p.promptType === 'system')?.content || '';
    const analysisPrompt = agent.prompts.find(p => p.promptType === 'analysis')?.content || '';
    const titlePrompt = agent.prompts.find(p => p.promptType === 'title')?.content || '';
    const bulletPointsPrompt = agent.prompts.find(p => p.promptType === 'bulletPoints')?.content || '';
    const descriptionPrompt = agent.prompts.find(p => p.promptType === 'description')?.content || '';

    try {
      // Step 1: Analysis
      const analysisResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        maxTokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${analysisPrompt}\n\nProduto: ${request.productName}\n${request.productInfo ? `Informações: ${request.productInfo}\n` : ''}Avaliações:\n${request.reviewsData}`
          }
        ],
      });

      const analysisResult = JSON.parse(analysisResponse.content || '{}');

      // Step 2: Generate Titles
      const titlesResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        maxTokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${titlePrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const titles = JSON.parse(titlesResponse.choices[0].message.content || '[]');

      // Step 3: Generate Bullet Points
      const bulletPointsResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${bulletPointsPrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const bulletPoints = JSON.parse(bulletPointsResponse.choices[0].message.content || '[]');

      // Step 4: Generate Description
      const descriptionResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${descriptionPrompt}\n\nAnálise: ${JSON.stringify(analysisResult)}\nProduto: ${request.productName}`
          }
        ],
      });

      const description = descriptionResponse.choices[0].message.content || '';

      // Calculate tokens and cost
      const totalInputTokens = (analysisResponse.usage?.prompt_tokens || 0) +
                               (titlesResponse.usage?.prompt_tokens || 0) +
                               (bulletPointsResponse.usage?.prompt_tokens || 0) +
                               (descriptionResponse.usage?.prompt_tokens || 0);

      const totalOutputTokens = (analysisResponse.usage?.completion_tokens || 0) +
                                (titlesResponse.usage?.completion_tokens || 0) +
                                (bulletPointsResponse.usage?.completion_tokens || 0) +
                                (descriptionResponse.usage?.completion_tokens || 0);

      const totalTokens = totalInputTokens + totalOutputTokens;
      const cost = (totalTokens / 1000) * parseFloat(agent.costPer1kTokens.toString());

      const processingTime = Date.now() - startTime;

      // Save usage record
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens,
        costUsd: cost.toString(),
        processingTimeMs: processingTime,
        status: 'success'
      });

      // Save generation record
      const generationId = uuidv4();
      await storage.createAgentGeneration({
        id: generationId,
        usageId,
        productName: request.productName,
        productInfo: request.productInfo ? { info: request.productInfo } : null,
        reviewsData: { data: request.reviewsData, format: request.format },
        analysisResult,
        titles,
        bulletPoints,
        description
      });

      return {
        analysis: analysisResult,
        titles,
        bulletPoints,
        description,
        processingTime,
        tokensUsed: {
          input: totalInputTokens,
          output: totalOutputTokens,
          total: totalTokens
        },
        cost,
        usageId,
        generationId
      };

    } catch (error: any) {
      // Save error usage record
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        costUsd: '0',
        processingTimeMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message
      });

      throw error;
    }
  }

  async processAmazonListingOptimizer(request: ProcessListingOptimizerRequest): Promise<ProcessListingOptimizerResponse> {
    const startTime = Date.now();
    
    // Get agent with prompts
    const agent = await storage.getAgentWithPrompts(request.agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get prompts by type from database
    const systemPrompt = agent.prompts.find(p => p.promptType === 'system')?.content || '';
    const analysisPrompt = agent.prompts.find(p => p.promptType === 'analysis')?.content || '';
    const titlePrompt = agent.prompts.find(p => p.promptType === 'title')?.content || '';
    const bulletPointsPrompt = agent.prompts.find(p => p.promptType === 'bulletPoints')?.content || '';
    const descriptionPrompt = agent.prompts.find(p => p.promptType === 'description')?.content || '';

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
      console.log(`🚀 [AMAZON_LISTING_OPTIMIZER] Iniciando pipeline de 4 etapas para produto: ${request.productName}`);

      // ETAPA 1: ANÁLISE PROFUNDA DAS AVALIAÇÕES
      console.log(`📊 [ETAPA 1] Analisando avaliações dos concorrentes...`);
      
      const analysisContent = `${analysisPrompt}

DADOS DO PRODUTO:
• Produto: ${request.productName}
• Categoria: ${request.category}
• Palavras-chave principais: ${request.keywords}
• Palavras-chave long tail: ${request.longTailKeywords || 'Não informado'}
• Características principais: ${request.features || 'Não informado'}
• Público-alvo: ${request.targetAudience || 'Não informado'}

AVALIAÇÕES DOS CONCORRENTES:
${request.reviewsData}

Retorne em formato JSON estruturado conforme solicitado.`;

      const analysisResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: 0.7,
        maxTokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisContent }
        ],
      });

      const analysisResult = JSON.parse(analysisResponse.content || '{}');
      totalInputTokens += analysisResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += analysisResponse.usage?.completion_tokens || 0;
      
      console.log(`✅ [ETAPA 1] Análise concluída - ${analysisResponse.usage?.prompt_tokens || 0} tokens de entrada, ${analysisResponse.usage?.completion_tokens || 0} tokens de saída`);

      // ETAPA 2: GERAÇÃO DE TÍTULOS
      console.log(`📝 [ETAPA 2] Gerando títulos otimizados...`);
      
      const titleContent = `${titlePrompt}

DADOS DO PRODUTO:
• Produto: ${request.productName}
• Categoria: ${request.category}
• Palavras-chave principais: ${request.keywords}
• Palavras-chave long tail: ${request.longTailKeywords || 'Não informado'}
• Características principais: ${request.features || 'Não informado'}
• Público-alvo: ${request.targetAudience || 'Não informado'}

ANÁLISE DOS REVIEWS (ETAPA 1):
${JSON.stringify(analysisResult, null, 2)}

Gere títulos otimizados seguindo as diretrizes acima.`;

      const titlesResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: 0.8,
        maxTokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: titleContent }
        ],
      });

      const titles = JSON.parse(titlesResponse.content || '[]');
      totalInputTokens += titlesResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += titlesResponse.usage?.completion_tokens || 0;
      
      console.log(`✅ [ETAPA 2] Títulos gerados - ${titlesResponse.usage?.prompt_tokens || 0} tokens de entrada, ${titlesResponse.usage?.completion_tokens || 0} tokens de saída`);

      // ETAPA 3: GERAÇÃO DE BULLET POINTS
      console.log(`🎯 [ETAPA 3] Gerando bullet points otimizados...`);
      
      const bulletPointsContent = `${bulletPointsPrompt}

DADOS DO PRODUTO:
• Produto: ${request.productName}
• Categoria: ${request.category}
• Palavras-chave principais: ${request.keywords}
• Palavras-chave long tail: ${request.longTailKeywords || 'Não informado'}
• Características principais: ${request.features || 'Não informado'}
• Público-alvo: ${request.targetAudience || 'Não informado'}

ANÁLISE DOS REVIEWS (ETAPA 1):
${JSON.stringify(analysisResult, null, 2)}

TÍTULOS GERADOS (ETAPA 2) - Para referência:
${JSON.stringify(titles.slice(0, 3), null, 2)}

Gere bullet points otimizados seguindo as diretrizes acima.`;

      const bulletPointsResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: 0.7,
        maxTokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: bulletPointsContent }
        ],
      });

      const bulletPointsResult = JSON.parse(bulletPointsResponse.content || '[]');
      // Handle both array format or object format from AI response
      const bulletPoints = Array.isArray(bulletPointsResult) ? bulletPointsResult : 
                          (bulletPointsResult.finalBulletPoints || bulletPointsResult.allBulletPoints || []);
      
      totalInputTokens += bulletPointsResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += bulletPointsResponse.usage?.completion_tokens || 0;
      
      console.log(`✅ [ETAPA 3] Bullet points gerados - ${bulletPointsResponse.usage?.prompt_tokens || 0} tokens de entrada, ${bulletPointsResponse.usage?.completion_tokens || 0} tokens de saída`);

      // ETAPA 4: GERAÇÃO DE DESCRIÇÃO COMPLETA
      console.log(`📄 [ETAPA 4] Gerando descrição completa e otimizada...`);
      
      const descriptionContent = `${descriptionPrompt}

DADOS DO PRODUTO:
• Produto: ${request.productName}
• Categoria: ${request.category}
• Palavras-chave principais: ${request.keywords}
• Palavras-chave long tail: ${request.longTailKeywords || 'Não informado'}
• Características principais: ${request.features || 'Não informado'}
• Público-alvo: ${request.targetAudience || 'Não informado'}

ANÁLISE DOS REVIEWS (ETAPA 1):
${JSON.stringify(analysisResult, null, 2)}

TÍTULOS GERADOS (ETAPA 2) - Para referência:
${JSON.stringify(titles.slice(0, 3), null, 2)}

BULLET POINTS GERADOS (ETAPA 3):
${JSON.stringify(bulletPoints, null, 2)}

Crie uma descrição completa seguindo as diretrizes acima.`;

      const descriptionResponse = await aiProviderService.generateResponse({
        provider: agent.provider,
        model: agent.model,
        temperature: 0.6,
        maxTokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: descriptionContent }
        ],
      });

      const description = descriptionResponse.content || '';
      totalInputTokens += descriptionResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += descriptionResponse.usage?.completion_tokens || 0;
      
      console.log(`✅ [ETAPA 4] Descrição gerada - ${descriptionResponse.usage?.prompt_tokens || 0} tokens de entrada, ${descriptionResponse.usage?.completion_tokens || 0} tokens de saída`);

      // Calcular custos e tempo
      const totalTokens = totalInputTokens + totalOutputTokens;
      const cost = (totalTokens / 1000) * parseFloat(agent.costPer1kTokens.toString());
      const processingTime = Date.now() - startTime;
      
      console.log(`🎯 [PIPELINE CONCLUÍDO] 4 etapas finalizadas em ${processingTime}ms`);
      console.log(`📊 [TOKENS FINAIS] Input: ${totalInputTokens}, Output: ${totalOutputTokens}, Total: ${totalTokens}`);
      console.log(`💰 [CUSTO FINAL] $${cost.toFixed(6)} USD`);

      // Salvar registro de uso
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens,
        costUsd: cost.toFixed(6),
        processingTimeMs: processingTime,
        status: 'success'
      });

      // Salvar geração completa
      const generationId = uuidv4();
      await storage.createAgentGeneration({
        id: generationId,
        usageId,
        productName: request.productName,
        productInfo: {
          category: request.category,
          keywords: request.keywords,
          longTailKeywords: request.longTailKeywords,
          features: request.features,
          targetAudience: request.targetAudience
        },
        reviewsData: { data: request.reviewsData, format: request.format },
        analysisResult,
        titles,
        bulletPoints,
        description
      });
      
      console.log(`💾 [DADOS SALVOS] UsageId: ${usageId}, GenerationId: ${generationId}`);

      return {
        analysis: analysisResult,
        titles,
        bulletPoints,
        description,
        processingTime,
        tokensUsed: {
          input: totalInputTokens,
          output: totalOutputTokens,
          total: totalTokens
        },
        cost,
        usageId,
        generationId
      };

    } catch (error: any) {
      console.error(`❌ [PIPELINE ERRO] Falha no processamento: ${error.message}`);
      
      // Salvar erro
      const usageId = uuidv4();
      await storage.createAgentUsage({
        id: usageId,
        agentId: request.agentId,
        userId: request.userId,
        userName: request.userName,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        costUsd: '0',
        processingTimeMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error.message
      });

      throw new Error(`Falha no processamento do Amazon Listing Optimizer: ${error.message}`);
    }
  }
}

export const openaiService = new OpenAIService();
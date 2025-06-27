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
  price?: string;
  keywords: string;
  longTailKeywords?: string;
  features?: string;
  targetAudience?: string;
  competitors?: string;
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
      const analysisResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${analysisPrompt}\n\nProduto: ${request.productName}\n${request.productInfo ? `Informações: ${request.productInfo}\n` : ''}Avaliações:\n${request.reviewsData}`
          }
        ],
      });

      const analysisResult = JSON.parse(analysisResponse.choices[0].message.content || '{}');

      // Step 2: Generate Titles
      const titlesResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: parseFloat(agent.temperature.toString()),
        max_tokens: agent.maxTokens,
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

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
      // Etapa 1: Análise Profunda das Avaliações (10 perguntas do PDF)
      const analysisPrompt = `
Você é um especialista em análise de mercado Amazon. Analise as avaliações dos concorrentes e responda as seguintes 10 perguntas estratégicas:

1. Quais são os 3 principais benefícios mencionados pelos clientes?
2. Quais são as 3 principais dores/problemas relatados?
3. Quais características técnicas são mais valorizadas?
4. Qual é o perfil do público-alvo baseado nas avaliações?
5. Quais são as fraquezas dos concorrentes mais citadas?
6. Quais oportunidades de melhoria você identifica?
7. Quais gatilhos emocionais aparecem nas avaliações?
8. Qual é a intenção de busca predominante dos clientes?
9. Como o preço é percebido pelos compradores?
10. Quais diferenciadores de mercado são valorizados?

Produto: ${request.productName}
Categoria: ${request.category}
Palavras-chave: ${request.keywords}
${request.longTailKeywords ? `Long Tail: ${request.longTailKeywords}` : ''}
${request.features ? `Características: ${request.features}` : ''}
${request.targetAudience ? `Público-alvo: ${request.targetAudience}` : ''}
${request.competitors ? `Concorrentes: ${request.competitors}` : ''}
${request.price ? `Preço: R$ ${request.price}` : ''}

Avaliações dos concorrentes:
${request.reviewsData}

Retorne em formato JSON estruturado com as chaves: mainBenefits, painPoints, keyFeatures, targetAudience, competitorWeaknesses, opportunityAreas, emotionalTriggers, searchIntentAnalysis, pricePositioning, marketDifferentiators.`;

      const analysisResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em análise de mercado Amazon. Sempre responda em formato JSON válido.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
      });

      const analysisResult = JSON.parse(analysisResponse.choices[0].message.content || '{}');
      totalInputTokens += analysisResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += analysisResponse.usage?.completion_tokens || 0;

      // Etapa 2: Geração de 10 Títulos (150-200 caracteres)
      const titlesPrompt = `
Baseado na análise realizada, gere 10 títulos otimizados para Amazon com as seguintes especificações:

- Entre 150-200 caracteres cada
- Use as palavras-chave principais: ${request.keywords}
- Incorpore long tail keywords: ${request.longTailKeywords || 'N/A'}
- Destaque os principais benefícios identificados
- Use características técnicas importantes
- Inclua elementos de urgência/escassez quando apropriado
- Mantenha legibilidade e atratividade
- Siga estrutura: Marca/Nome | Benefício Principal | Características | Diferencial

Análise do produto:
${JSON.stringify(analysisResult, null, 2)}

Retorne um array JSON com 10 títulos otimizados.`;

      const titlesResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: 0.8,
        max_tokens: 1500,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um copywriter especialista em títulos Amazon. Sempre responda com um array JSON válido.' 
          },
          { role: 'user', content: titlesPrompt }
        ],
      });

      const titles = JSON.parse(titlesResponse.choices[0].message.content || '[]');
      totalInputTokens += titlesResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += titlesResponse.usage?.completion_tokens || 0;

      // Etapa 3: Geração de 21 Bullet Points (3 para cada benefício/dor)
      const bulletPointsPrompt = `
Gere 21 bullet points estratégicos para Amazon:

- 3 bullet points para cada um dos principais benefícios identificados
- 3 bullet points para cada uma das principais dores/problemas (como soluções)
- Use símbolos visuais (✓, ★, ⚡, 🔥, etc.)
- Máximo 200 caracteres por bullet point
- Foque em benefícios específicos e mensuráveis
- Use linguagem persuasiva e emocional
- Inclua características técnicas relevantes
- Destaque diferenciadores competitivos

Após gerar os 21, selecione e reescreva os 5 MELHORES bullet points finais que serão usados na listagem.

Análise:
${JSON.stringify(analysisResult, null, 2)}

Retorne JSON com: "allBulletPoints" (array com 21) e "finalBulletPoints" (array com os 5 melhores reescritos).`;

      const bulletPointsResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em bullet points persuasivos para Amazon. Sempre responda em JSON válido.' 
          },
          { role: 'user', content: bulletPointsPrompt }
        ],
      });

      const bulletPointsData = JSON.parse(bulletPointsResponse.choices[0].message.content || '{"finalBulletPoints": []}');
      const bulletPoints = bulletPointsData.finalBulletPoints || bulletPointsData.allBulletPoints?.slice(0, 5) || [];
      totalInputTokens += bulletPointsResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += bulletPointsResponse.usage?.completion_tokens || 0;

      // Etapa 4: Descrição Completa (1700-2000 caracteres)
      const descriptionPrompt = `
Crie uma descrição completa e otimizada para Amazon com 1700-2000 caracteres:

ESTRUTURA OBRIGATÓRIA:
1. Parágrafo de abertura impactante (repetindo palavra-chave principal)
2. Seção de benefícios principais com dados específicos
3. Características técnicas detalhadas
4. Diferenciadores competitivos
5. Garantias e confiabilidade
6. CTA forte e persuasivo no final

REQUISITOS:
- Repita a palavra-chave principal "${request.keywords.split(',')[0]}" pelo menos 3-4 vezes naturalmente
- Use formatação HTML básica (<br>, <b>, <i>)
- Inclua números e especificações técnicas
- Destaque garantias e certificações
- Termine com call-to-action poderoso
- Tom persuasivo mas informativo
- Entre 1700-2000 caracteres exatos

Análise do produto:
${JSON.stringify(analysisResult, null, 2)}

Títulos de referência:
${JSON.stringify(titles.slice(0, 3), null, 2)}

Bullet points de referência:
${JSON.stringify(bulletPoints, null, 2)}

Retorne apenas o texto da descrição otimizada.`;

      const descriptionResponse = await openai.chat.completions.create({
        model: agent.model,
        temperature: 0.6,
        max_tokens: 1000,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um copywriter especialista em descrições Amazon otimizadas. Responda apenas com o texto da descrição.' 
          },
          { role: 'user', content: descriptionPrompt }
        ],
      });

      const description = descriptionResponse.choices[0].message.content || '';
      totalInputTokens += descriptionResponse.usage?.prompt_tokens || 0;
      totalOutputTokens += descriptionResponse.usage?.completion_tokens || 0;

      // Calcular custos e tempo
      const totalTokens = totalInputTokens + totalOutputTokens;
      const inputCostPer1M = 15.00; // GPT-4 pricing
      const outputCostPer1M = 60.00;
      const cost = (totalInputTokens * inputCostPer1M / 1000000) + (totalOutputTokens * outputCostPer1M / 1000000);
      const processingTime = Date.now() - startTime;

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

      // Salvar geração
      const generationId = uuidv4();
      await storage.createAgentGeneration({
        id: generationId,
        usageId,
        productName: request.productName,
        productInfo: {
          category: request.category,
          price: request.price,
          keywords: request.keywords,
          longTailKeywords: request.longTailKeywords,
          features: request.features,
          targetAudience: request.targetAudience,
          competitors: request.competitors
        },
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

      throw new Error(`Falha no processamento: ${error.message}`);
    }
  }
}

export const openaiService = new OpenAIService();
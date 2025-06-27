import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../../storage';
import { openaiService } from '../../../services/openaiService';

// Input validation schema
const processRequestSchema = z.object({
  productName: z.string().min(5, 'Nome do produto deve ter pelo menos 5 caracteres'),
  mainKeywords: z.string().min(1, 'Palavras-chave principais são obrigatórias'),
  longTailKeywords: z.string().optional().default(''),
  features: z.string().min(1, 'Características destacadas são obrigatórias'),
  additionalInfo: z.string().optional().default(''),
  reviewsData: z.object({
    type: z.enum(['csv', 'text']),
    content: z.string().min(10, 'Avaliações devem ter pelo menos 10 caracteres'),
    reviewCount: z.number().min(5, 'Pelo menos 5 avaliações são necessárias')
  })
});

type ProcessRequest = z.infer<typeof processRequestSchema>;

interface ProcessingResult {
  analysis: string;
  titles: string[];
  bulletPoints: string[];
  description: string;
}

const AGENT_ID = 'amazon-listing-agent-001';

export async function processAmazonListing(req: Request, res: Response) {
  const startTime = Date.now();
  let usageId: string | null = null;

  try {
    // Validate input
    const validatedData = processRequestSchema.parse(req.body);
    
    // Create usage record
    usageId = uuidv4();
    await storage.createAgentUsage({
      id: usageId,
      agentId: AGENT_ID,
      userId: 'mock-user-001', // TODO: Get from session
      userName: 'Usuário Demo',
      status: 'success',
      errorMessage: null
    });

    // Get agent configuration
    const agent = await storage.getAgent(AGENT_ID);
    if (!agent) {
      throw new Error('Agente Amazon não encontrado');
    }

    // Prepare variables for prompt substitution
    const variables = {
      '[PRODUTO]': validatedData.productName,
      '[PALAVRAS_CHAVE]': validatedData.mainKeywords,
      '[LONG_TAIL]': validatedData.longTailKeywords,
      '[CARACTERÍSTICAS]': validatedData.features,
      '[PALAVRA_PRINCIPAL]': validatedData.mainKeywords.split(',')[0].trim(),
      '[AVALIAÇÕES]': validatedData.reviewsData.content
    };

    // Process in 4 stages
    const result = await processInStages(agent, variables, validatedData.reviewsData.content);

    // Save generation result
    await storage.createAgentGeneration({
      id: uuidv4(),
      usageId,
      productName: validatedData.productName,
      productInfo: {
        mainKeywords: validatedData.mainKeywords,
        longTailKeywords: validatedData.longTailKeywords,
        features: validatedData.features,
        additionalInfo: validatedData.additionalInfo
      },
      reviewsData: validatedData.reviewsData,
      analysisResult: { analysis: result.analysis },
      titles: result.titles,
      bulletPoints: result.bulletPoints,
      description: result.description
    });

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: result,
      processingTime
    });

  } catch (error) {
    console.error('Amazon listing processing error:', error);

    // Update usage record with error
    if (usageId) {
      await storage.updateAgentUsage(usageId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('OpenAI')) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA temporariamente indisponível. Tente novamente em alguns minutos.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

async function processInStages(agent: any, variables: Record<string, string>, reviewsContent: string): Promise<ProcessingResult> {
  if (!openaiService.isConfigured()) {
    throw new Error('OpenAI API não configurada');
  }

  const config = {
    model: agent.model,
    temperature: parseFloat(agent.temperature),
    maxTokens: agent.maxTokens
  };

  // Stage 1: Analysis of reviews
  const analysisPrompt = createAnalysisPrompt(reviewsContent);
  const analysis = await openaiService.generateCompletion([
    { role: 'system', content: 'Você é um especialista em análise de marketplace Amazon.' },
    { role: 'user', content: analysisPrompt }
  ], config);

  // Stage 2: Generate titles
  const titlesPrompt = createTitlesPrompt(variables);
  const titlesResponse = await openaiService.generateCompletion([
    { role: 'system', content: 'Você é um especialista em criação de títulos para Amazon.' },
    { role: 'user', content: titlesPrompt }
  ], config);
  const titles = extractTitles(titlesResponse);

  // Stage 3: Create bullet points
  const bulletPointsPrompt = createBulletPointsPrompt(variables, analysis);
  const bulletPointsResponse = await openaiService.generateCompletion([
    { role: 'system', content: 'Você é um especialista em copywriting para e-commerce.' },
    { role: 'user', content: bulletPointsPrompt }
  ], config);
  const bulletPoints = extractBulletPoints(bulletPointsResponse);

  // Stage 4: Generate description
  const descriptionPrompt = createDescriptionPrompt(variables, analysis);
  const description = await openaiService.generateCompletion([
    { role: 'system', content: 'Você é um especialista em descrições persuasivas para Amazon.' },
    { role: 'user', content: descriptionPrompt }
  ], config);

  return {
    analysis,
    titles,
    bulletPoints,
    description: description.trim()
  };
}

function createAnalysisPrompt(reviewsContent: string): string {
  return `Analise as seguintes avaliações de produtos similares e responda:

AVALIAÇÕES:
${reviewsContent}

Responda:
1. Quais são os 5 principais pontos de dor dos clientes?
2. Quais são os 7 principais benefícios destacados?
3. Para qual ocasião/evento estes produtos são comprados?
4. Que características os clientes mais valorizam?
5. Que problemas recorrentes aparecem nas avaliações negativas?
6. Que linguagem natural os clientes usam para descrever necessidades?

Seja específico e baseie-se apenas nas avaliações fornecidas.`;
}

function createTitlesPrompt(variables: Record<string, string>): string {
  return `Com base na análise das avaliações, crie 10 títulos para ${variables['[PRODUTO]']} seguindo:

1. Entre 150-200 caracteres
2. Estrutura: [Produto Principal] + [Palavras-chave] + [Características Destacadas]
3. Use palavras-chave: ${variables['[PALAVRAS_CHAVE]']}
4. Use long tail: ${variables['[LONG_TAIL]']}
5. Destaque características: ${variables['[CARACTERÍSTICAS]']}
6. Títulos naturais e profissionais
7. Foque em capacidade, material, design, funcionalidade

Retorne apenas os 10 títulos, um por linha, numerados de 1-10.`;
}

function createBulletPointsPrompt(variables: Record<string, string>, analysis: string): string {
  return `Baseado nos 7 benefícios mais desejados da análise, crie 5 bullet points para ${variables['[PRODUTO]']}:

ANÁLISE PRÉVIA:
${analysis}

DIRETRIZES:
1. Formato: BENEFÍCIO EM MAIÚSCULAS - Características que respaldem
2. Entre 180-250 caracteres cada
3. Tom persuasivo e comercial
4. Foque nos benefícios principais
5. Use palavras-chave naturalmente: ${variables['[PALAVRAS_CHAVE]']}
6. Gere urgência e emoção
7. Seja convincente para adicionar ao carrinho

Retorne apenas os 5 bullet points, um por linha.`;
}

function createDescriptionPrompt(variables: Record<string, string>, analysis: string): string {
  return `Crie descrição persuasiva para ${variables['[PRODUTO]']}:

ANÁLISE PRÉVIA:
${analysis}

DIRETRIZES:
1. Entre 1700-2000 caracteres
2. Tom envolvente e atraente (nunca corporativo)
3. Repita palavra-chave principal várias vezes: ${variables['[PALAVRA_PRINCIPAL]']}
4. Foque nos benefícios e como melhora a vida do cliente
5. Gere urgência para compra imediata
6. Termine com chamada para ação convincente
7. Baseie-se na análise das avaliações

Retorne apenas a descrição, sem formatação adicional.`;
}

function extractTitles(response: string): string[] {
  return response
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(title => title.length > 0)
    .slice(0, 10);
}

function extractBulletPoints(response: string): string[] {
  return response
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[\d\-\*•]\s*/, '').trim())
    .filter(bullet => bullet.length > 0)
    .slice(0, 5);
}
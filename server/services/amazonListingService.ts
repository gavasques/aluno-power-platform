import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { amazonListingSessions, agents, agentUsage, agentGenerations, aiGenerationLogs } from "@shared/schema";
import type { InsertAmazonListingSession, AmazonListingSession } from "@shared/schema";
import { aiProviderService } from "./aiProviderService";

import { storage } from "../storage";
import crypto from "crypto";

export class AmazonListingService {
  
  // Função auxiliar para salvar logs de IA
  async saveAiGenerationLog(
    userId: number,
    feature: string,
    prompt: string,
    response: string,
    provider: string = "openai",
    model: string = "gpt-4o-mini",
    inputTokens: number = 0,
    outputTokens: number = 0,
    totalTokens: number = 0,
    cost: number = 0,
    duration: number = 0
  ): Promise<void> {
    try {
      const logData = {
        userId,
        provider,
        model,
        prompt: prompt.substring(0, 5000), // Limitar tamanho do prompt
        response: response.substring(0, 10000), // Limitar tamanho da resposta
        promptCharacters: prompt.length,
        responseCharacters: response.length,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: cost.toString(),
        duration,
        feature
      };

      await db.insert(aiGenerationLogs).values(logData);
      
      console.log(`💾 [AI_LOG] Amazon Listing - ${feature} saved for user ${userId}`);
    } catch (error) {
      console.error(`❌ [AI_LOG] Error saving Amazon Listing log:`, error);
    }
  }

  // Criar nova sessão
  async createSession(idUsuario: string): Promise<AmazonListingSession> {
    const sessionData: InsertAmazonListingSession = {
      idUsuario,
      status: 'active',
      currentStep: 0
    };

    const [session] = await db.insert(amazonListingSessions).values(sessionData).returning();
    return session;
  }

  // Atualizar dados da sessão
  async updateSessionData(sessionId: string, data: Partial<InsertAmazonListingSession>): Promise<AmazonListingSession> {
    console.log('📝 updateSessionData called:', { 
      sessionId, 
      dataKeys: Object.keys(data),
      bulletPointsData: data.bulletPoints ? data.bulletPoints.substring(0, 50) + '...' : 'não enviado'
    });
    
    try {
      const [session] = await db
        .update(amazonListingSessions)
        .set({ 
          ...data, 
          dataHoraUpdated: new Date() 
        })
        .where(eq(amazonListingSessions.id, sessionId))
        .returning();
      
      console.log('💾 updateSessionData result:', { 
        sessionId, 
        bulletPointsUpdated: !!session?.bulletPoints,
        bulletPointsLength: session?.bulletPoints?.length || 0,
        sessionReturned: !!session
      });
      
      return session;
    } catch (error) {
      console.error('❌ Erro no updateSessionData:', error);
      throw error;
    }
  }

  // Buscar sessão por ID
  async getSession(sessionId: string): Promise<AmazonListingSession | null> {
    const [session] = await db
      .select()
      .from(amazonListingSessions)
      .where(eq(amazonListingSessions.id, sessionId))
      .limit(1);
    
    console.log('🔍 DEBUG - getSession result:', {
      sessionId,
      found: !!session,
      reviewsInsight: !!session?.reviewsInsight,
      titulos: !!session?.titulos,
      bulletPoints: !!session?.bulletPoints,
      currentStep: session?.currentStep,
      status: session?.status
    });
    
    return session || null;
  }

  // Processar Etapa 1: Análise de Avaliações
  async processStep1_AnalysisReviews(sessionId: string): Promise<string> {
    const startTime = Date.now();
    
    console.log('🔍 Buscando sessão:', sessionId);
    const session = await this.getSession(sessionId);
    console.log('🔍 Sessão encontrada:', !!session, session?.id);
    
    if (!session) {
      // Tentar busca direta no banco para debug
      const [directSearch] = await db.select().from(amazonListingSessions).where(eq(amazonListingSessions.id, sessionId));
      console.log('🔍 Busca direta no banco:', !!directSearch, directSearch?.id);
      throw new Error('Sessão não encontrada');
    }

    // Atualizar status
    await this.updateSessionData(sessionId, { 
      status: 'processing', 
      currentStep: 1 
    });

    // Montar prompt da Etapa 1 conforme especificação
    const prompt = this.buildAnalysisPrompt(session.reviewsData || '');

    try {
      // Buscar agente Amazon Listings
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, 'agent-amazon-listings'))
        .limit(1);

      if (!agent) throw new Error('Agente Amazon Listings não encontrado');

      // Preparar dados de entrada para o Prompt 1
      const prompt1Input = {
        sessionId,
        prompt,
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 2000,
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de avaliações de produtos para otimização de listings da Amazon."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        timestamp: new Date().toISOString(),
        provider: "openai"
      };

      // Chamada real para a IA usando AIProviderService
      const analysisResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: agent.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de avaliações da Amazon que identifica padrões de comportamento do consumidor."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });
      
      const analysisResult = analysisResponse.content;

      const duration = Date.now() - startTime;
      
      // Salvar log da Etapa 1 - Análise de Avaliações
      await this.saveAiGenerationLog(
        parseInt(session.idUsuario),
        "amazon-listing-step1-analysis",
        prompt,
        analysisResult,
        "openai",
        agent.model || "gpt-4o-mini",
        1520, // input tokens estimado
        950,  // output tokens estimado
        2470, // total tokens
        0.002470, // custo estimado
        duration
      );

      // Salvar análise na sessão  
      await this.updateSessionData(sessionId, { 
        reviewsInsight: analysisResult,
        status: 'step1_completed'
      });

      // Simular resposta completa do AI provider (formato OpenAI)
      const prompt1Output = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o-mini",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: analysisResult
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 1520,
          completion_tokens: 950,
          total_tokens: 2470
        },
        system_fingerprint: `fp_${Date.now()}`
      };

      // Criar registro de usage para tracking de custos
      const usageId = crypto.randomUUID();
      await storage.createAgentUsage({
        id: usageId,
        agentId: agent.id.toString(),
        userId: session.idUsuario,
        userName: "Sistema",
        inputTokens: 1520,
        outputTokens: 950,
        totalTokens: 2470,
        costUsd: "0.002470", // Simulado: $0.50/1M input + $1.50/1M output
        processingTimeMs: duration,
        status: 'completed'
      });

      // Criar registro de generation com dados detalhados do Prompt 1
      const generationId = crypto.randomUUID();
      await storage.createAgentGeneration({
        id: generationId,
        usageId,
        productName: session.nomeProduto,
        productInfo: session.nomeProduto ? { 
          nome: session.nomeProduto,
          marca: session.marca,
          categoria: session.categoria,
          keywords: session.keywords,
          longTailKeywords: session.longTailKeywords,
          principaisCaracteristicas: session.principaisCaracteristicas,
          publicoAlvo: session.publicoAlvo
        } : null,
        reviewsData: { rawData: session.reviewsData },
        analysisResult: { content: analysisResult },
        
        // Prompt 1 - Dados completos de entrada e saída para análise do admin
        prompt1Input: prompt1Input,
        prompt1Output: prompt1Output,
        prompt1Provider: "openai",
        prompt1Model: "gpt-4o-mini",
        prompt1Tokens: { input: 1520, output: 950, total: 2470 },
        prompt1Cost: "0.002470",
        prompt1Duration: duration
      });

      // Salvar resultado no banco
      await this.updateSessionData(sessionId, {
        reviewsInsight: analysisResult,
        currentStep: 1,
        status: 'active',
        providerAI: agent.provider,
        modelAI: agent.model
      });

      return analysisResult;
    } catch (error) {
      await this.updateSessionData(sessionId, { status: 'active' });
      throw error;
    }
  }

  // Processar Etapa 2: Gerar Títulos
  async processStep2_GenerateTitles(sessionId: string): Promise<string> {
    const startTime = Date.now();
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Sessão não encontrada');

    // Verificar se etapa 1 foi concluída
    if (!session.reviewsInsight) {
      throw new Error('Análise de avaliações deve ser concluída primeiro');
    }

    // Atualizar status
    await this.updateSessionData(sessionId, { 
      status: 'processing', 
      currentStep: 2 
    });

    // Montar prompt da Etapa 2 conforme especificação
    const prompt = this.buildTitlesPrompt(session);

    try {
      // Buscar agente Amazon Listings
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, 'agent-amazon-listings'))
        .limit(1);

      if (!agent) throw new Error('Agente Amazon Listings não encontrado');

      // Preparar dados de entrada para o Prompt 2
      const prompt2Input = {
        sessionId,
        prompt,
        model: "gpt-4o-mini",
        temperature: 0.8,
        maxTokens: 1000,
        messages: [
          {
            role: "system",
            content: "Você é um especialista em criação de títulos otimizados para Amazon que maximizam CTR e conversões."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        productData: {
          nome: session.nomeProduto,
          marca: session.marca,
          categoria: session.categoria,
          keywords: session.keywords,
          longTailKeywords: session.longTailKeywords,
          principaisCaracteristicas: session.principaisCaracteristicas,
          publicoAlvo: session.publicoAlvo
        },
        analysisInsight: session.reviewsInsight,
        timestamp: new Date().toISOString(),
        provider: "openai"
      };

      // Chamada real para a IA usando AIProviderService
      const titlesResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: agent.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em títulos de Amazon que maximizam CTR e conversões."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });
      
      console.log('🔍 DEBUG - titlesResponse:', {
        hasResponse: !!titlesResponse,
        responseType: typeof titlesResponse,
        hasContent: !!titlesResponse?.content,
        contentLength: titlesResponse?.content?.length || 0,
        contentPreview: titlesResponse?.content?.substring(0, 100) || 'VAZIO'
      });
      
      // Extrair conteúdo baseado na estrutura AIResponse
      let titlesResult;
      if (typeof titlesResponse === 'string') {
        titlesResult = titlesResponse;
      } else if (titlesResponse && typeof titlesResponse === 'object') {
        titlesResult = titlesResponse.content || titlesResponse.message || JSON.stringify(titlesResponse);
      } else {
        titlesResult = String(titlesResponse || '');
      }
      
      console.log('🔍 DEBUG - Extracted titlesResult:', {
        resultType: typeof titlesResult,
        resultLength: titlesResult?.length || 0,
        resultPreview: titlesResult?.substring(0, 100) || 'VAZIO'
      });

      const duration = Date.now() - startTime;
      
      // Salvar log da Etapa 2 - Geração de Títulos
      await this.saveAiGenerationLog(
        parseInt(session.idUsuario),
        "amazon-listing-step2-titles",
        prompt,
        titlesResult,
        "openai",
        agent.model || "gpt-4o-mini",
        850,  // input tokens estimado
        320,  // output tokens estimado
        1170, // total tokens
        0.001170, // custo estimado
        duration
      );

      // Salvar títulos na sessão
      await this.updateSessionData(sessionId, { 
        titulos: titlesResult,
        status: 'step2_completed'
      });

      // Simular resposta completa do AI provider para Prompt 2
      const prompt2Output = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o-mini",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: titlesResult
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 850,
          completion_tokens: 320,
          total_tokens: 1170
        },
        system_fingerprint: `fp_${Date.now()}`
      };

      // Criar agent_usage para Prompt 2
      const usageId2 = crypto.randomUUID();
      await storage.createAgentUsage({
        id: usageId2,
        agentId: agent.id.toString(),
        userId: session.idUsuario,
        userName: "Sistema",
        inputTokens: 850,
        outputTokens: 320,
        totalTokens: 1170,
        costUsd: "0.001170",
        processingTimeMs: duration,
        status: 'completed'
      });

      // Buscar o registro de generation existente para atualizar com dados do Prompt 2
      const existingGeneration = await db
        .select()
        .from(agentGenerations)
        .where(eq(agentGenerations.productName, session.nomeProduto || ''))
        .orderBy(desc(agentGenerations.createdAt))
        .limit(1);

      if (existingGeneration.length > 0) {
        // Atualizar generation existente com dados do Prompt 2
        await storage.updateAgentGeneration(existingGeneration[0].id, {
          titles: { content: titlesResult },
          
          // Prompt 2 - Dados completos de entrada e saída para análise do admin
          prompt2Input: prompt2Input,
          prompt2Output: prompt2Output,
          prompt2Provider: "openai",
          prompt2Model: "gpt-4o-mini",
          prompt2Tokens: { input: 850, output: 320, total: 1170 },
          prompt2Cost: "0.001170",
          prompt2Duration: duration
        });
      } else {
        // Criar novo generation se não existir
        await storage.createAgentGeneration({
          id: crypto.randomUUID(),
          usageId: usageId2,
          productName: session.nomeProduto,
          productInfo: {
            nome: session.nomeProduto,
            marca: session.marca,
            categoria: session.categoria,
            keywords: session.keywords,
            longTailKeywords: session.longTailKeywords,
            principaisCaracteristicas: session.principaisCaracteristicas,
            publicoAlvo: session.publicoAlvo
          },
          reviewsData: { rawData: session.reviewsData },
          titles: { content: titlesResult },
          
          // Prompt 2 - Dados completos de entrada e saída para análise do admin
          prompt2Input: prompt2Input,
          prompt2Output: prompt2Output,
          prompt2Provider: "openai",
          prompt2Model: "gpt-4o-mini",
          prompt2Tokens: { input: 850, output: 320, total: 1170 },
          prompt2Cost: "0.001170",
          prompt2Duration: duration
        });
      }

      // Salvar resultado no banco
      await this.updateSessionData(sessionId, {
        titulos: titlesResult,
        currentStep: 2,
        status: 'completed'
      });

      return titlesResult;
    } catch (error) {
      await this.updateSessionData(sessionId, { status: 'active' });
      throw error;
    }
  }

  // Processar Etapa 3: Gerar Bullet Points
  async processStep3_BulletPoints(sessionId: string): Promise<string> {
    const startTime = Date.now();
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Sessão não encontrada');

    // Verificar se etapas anteriores foram concluídas
    console.log('🔍 DEBUG - Validação Etapa 3:', {
      sessionId,
      hasReviewsInsight: !!session.reviewsInsight,
      hasTitulos: !!session.titulos,
      reviewsInsightLength: session.reviewsInsight?.length || 0,
      titulosLength: session.titulos?.length || 0,
      currentStep: session.currentStep,
      status: session.status
    });
    
    if (!session.reviewsInsight) {
      throw new Error('Análise de avaliações deve ser concluída primeiro');
    }
    if (!session.titulos) {
      throw new Error('Títulos devem ser gerados primeiro');
    }

    // Atualizar status
    await this.updateSessionData(sessionId, { 
      status: 'processing', 
      currentStep: 3 
    });

    // Montar prompt da Etapa 3 conforme especificação
    const prompt = this.buildBulletPointsPrompt(session);

    try {
      // Buscar agente Amazon Listings
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, 'agent-amazon-listings'))
        .limit(1);

      if (!agent) throw new Error('Agente Amazon Listings não encontrado');

      // Preparar dados de entrada para o Prompt 3
      const prompt3Input = {
        sessionId,
        prompt,
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 2000,
        messages: [
          {
            role: "system",
            content: "Você é um especialista em criação de bullet points persuasivos para Amazon que maximizam conversões."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        productData: {
          nome: session.nomeProduto,
          marca: session.marca,
          categoria: session.categoria,
          keywords: session.keywords,
          longTailKeywords: session.longTailKeywords,
          principaisCaracteristicas: session.principaisCaracteristicas,
          publicoAlvo: session.publicoAlvo
        },
        analysisInsight: session.reviewsInsight,
        titles: session.titulos,
        timestamp: new Date().toISOString(),
        provider: "openai"
      };

      // Chamada real para a IA usando AIProviderService
      const bulletPointsResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: agent.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em criação de bullet points persuasivos para Amazon que maximizam conversões."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });
      
      console.log('🔍 DEBUG - bulletPointsResponse:', {
        hasResponse: !!bulletPointsResponse,
        responseType: typeof bulletPointsResponse,
        hasContent: !!bulletPointsResponse?.content,
        contentType: typeof bulletPointsResponse?.content,
        contentLength: bulletPointsResponse?.content?.length || 0,
        contentPreview: bulletPointsResponse?.content?.substring(0, 100) || 'VAZIO'
      });
      
      // Extrair conteúdo baseado na estrutura AIResponse
      let bulletPointsResult;
      if (typeof bulletPointsResponse === 'string') {
        bulletPointsResult = bulletPointsResponse;
      } else if (bulletPointsResponse && typeof bulletPointsResponse === 'object') {
        bulletPointsResult = bulletPointsResponse.content || bulletPointsResponse.message || JSON.stringify(bulletPointsResponse);
      } else {
        bulletPointsResult = String(bulletPointsResponse || '');
      }
      
      console.log('🔍 DEBUG - Extracted bulletPointsResult:', {
        resultType: typeof bulletPointsResult,
        resultLength: bulletPointsResult?.length || 0,
        resultPreview: bulletPointsResult?.substring(0, 100) || 'VAZIO'
      });

      const duration = Date.now() - startTime;
      
      // Salvar log da Etapa 3 - Geração de Bullet Points
      await this.saveAiGenerationLog(
        parseInt(session.idUsuario),
        "amazon-listing-step3-bulletpoints",
        prompt,
        bulletPointsResult,
        "openai",
        agent.model || "gpt-4o-mini",
        1200, // input tokens estimado
        450,  // output tokens estimado
        1650, // total tokens
        0.001650, // custo estimado
        duration
      );

      // Salvar bullet points na sessão
      console.log('🔄 ANTES de salvar bullet points na sessão');
      console.log('🔍 DEBUG - bulletPointsResult final:', {
        sessionId,
        resultType: typeof bulletPointsResult,
        resultLength: bulletPointsResult?.length || 0,
        resultPreview: bulletPointsResult?.substring(0, 100) || 'VAZIO',
        resultExists: !!bulletPointsResult
      });
      
      await this.updateSessionData(sessionId, { 
        bulletPoints: bulletPointsResult,
        status: 'step3_completed'
      });
      console.log('✅ DEPOIS de salvar bullet points na sessão');

      // Simular resposta completa do AI provider para Prompt 3
      const prompt3Output = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o-mini",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: bulletPointsResult
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 1200,
          completion_tokens: 380,
          total_tokens: 1580
        },
        system_fingerprint: `fp_${Date.now()}`
      };

      // Criar agent_usage para Prompt 3
      const usageId3 = crypto.randomUUID();
      await storage.createAgentUsage({
        id: usageId3,
        agentId: agent.id.toString(),
        userId: session.idUsuario,
        userName: "Sistema",
        inputTokens: 1200,
        outputTokens: 380,
        totalTokens: 1580,
        costUsd: "0.001580",
        processingTimeMs: duration,
        status: 'completed'
      });

      // Buscar o registro de generation existente para atualizar com dados do Prompt 3
      const existingGeneration = await db
        .select()
        .from(agentGenerations)
        .where(eq(agentGenerations.productName, session.nomeProduto || ''))
        .orderBy(desc(agentGenerations.createdAt))
        .limit(1);

      if (existingGeneration.length > 0) {
        // Atualizar generation existente com dados do Prompt 3
        await storage.updateAgentGeneration(existingGeneration[0].id, {
          bulletPoints: { content: bulletPointsResult },
          
          // Prompt 3 - Dados completos de entrada e saída para análise do admin
          prompt3Input: prompt3Input,
          prompt3Output: prompt3Output,
          prompt3Provider: "openai",
          prompt3Model: "gpt-4o-mini",
          prompt3Tokens: { input: 1200, output: 380, total: 1580 },
          prompt3Cost: "0.001580",
          prompt3Duration: duration
        });
      }

      // Salvar resultado no banco
      console.log('💾 Salvando bullet points na sessão:', { 
        sessionId, 
        bulletPointsLength: bulletPointsResult?.length || 0,
        bulletPointsPreview: bulletPointsResult?.substring(0, 100) + '...'
      });
      
      await this.updateSessionData(sessionId, {
        bulletPoints: bulletPointsResult,
        currentStep: 3,
        status: 'step3_completed'
      });

      return bulletPointsResult;
    } catch (error) {
      await this.updateSessionData(sessionId, { status: 'active' });
      throw error;
    }
  }

  // Processar Etapa 4: Gerar Descrição Completa
  async processStep4_Description(sessionId: string): Promise<string> {
    const startTime = Date.now();
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Sessão não encontrada');

    // Verificar se etapas anteriores foram concluídas
    console.log('🔍 DEBUG - Session validation:', {
      sessionId,
      hasReviewsInsight: !!session.reviewsInsight,
      hasTitulos: !!session.titulos,
      hasBulletPoints: !!session.bulletPoints,
      reviewsInsightLength: session.reviewsInsight?.length || 0,
      titulosLength: session.titulos?.length || 0,
      bulletPointsLength: session.bulletPoints?.length || 0,
      sessionStatus: session.status,
      currentStep: session.currentStep
    });
    
    // Simplificar validação temporariamente para debug
    if (!session.reviewsInsight) {
      throw new Error('Etapa 1 (Análise) não foi concluída. ReviewsInsight não encontrado.');
    }
    if (!session.titulos) {
      throw new Error('Etapa 2 (Títulos) não foi concluída. Titulos não encontrado.');
    }
    if (!session.bulletPoints) {
      throw new Error('Etapa 3 (Bullet Points) não foi concluída. BulletPoints não encontrado.');
    }

    // Atualizar status
    await this.updateSessionData(sessionId, { 
      status: 'processing', 
      currentStep: 4 
    });

    // Montar prompt da Etapa 4 conforme especificação
    const prompt = this.buildDescriptionPrompt(session);

    try {
      // Buscar agente Amazon Listings
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, 'agent-amazon-listings'))
        .limit(1);

      if (!agent) throw new Error('Agente Amazon Listings não encontrado');

      // Preparar dados de entrada para o Prompt 4
      const prompt4Input = {
        sessionId,
        prompt,
        model: "gpt-4o-mini",
        temperature: 0.6,
        maxTokens: 1000,
        messages: [
          {
            role: "system",
            content: "Você é um especialista em descrições de produtos Amazon que convertem visitantes em compradores."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        productData: {
          nome: session.nomeProduto,
          marca: session.marca,
          categoria: session.categoria,
          keywords: session.keywords,
          longTailKeywords: session.longTailKeywords,
          principaisCaracteristicas: session.principaisCaracteristicas,
          publicoAlvo: session.publicoAlvo
        },
        analysisInsight: session.reviewsInsight,
        titles: session.titulos,
        bulletPoints: session.bulletPoints,
        timestamp: new Date().toISOString(),
        provider: "openai"
      };

      // Chamada real para a IA usando AIProviderService
      const descriptionResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: agent.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em descrições de produtos Amazon que convertem visitantes em compradores."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });
      
      const descriptionResult = descriptionResponse.content;

      const duration = Date.now() - startTime;
      
      // Salvar log da Etapa 4 - Geração de Descrição
      await this.saveAiGenerationLog(
        parseInt(session.idUsuario),
        "amazon-listing-step4-description",
        prompt,
        descriptionResult,
        "openai",
        agent.model || "gpt-4o-mini",
        1500, // input tokens estimado
        600,  // output tokens estimado
        2100, // total tokens
        0.002100, // custo estimado
        duration
      );

      // Simular resposta completa do AI provider para Prompt 4
      const prompt4Output = {
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o-mini",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: descriptionResult
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 1500,
          completion_tokens: 650,
          total_tokens: 2150
        },
        system_fingerprint: `fp_${Date.now()}`
      };

      // Criar agent_usage para Prompt 4
      const usageId4 = crypto.randomUUID();
      await storage.createAgentUsage({
        id: usageId4,
        agentId: agent.id.toString(),
        userId: session.idUsuario,
        userName: "Sistema",
        inputTokens: 1500,
        outputTokens: 650,
        totalTokens: 2150,
        costUsd: "0.002150",
        processingTimeMs: duration,
        status: 'completed'
      });

      // Buscar o registro de generation existente para atualizar com dados do Prompt 4
      const existingGeneration = await db
        .select()
        .from(agentGenerations)
        .where(eq(agentGenerations.productName, session.nomeProduto || ''))
        .orderBy(desc(agentGenerations.createdAt))
        .limit(1);

      if (existingGeneration.length > 0) {
        // Atualizar generation existente com dados do Prompt 4
        await storage.updateAgentGeneration(existingGeneration[0].id, {
          description: { content: descriptionResult },
          
          // Prompt 4 - Dados completos de entrada e saída para análise do admin
          prompt4Input: prompt4Input,
          prompt4Output: prompt4Output,
          prompt4Provider: "openai",
          prompt4Model: "gpt-4o-mini",
          prompt4Tokens: { input: 1500, output: 650, total: 2150 },
          prompt4Cost: "0.002150",
          prompt4Duration: duration
        });
      }

      // Salvar resultado no banco
      await this.updateSessionData(sessionId, {
        descricao: descriptionResult,
        currentStep: 4,
        status: 'completed'
      });

      return descriptionResult;
    } catch (error) {
      await this.updateSessionData(sessionId, { status: 'active' });
      throw error;
    }
  }

  // Abortar processamento
  async abortProcessing(sessionId: string): Promise<void> {
    await this.updateSessionData(sessionId, { 
      status: 'aborted' 
    });
  }

  // Construir prompt da Etapa 1 conforme especificação
  private buildAnalysisPrompt(reviewsData: string): string {
    return `# PROMPT 1 - Análise de Avaliações

Estou informando aqui, um aglomerado de avaliações de meus competidores, com produtos similares, agregue e analise todas as avaliações de produtos juntas, para que analise a informação de maneira completa.

## ETAPA 1
A Análise deve focar nos seguintes pontos:
01 – Características desejadas pelos clientes
02 – Problemas recorrentes e pontos de dor mencionados nas avaliações negativas
03 – Identificar a linguagem natural que os clientes usam para descrever suas necessidades
04 – Sugestões para destacar essas características e/ou soluções do listing para meu produto.

Por favor, me avise quando a análise estiver completa.

## ETAPA 2
Com a análise completa da etapa 1, vamos para a proxima etapa, onde com base no que você tem de informações agora, mais o conteudo completo das avaliações, vamos responder algumas perguntas: 

### PERGUNTAS
1. Que pontos de vista interessantes emergem após analisar os dados?
(Comente tanto aspectos positivos quanto negativos que chamaram a atenção).

2. Quais são os 5 principais pontos de dor que os clientes experimentam com estes produtos? 
(Enumere-os em ordem de importância segundo a frequência e severidade mencionadas nas avaliações).

3. Quais são os 7 principais benefícios que os clientes destacam? 
(Por favor, enumere-os em ordem de relevância segundo a frequência com que são mencionados e a satisfação gerada).

4. Para qual evento ou ocasião estes produtos são comprados? 
(Organize as ocasiões ou eventos mais comuns segundo as avaliações, como uso diário, esporte, viagens, etc.).

5. Se você tivesse que desenhar O MELHOR produto do planeta, que características chave incluiria para transformá-lo em um sucesso de vendas e por quê? 
(Explore materiais, design, funcionalidade e outros aspectos táticos baseados na análise).

6. Que tipo de embalagem você recomendaria e por quê? 
(Considere sustentabilidade, funcionalidade e a experiência do cliente).

7. Que tipo de material você recomendaria para este produto e por quê? 
(Leve em conta durabilidade, estética, conforto e qualquer outro fator relevante).

8. Que produtos adicionais pequenos e leves poderíamos incluir para surpreender o cliente e melhorar sua experiência? 
(Também sugira produtos digitais que possam aumentar a experiência do cliente após a compra).

9. Existe algum dado interessante ou tendência que tenha emergido da análise das avaliações e que deva conhecer? 
(Qualquer dado fora do comum ou tendência nas preferências do cliente).

10. Que perguntas importantes eu deveria fazer e provavelmente não estou fazendo? 
(Ajude-me a descobrir aspectos que não considerei em relação ao produto ou à experiência do cliente).

A ideia é que responda de forma simples, a pergunta/resposta a cada pergunta. De forma detalhada.

## DADOS DAS AVALIAÇÕES:
${reviewsData}`;
  }

  // Construir prompt da Etapa 2 conforme especificação
  private buildTitlesPrompt(session: AmazonListingSession): string {
    return `Você é um especialista em gerar títulos que gerem alta taxa de CTR e conversão para a Amazon.

INFORMAÇÕES DO PRODUTO:
Nome: ${session.nomeProduto || ''}
Marca: ${session.marca || ''}
Categoria: ${session.categoria || ''}
Keywords: ${session.keywords || ''}
Long Tail Keywords: ${session.longTailKeywords || ''}
Características: ${session.principaisCaracteristicas || ''}
Público Alvo: ${session.publicoAlvo || ''}

ANÁLISE DAS AVALIAÇÕES:
${session.reviewsInsight || ''}

Gere 5 títulos otimizados que tenham:
- Entre 150 e 200 caracteres
- Palavras-chave integradas naturalmente
- Características importantes destacadas
- Marca posicionada estrategicamente

Retorne APENAS os 5 títulos numerados (1, 2, 3, 4, 5), sem explicações ou estruturas.`;
  }

  // Construir prompt da Etapa 3 conforme especificação
  private buildBulletPointsPrompt(session: AmazonListingSession): string {
    return `Você é um especialista em criar bullet points persuasivos para Amazon que maximizam conversões.

INFORMAÇÕES DO PRODUTO:
Nome: ${session.nomeProduto || ''}
Marca: ${session.marca || ''}
Categoria: ${session.categoria || ''}
Keywords: ${session.keywords || ''}
Long Tail Keywords: ${session.longTailKeywords || ''}
Características: ${session.principaisCaracteristicas || ''}
Público Alvo: ${session.publicoAlvo || ''}

ANÁLISE DAS AVALIAÇÕES (ETAPA 1):
${session.reviewsInsight || ''}

TÍTULOS GERADOS (ETAPA 2):
${session.titulos || ''}

Crie 7 bullet points otimizados que tenham:
- Entre 200-280 caracteres cada
- NUNCA MENOS DE 190 CARACTERES CADA BULLET
- NUNCA EXCEDA 280 caracteres cada BULLET POINT
- Destaque benefícios específicos
- Resolva pontos de dor identificados
- Use linguagem emocional e persuasiva
- Inclua especificações técnicas relevantes

Faça os marcadores soarem mais comerciais e persuasivos, com um foco em despertar o desejo de compra dos clientes. Transforme cada marcador em uma verdadeira chamada à ação que impulsione os compradores a agir agora. Os marcadores devem ser mais dinâmicos, focados nos benefícios principais, e ressaltar o valor do produto de forma irresistível.

Formato: ✅ **TÍTULO**: Descrição do benefício
Retorne APENAS os 7 bullet points, sem numeração ou explicações.`;
  }

  // Construir prompt da Etapa 4 conforme especificação
  private buildDescriptionPrompt(session: AmazonListingSession): string {
    return `Você é um especialista em descrições de produtos Amazon que convertem visitantes em compradores.

INFORMAÇÕES DO PRODUTO:
Nome: ${session.nomeProduto || ''}
Marca: ${session.marca || ''}
Categoria: ${session.categoria || ''}
Keywords: ${session.keywords || ''}
Long Tail Keywords: ${session.longTailKeywords || ''}
Características: ${session.principaisCaracteristicas || ''}
Público Alvo: ${session.publicoAlvo || ''}

ANÁLISE DAS AVALIAÇÕES (ETAPA 1):
${session.reviewsInsight || ''}

TÍTULOS GERADOS (ETAPA 2):
${session.titulos || ''}

BULLET POINTS GERADOS (ETAPA 3):
${session.bulletPoints || ''}

Escreva uma descrição detalhada (500-1000 palavras) que:
- Conte uma história envolvente
- Destaque todos os benefícios principais
- Aborde objeções comuns
- Use linguagem persuasiva
- Inclua call-to-action forte
- Mantenha tom profissional mas acessível

NUNCA USE EMOJIS, NUNCA USA NEGRITO. 
NÃO USE MENOS DE 1400 caracteres
NUNCA MAIS DE 2000 CARACTERES.

Retorne APENAS o texto da descrição, sem títulos ou explicações.`;
  }

  // Gerar conteúdo para download
  generateDownloadContent(session: AmazonListingSession): string {
    const content = `AMAZON LISTING OPTIMIZER - RESULTADOS
===============================================

SESSÃO: ${session.sessionHash}
USUÁRIO: ${session.idUsuario}
DATA: ${session.dataHoraCreated.toLocaleDateString('pt-BR')} ${session.dataHoraCreated.toLocaleTimeString('pt-BR')}

DADOS DO PRODUTO:
- Nome: ${session.nomeProduto || 'N/A'}
- Marca: ${session.marca || 'N/A'}
- Categoria: ${session.categoria || 'N/A'}
- Keywords: ${session.keywords || 'N/A'}
- Long Tail Keywords: ${session.longTailKeywords || 'N/A'}
- Características: ${session.principaisCaracteristicas || 'N/A'}
- Público Alvo: ${session.publicoAlvo || 'N/A'}

===============================================
ANÁLISE DAS AVALIAÇÕES:
===============================================

${session.reviewsInsight || 'Análise não realizada'}

===============================================
TÍTULOS GERADOS:
===============================================

${session.titulos || 'Títulos não gerados'}

===============================================
Gerado pelo Amazon Listing Optimizer
Powered by ${session.providerAI} ${session.modelAI}
===============================================`;

    return content;
  }
}

export const amazonListingService = new AmazonListingService();
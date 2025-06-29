import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { amazonListingSessions, agents, agentUsage, agentGenerations } from "@shared/schema";
import type { InsertAmazonListingSession, AmazonListingSession } from "@shared/schema";
import { aiProviderService } from "./aiProviderService";
import { storage } from "../storage";
import crypto from "crypto";

export class AmazonListingService {
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
    const [session] = await db
      .update(amazonListingSessions)
      .set({ 
        ...data, 
        dataHoraUpdated: new Date() 
      })
      .where(eq(amazonListingSessions.id, sessionId))
      .returning();
    
    return session;
  }

  // Buscar sessão por ID
  async getSession(sessionId: string): Promise<AmazonListingSession | null> {
    const [session] = await db
      .select()
      .from(amazonListingSessions)
      .where(eq(amazonListingSessions.id, sessionId))
      .limit(1);
    
    return session || null;
  }

  // Processar Etapa 1: Análise de Avaliações
  async processStep1_AnalysisReviews(sessionId: string): Promise<string> {
    const startTime = Date.now();
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Sessão não encontrada');

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

      // Simular resposta da IA para teste (substituir por integração real)
      const analysisResult = `# ANÁLISE COMPLETA DAS AVALIAÇÕES

## ETAPA 1 - ANÁLISE FOCADA
### 01 – Características desejadas pelos clientes
Com base nas avaliações analisadas, os clientes valorizam principalmente:
- Durabilidade e qualidade dos materiais
- Facilidade de uso e instalação
- Boa relação custo-benefício
- Design atrativo e funcional

### 02 – Problemas recorrentes e pontos de dor
Os principais problemas identificados incluem:
- Dificuldades na instalação/configuração
- Qualidade inferior dos materiais
- Atendimento ao cliente deficiente
- Problemas de compatibilidade

### 03 – Linguagem natural dos clientes
Os clientes frequentemente usam termos como:
- "Fácil de usar", "Intuitivo", "Prático"
- "Vale o investimento", "Custo-benefício"
- "Resistente", "Durável", "Bem construído"
- "Rápido", "Eficiente", "Confiável"

### 04 – Sugestões para o listing
- Destacar facilidade de instalação/uso
- Enfatizar qualidade e durabilidade
- Mencionar garantia e suporte
- Usar linguagem acessível e confiável

## ETAPA 2 - PERGUNTAS RESPONDIDAS

### 1. Pontos de vista interessantes
**Positivos:** Clientes valorizam produtos que "simplesmente funcionam" sem complicações
**Negativos:** Frustração alta com produtos que prometem muito mas entregam pouco

### 2. Os 5 principais pontos de dor
1. **Dificuldade de instalação/configuração** (Alta frequência/severidade)
2. **Qualidade inferior aos concorrentes** (Média-alta frequência)
3. **Falta de suporte técnico adequado** (Média frequência)
4. **Incompatibilidade com outros produtos** (Média frequência)
5. **Preço elevado vs. benefícios** (Baixa-média frequência)

### 3. Os 7 principais benefícios destacados
1. **Facilidade de uso** (Mencionado em 80% das avaliações positivas)
2. **Qualidade do material** (Mencionado em 75% das avaliações)
3. **Boa relação custo-benefício** (70% das avaliações)
4. **Design atrativo** (65% das avaliações)
5. **Durabilidade comprovada** (60% das avaliações)
6. **Instalação rápida** (55% das avaliações)
7. **Compatibilidade ampla** (45% das avaliações)

### 4. Eventos/ocasiões de compra
- **Uso doméstico diário** (60% dos casos)
- **Projetos de melhoria residencial** (25% dos casos)
- **Necessidades profissionais** (10% dos casos)
- **Presentes e ocasiões especiais** (5% dos casos)

### 5. Características do produto ideal
- **Materiais premium** com certificações de qualidade
- **Design ergonômico** e esteticamente agradável
- **Instalação plug-and-play** sem ferramentas
- **Compatibilidade universal** com padrões do mercado
- **Garantia estendida** e suporte técnico 24/7

### 6. Embalagem recomendada
- **Sustentável:** Materiais recicláveis e biodegradáveis
- **Funcional:** Proteção adequada durante transporte
- **Experiência:** Unboxing agradável com instruções visuais
- **Reutilizável:** Embalagem que serve para armazenamento

### 7. Material recomendado
- **Metais:** Ligas resistentes à corrosão para durabilidade
- **Plásticos:** ABS ou policarbonato para resistência
- **Tecidos:** Materiais antimicrobianos quando aplicável
- **Acabamentos:** Tratamentos que resistem ao uso intenso

### 8. Produtos adicionais para surpreender
**Físicos:**
- Kit de instalação completo
- Manual ilustrado em português
- Cabo de conexão premium
- Adesivos de marca
**Digitais:**
- App móvel complementar
- Vídeos tutoriais exclusivos
- Suporte via WhatsApp
- Programa de fidelidade

### 9. Dados interessantes/tendências
- **85% dos clientes** pesquisam vídeos antes de comprar
- **Avaliações 4+ estrelas** aumentam conversão em 40%
- **Resposta rápida** do vendedor impacta decisão de compra
- **Fotos reais** dos clientes geram mais confiança

### 10. Perguntas importantes não feitas
- Como medir satisfação pós-venda para melhorar continuamente?
- Qual estratégia de precificação dinâmica maximiza conversão?
- Como criar programa de fidelização que retenha clientes?
- Quais parcerias estratégicas podem ampliar distribuição?`;

      const duration = Date.now() - startTime;

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

      // Simular resposta da IA para teste (substituir por integração real)
      const titlesResult = `1. ${session.nomeProduto || 'Produto'} ${session.marca || 'Premium'} - ${session.keywords || 'Palavras-chave'} | ${session.principaisCaracteristicas || 'Características'} - ${session.marca || 'Marca'}

2. ${session.marca || 'Marca'} ${session.nomeProduto || 'Produto'} Professional | ${session.keywords || 'Palavras-chave'} com ${session.principaisCaracteristicas || 'Características'} para ${session.publicoAlvo || 'Público'}

3. ${session.nomeProduto || 'Produto'} ${session.marca || 'Marca'} Original | ${session.keywords || 'Keywords'} ${session.longTailKeywords || 'Long-tail'} - ${session.principaisCaracteristicas || 'Features'}

4. Kit ${session.nomeProduto || 'Produto'} ${session.marca || 'Marca'} Completo - ${session.keywords || 'Palavras-chave'} Premium | ${session.principaisCaracteristicas || 'Características'} Profissional

5. ${session.marca || 'Marca'} ${session.nomeProduto || 'Produto'} Pro Series | ${session.keywords || 'Keywords'} de Alta Performance - ${session.principaisCaracteristicas || 'Features'} para ${session.publicoAlvo || 'Público-alvo'}`;

      const duration = Date.now() - startTime;

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
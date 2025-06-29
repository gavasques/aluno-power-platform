import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { amazonListingSessions, agents } from "@shared/schema";
import type { InsertAmazonListingSession, AmazonListingSession } from "@shared/schema";
import { openAIService } from "./openaiService";
import { v4 as uuidv4 } from 'uuid';

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

      // Enviar para IA
      const response = await openAIService.generateCompletion({
        model: agent.model,
        prompt: prompt,
        maxTokens: parseInt(agent.maxTokens.toString()),
        temperature: parseFloat(agent.temperature.toString())
      });

      const analysisResult = response.content;

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

      // Enviar para IA
      const response = await openAIService.generateCompletion({
        model: agent.model,
        prompt: prompt,
        maxTokens: parseInt(agent.maxTokens.toString()),
        temperature: parseFloat(agent.temperature.toString())
      });

      const titlesResult = response.content;

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
    return `# PROMPT 2 - Geração de Títulos

## INFORMAÇÕES DO PRODUTO:
Nome do Produto: ${session.nomeProduto || ''}
Marca: ${session.marca || ''}
Categoria: ${session.categoria || ''}
Keywords: ${session.keywords || ''}
Long Tail Keywords: ${session.longTailKeywords || ''}
Principais Características: ${session.principaisCaracteristicas || ''}
Público Alvo: ${session.publicoAlvo || ''}

Você é um especialista em gerar títulos que gerem alta taxa de CTR e conversão para a Amazon. Te dei algumas informações acima sobre o produto que vamos trabalhar. 

Com base nessas informações, vamos desenvolver 5 opções de títulos diferentes, que cumpram com o seguinte:

01 – O título deve ter entre 150 e 200 caracteres
02 – A Estrutura deve ser [Produto Principal] + [Palavras Chave] + [Características Destacadas] + [Marca]
03 – Utilize as seguintes palavras chave de forma orgânica, mas sem forçar

Se necessário, use palavras long tail, características, sempre quando for importante.

Por favor, forneça exatamente 5 opções de títulos numeradas de 1 a 5.`;
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
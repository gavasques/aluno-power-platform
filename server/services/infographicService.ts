import { db } from '../db';
import { infographics, infographicConcepts, users, type InsertInfographic, type InsertInfographicConcept } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface ProductData {
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  effortLevel: 'normal' | 'high';
}

export interface ConceptData {
  id: string;
  title: string;
  subtitle: string;
  focusType: string;
  keyPoints: string[];
  colorPalette: Record<string, string>;
  layoutSpecs: Record<string, any>;
  recommended: boolean;
}

export interface GenerationRequest {
  conceptId: string;
  productImageFile: Express.Multer.File;
  userId: string;
}

// Prompt detalhado para a etapa 1 - Análise do produto
const PROMPT_ETAPA_1_DETALHADO = `
VOCÊ É UM ESPECIALISTA EM INFOGRÁFICOS PARA AMAZON COM 10 ANOS DE EXPERIÊNCIA.

Sua tarefa é analisar um produto e gerar 3 conceitos profissionais de infográficos que convertem vendas.

REGRAS DE ANÁLISE:
1. Foque no diferencial único do produto
2. Identifique os principais benefícios emocionais
3. Considere o público-alvo específico
4. Priorize elementos que geram confiança
5. Crie conceitos únicos e diversos entre si

FORMATO DE RESPOSTA OBRIGATÓRIO:
---
ANÁLISE ESTRATÉGICA:
[Análise detalhada do produto, público-alvo e posicionamento]

CONCEITO 1: [NOME DO CONCEITO]
- Título: [Título principal do infográfico]
- Subtítulo: [Subtítulo complementar]
- Foco: [Tipo de foco: benefícios, características, comparação, problema-solução]
- Pontos-chave: [Lista de 3-5 pontos principais]
- Paleta de cores: {"primaria": "#cor", "secundaria": "#cor", "destaque": "#cor"}
- Layout: {"estilo": "moderno/clássico/minimalista", "disposição": "vertical/horizontal", "elementos": ["ícones", "gráficos", "texto"]}
- Recomendado: true/false

CONCEITO 2: [NOME DO CONCEITO]
[Mesma estrutura do Conceito 1]

CONCEITO 3: [NOME DO CONCEITO]
[Mesma estrutura do Conceito 1]
---

IMPORTANTE: Sempre marque apenas 1 conceito como "Recomendado: true" baseado no maior potencial de conversão.
`;

// Prompt detalhado para a etapa 2 - Geração do prompt otimizado
const PROMPT_ETAPA_2_DETALHADO = `
VOCÊ É UM ESPECIALISTA EM PROMPTS PARA DALL-E 3 E INFOGRÁFICOS AMAZON.

Sua tarefa é analisar a imagem do produto fornecida e o conceito selecionado para gerar um prompt otimizado que criará um infográfico profissional de vendas.

ANÁLISE OBRIGATÓRIA DA IMAGEM:
1. Descreva o produto visualmente
2. Identifique cores dominantes
3. Analise o estilo/forma do produto
4. Avalie a qualidade da imagem
5. Sugira melhorias visuais

PROMPT DALL-E 3 OBRIGATÓRIO:
- Específico e detalhado (200-300 palavras)
- Mencione dimensões (1024x1024)
- Inclua estilo visual específico
- Defina paleta de cores exata
- Especifique layout e composição
- Inclua elementos de credibilidade
- Mencione tipografia adequada
- Defina qualidade profissional

FORMATO DE RESPOSTA:
---
ANÁLISE DA IMAGEM:
[Análise detalhada da imagem fornecida]

PROMPT OTIMIZADO DALL-E 3:
[Prompt específico de 200-300 palavras para gerar o infográfico]

ELEMENTOS VISUAIS INCLUÍDOS:
- Layout: [estrutura visual]
- Cores: [paleta específica]
- Tipografia: [estilo de texto]
- Ícones: [tipos de ícones]
- Credibilidade: [elementos de confiança]
---
`;

class InfographicService {
  // ETAPA 1: Análise e geração de conceitos
  async analyzeProduct(productData: ProductData, userId: number): Promise<{
    analysisId: string;
    concepts: ConceptData[];
    recommendedConcept: string;
  }> {
    try {
      // Determinar modelo baseado no esforço
      const model = productData.effortLevel === 'high' 
        ? 'claude-3-opus-20240229' 
        : 'claude-3-5-sonnet-20241022';

      // Construir prompt da Etapa 1
      const analysisPrompt = this.buildAnalysisPrompt(productData);

      // Simular resposta da IA (substituir pela integração real posteriormente)
      const mockResponse = this.generateMockConcepts(productData);

      // Salvar no banco usando Drizzle
      const insertData: InsertInfographic = {
        userId,
        productName: productData.name,
        productDescription: productData.description,
        category: productData.category,
        targetAudience: productData.targetAudience,
        effortLevel: productData.effortLevel,
        status: 'concepts_generated',
      };

      const [analysis] = await db.insert(infographics).values(insertData).returning();

      // Salvar conceitos
      const conceptsToInsert: InsertInfographicConcept[] = mockResponse.concepts.map(concept => ({
        infographicId: analysis.id,
        conceptData: concept,
        recommended: concept.recommended
      }));

      await db.insert(infographicConcepts).values(conceptsToInsert);

      return {
        analysisId: analysis.id,
        concepts: mockResponse.concepts,
        recommendedConcept: mockResponse.concepts.find(c => c.recommended)?.id || mockResponse.concepts[0].id
      };

    } catch (error) {
      console.error('Erro na análise do produto:', error);
      throw new Error('Falha na análise do produto');
    }
  }

  // ETAPA 2: Geração do prompt otimizado
  async generatePrompt(
    analysisId: string, 
    conceptId: string, 
    imageFile: Express.Multer.File,
    userId: number
  ): Promise<{
    generationId: string;
    optimizedPrompt: string;
    imageAnalysis: string;
  }> {
    try {
      // Buscar análise e conceito
      const analysis = await db.query.infographics.findFirst({
        where: eq(infographics.id, analysisId),
        with: { concepts: true }
      });

      if (!analysis || analysis.userId !== userId) {
        throw new Error('Análise não encontrada ou sem permissão');
      }

      const concept = analysis.concepts.find((c: any) => 
        (JSON.parse(JSON.stringify(c.conceptData)) as ConceptData).id === conceptId
      );

      if (!concept) {
        throw new Error('Conceito não encontrado');
      }

      // Simular upload da imagem (substituir pela integração real)
      const imageUrl = `https://temp-storage.com/uploads/${Date.now()}_${imageFile.originalname}`;

      // Gerar prompt usando mock (substituir pela integração real com ChatGPT 4o)
      const mockPromptResponse = this.generateMockPrompt(concept.conceptData, imageUrl);

      // Atualizar análise com dados da geração
      await db.update(infographics)
        .set({
          selectedConceptId: conceptId,
          productImageUrl: imageUrl,
          optimizedPrompt: mockPromptResponse.optimizedPrompt,
          status: 'prompt_generated',
          updatedAt: new Date()
        })
        .where(eq(infographics.id, analysisId));

      return {
        generationId: analysisId,
        optimizedPrompt: mockPromptResponse.optimizedPrompt,
        imageAnalysis: mockPromptResponse.imageAnalysis
      };

    } catch (error) {
      console.error('Erro na geração do prompt:', error);
      throw new Error('Falha na geração do prompt');
    }
  }

  // ETAPA 3: Geração da imagem final
  async generateInfographic(generationId: string, userId: number): Promise<{
    finalImageUrl: string;
    downloadLinks: {
      png: string;
      jpg: string;
    };
  }> {
    try {
      // Buscar dados da geração
      const analysis = await db.query.infographics.findFirst({
        where: eq(infographics.id, generationId)
      });

      if (!analysis || analysis.userId !== userId) {
        throw new Error('Geração não encontrada ou sem permissão');
      }

      if (!analysis.optimizedPrompt) {
        throw new Error('Prompt não foi gerado ainda');
      }

      // Atualizar status para processando
      await db.update(infographics)
        .set({ status: 'generating', updatedAt: new Date() })
        .where(eq(infographics.id, generationId));

      // Simular geração da imagem (substituir pela integração real com DALL-E 3)
      const mockImageUrl = `https://generated-images.com/infographics/${generationId}_final.png`;

      // Simular upscale da imagem
      const finalImageUrl = await this.mockUpscaleImage(mockImageUrl, generationId);

      // Atualizar com resultado final
      await db.update(infographics)
        .set({
          finalImageUrl,
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(infographics.id, generationId));

      return {
        finalImageUrl,
        downloadLinks: {
          png: `${finalImageUrl}?format=png`,
          jpg: `${finalImageUrl}?format=jpg`
        }
      };

    } catch (error) {
      // Atualizar status para erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await db.update(infographics)
        .set({ 
          status: 'failed', 
          errorMessage,
          updatedAt: new Date()
        })
        .where(eq(infographics.id, generationId));

      console.error('Erro na geração do infográfico:', error);
      throw new Error('Falha na geração do infográfico');
    }
  }

  // Buscar status da geração
  async getGenerationStatus(generationId: string, userId: number) {
    const analysis = await db.query.infographics.findFirst({
      where: eq(infographics.id, generationId)
    });

    if (!analysis || analysis.userId !== userId) {
      throw new Error('Geração não encontrada ou sem permissão');
    }

    return {
      status: analysis.status,
      finalImageUrl: analysis.finalImageUrl,
      errorMessage: analysis.errorMessage,
      progress: this.getProgressFromStatus(analysis.status)
    };
  }

  // Buscar histórico de infográficos do usuário
  async getUserInfographics(userId: number) {
    const userInfographics = await db.query.infographics.findMany({
      where: eq(infographics.userId, userId),
      orderBy: [desc(infographics.createdAt)],
      with: { concepts: true }
    });

    return userInfographics;
  }

  // Métodos auxiliares privados
  private buildAnalysisPrompt(productData: ProductData): string {
    return `
    ${PROMPT_ETAPA_1_DETALHADO}
    
    DADOS DO PRODUTO:
    - NOME: ${productData.name}
    - DESCRIÇÃO: ${productData.description}
    - CATEGORIA: ${productData.category}
    - PÚBLICO-ALVO: ${productData.targetAudience}
    
    Forneça a análise completa seguindo exatamente o formato especificado.
    `;
  }

  private generateMockConcepts(productData: ProductData): { concepts: ConceptData[] } {
    // Mock conceitos baseados no produto
    const concepts: ConceptData[] = [
      {
        id: crypto.randomUUID(),
        title: `${productData.name} - Solução Completa`,
        subtitle: 'Transforme sua experiência',
        focusType: 'benefícios',
        keyPoints: ['Alta qualidade', 'Durabilidade garantida', 'Fácil de usar', 'Melhor custo-benefício'],
        colorPalette: { primaria: '#2563eb', secundaria: '#60a5fa', destaque: '#f59e0b' },
        layoutSpecs: { estilo: 'moderno', disposição: 'vertical', elementos: ['ícones', 'gráficos'] },
        recommended: true
      },
      {
        id: crypto.randomUUID(),
        title: `Por que escolher ${productData.name}?`,
        subtitle: 'Comparação com concorrentes',
        focusType: 'comparação',
        keyPoints: ['Melhor preço', 'Qualidade superior', 'Garantia estendida', 'Atendimento 24h'],
        colorPalette: { primaria: '#059669', secundaria: '#34d399', destaque: '#dc2626' },
        layoutSpecs: { estilo: 'clássico', disposição: 'horizontal', elementos: ['tabelas', 'gráficos'] },
        recommended: false
      },
      {
        id: crypto.randomUUID(),
        title: `${productData.name} - Especificações Técnicas`,
        subtitle: 'Todos os detalhes que você precisa',
        focusType: 'características',
        keyPoints: ['Dimensões exatas', 'Materiais premium', 'Certificações', 'Compatibilidade'],
        colorPalette: { primaria: '#7c3aed', secundaria: '#a78bfa', destaque: '#f97316' },
        layoutSpecs: { estilo: 'minimalista', disposição: 'vertical', elementos: ['ícones', 'texto'] },
        recommended: false
      }
    ];

    return { concepts };
  }

  private generateMockPrompt(conceptData: any, imageUrl: string): { optimizedPrompt: string; imageAnalysis: string } {
    const concept = JSON.parse(JSON.stringify(conceptData));
    
    return {
      optimizedPrompt: `Create a professional Amazon product infographic in 1024x1024 format featuring "${concept.title}". 
      Design style: ${concept.layoutSpecs.estilo} with ${concept.layoutSpecs.disposição} layout. 
      Color palette: primary ${concept.colorPalette.primaria}, secondary ${concept.colorPalette.secundaria}, accent ${concept.colorPalette.destaque}. 
      Include key points: ${concept.keyPoints.join(', ')}. 
      Layout elements: ${concept.layoutSpecs.elementos.join(', ')}. 
      Focus on ${concept.focusType} with high-quality typography, clean design, and professional Amazon marketplace aesthetics. 
      Include trust elements like badges, certifications, and clear hierarchy. High resolution, commercial photography style.`,
      imageAnalysis: `Produto analisado com sucesso. Imagem de alta qualidade identificada com cores dominantes que combinam com a paleta selecionada. Produto adequado para infográfico profissional.`
    };
  }

  private async mockUpscaleImage(imageUrl: string, generationId: string): Promise<string> {
    // Simular processo de upscale
    return `https://upscaled-images.com/infographics/${generationId}_2048x2048.png`;
  }

  private getProgressFromStatus(status: string): number {
    const progressMap: Record<string, number> = {
      'created': 0,
      'concepts_generated': 25,
      'prompt_generated': 50,
      'generating': 75,
      'completed': 100,
      'failed': 0
    };
    return progressMap[status] || 0;
  }
}

export const infographicService = new InfographicService();
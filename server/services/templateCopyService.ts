import { db } from "../db";
import { templateAnalyses, productCopies, type InsertTemplateAnalysis, type InsertProductCopy } from "@shared/schema";
import { eq } from "drizzle-orm";
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import fetch from 'node-fetch';

export interface TemplateAnalysisResult {
  layout: {
    structure: 'grid' | 'freeform' | 'sidebar' | 'centered';
    productPosition: { x: number; y: number; width: number; height: number };
    textAreas: Array<{ x: number; y: number; width: number; height: number; type: string }>;
    iconPositions: Array<{ x: number; y: number; size: number; type: string }>;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    titleFont: string;
    titleSize: string;
    titleWeight: string;
    bodyFont: string;
    bodySize: string;
    hierarchy: string[];
  };
  visualElements: {
    hasIcons: boolean;
    iconStyle: 'minimalist' | 'detailed' | 'outlined' | 'filled';
    hasBadges: boolean;
    badgeStyle: string;
    hasArrows: boolean;
    arrowStyle: string;
    backgroundStyle: 'solid' | 'gradient' | 'pattern';
  };
  contentStructure: {
    titlePattern: string;
    benefitCount: number;
    benefitLayout: 'list' | 'grid' | 'circular';
    hasSpecs: boolean;
    specsLayout: string;
    hasCallToAction: boolean;
  };
}

export interface ProductData {
  name: string;
  category: string;
  benefits: string[];
  specs: string[];
}

class TemplateCopyService {
  
  // ETAPA 1: Análise completa do template
  async analyzeTemplate(
    templateImageUrl: string,
    templateName: string,
    userId: number
  ): Promise<{
    analysisId: string;
    templateAnalysis: TemplateAnalysisResult;
    previewData: any;
  }> {
    try {
      console.log('🎨 [TEMPLATE_COPY] Starting template analysis...');
      
      // Por enquanto, retornar dados mock até implementar a análise real
      const mockAnalysis: TemplateAnalysisResult = {
        layout: {
          structure: 'grid',
          productPosition: { x: 20, y: 20, width: 40, height: 60 },
          textAreas: [
            { x: 65, y: 10, width: 30, height: 20, type: 'title' },
            { x: 65, y: 35, width: 30, height: 50, type: 'benefit' }
          ],
          iconPositions: [
            { x: 70, y: 90, size: 5, type: 'benefit' }
          ]
        },
        colorPalette: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B',
          background: '#FFFFFF',
          text: '#1F2937'
        },
        typography: {
          titleFont: 'sans-serif',
          titleSize: 'large',
          titleWeight: 'bold',
          bodyFont: 'sans-serif',
          bodySize: 'medium',
          hierarchy: ['título', 'benefícios', 'especificações']
        },
        visualElements: {
          hasIcons: true,
          iconStyle: 'minimalist',
          hasBadges: true,
          badgeStyle: 'rounded',
          hasArrows: false,
          arrowStyle: 'thin',
          backgroundStyle: 'solid'
        },
        contentStructure: {
          titlePattern: 'Produto + Benefício Principal',
          benefitCount: 4,
          benefitLayout: 'list',
          hasSpecs: true,
          specsLayout: 'list',
          hasCallToAction: true
        }
      };
      
      const templateDNA = `Layout grid com produto à esquerda (20%, 20%, 40x60%), texto à direita. 
        Cores: azul primário (#3B82F6), fundo branco, texto escuro. 
        Tipografia sans-serif, títulos grandes e bold. 
        Ícones minimalistas, badges arredondados. 
        Estrutura: título + 4 benefícios em lista + especificações + CTA.`;
      
      // Salvar análise no banco
      const analysisData: InsertTemplateAnalysis = {
        userId,
        templateImageUrl: templateImageUrl,
        templateName,
        layoutAnalysis: mockAnalysis.layout,
        colorPalette: mockAnalysis.colorPalette,
        typographyAnalysis: mockAnalysis.typography,
        visualElements: mockAnalysis.visualElements,
        contentStructure: mockAnalysis.contentStructure,
        styleDna: templateDNA,
        status: 'completed'
      };

      const [analysis] = await db.insert(templateAnalyses).values([analysisData]).returning();
      
      console.log('✅ [TEMPLATE_COPY] Template analysis completed successfully');
      
      return {
        analysisId: analysis.id,
        templateAnalysis: mockAnalysis,
        previewData: {
          colorPalette: mockAnalysis.colorPalette,
          layout: mockAnalysis.layout,
          elements: mockAnalysis.visualElements
        }
      };
      
    } catch (error) {
      console.error('❌ [TEMPLATE_COPY] Error in template analysis:', error);
      throw new Error('Falha na análise do template');
    }
  }
  
  // ETAPA 2: Aplicar template ao produto
  async copyTemplateToProduct(
    templateId: string,
    productImageUrl: string,
    productData: ProductData,
    userId: number
  ): Promise<{
    copyId: string;
    status: string;
  }> {
    try {
      console.log('🎨 [TEMPLATE_COPY] Starting template copy to product...');
      
      // Buscar template
      const template = await db.query.templateAnalyses.findFirst({
        where: eq(templateAnalyses.id, templateId)
      });
      
      if (!template || template.userId !== userId) {
        throw new Error('Template não encontrado');
      }
      
      // Criar registro de cópia
      const copyData: InsertProductCopy = {
        userId,
        templateId,
        productImageUrl,
        productName: productData.name,
        productCategory: productData.category,
        productBenefits: productData.benefits,
        productSpecs: productData.specs,
        status: 'analyzing'
      };

      const [copy] = await db.insert(productCopies).values(copyData).returning();
      
      // Processar com IA em background
      this.processTemplateWithAI(copy.id, template, productImageUrl, productData).catch(error => {
        console.error('❌ [TEMPLATE_COPY] Error in AI processing:', error);
      });
      
      console.log('✅ [TEMPLATE_COPY] Template copy started successfully');
      
      return {
        copyId: copy.id,
        status: 'processing'
      };
      
    } catch (error) {
      console.error('❌ [TEMPLATE_COPY] Error in template copy:', error);
      throw new Error('Falha na cópia do template');
    }
  }
  
  // Buscar templates do usuário
  async getUserTemplates(userId: number) {
    try {
      const templates = await db.query.templateAnalyses.findMany({
        where: eq(templateAnalyses.userId, userId),
        orderBy: (table, { desc }) => [desc(table.createdAt)]
      });
      
      return templates;
    } catch (error) {
      console.error('❌ [TEMPLATE_COPY] Error fetching user templates:', error);
      throw new Error('Falha ao buscar templates');
    }
  }
  
  // Buscar histórico de cópias
  async getUserCopies(userId: number) {
    try {
      const copies = await db.query.productCopies.findMany({
        where: eq(productCopies.userId, userId),
        with: { template: true },
        orderBy: (table, { desc }) => [desc(table.createdAt)]
      });
      
      return copies;
    } catch (error) {
      console.error('❌ [TEMPLATE_COPY] Error fetching user copies:', error);
      throw new Error('Falha ao buscar histórico de cópias');
    }
  }
  
  // Buscar status de uma cópia
  async getCopyStatus(copyId: string, userId: number) {
    try {
      const copy = await db.query.productCopies.findFirst({
        where: eq(productCopies.id, copyId),
        with: { template: true }
      });
      
      if (!copy || copy.userId !== userId) {
        throw new Error('Cópia não encontrada');
      }
      
      return {
        status: copy.status,
        generatedImageUrl: copy.generatedImageUrl,
        errorMessage: copy.errorMessage,
        progress: this.calculateProgress(copy.status),
        template: copy.template
      };
    } catch (error) {
      console.error('❌ [TEMPLATE_COPY] Error fetching copy status:', error);
      throw new Error('Falha ao buscar status da cópia');
    }
  }
  
  // Calcular progresso baseado no status
  private calculateProgress(status: string): number {
    switch (status) {
      case 'created': return 10;
      case 'analyzing': return 30;
      case 'generating': return 70;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  }

  // PROCESSO REAL COM IA: Claude + GPT-Image-1
  private async processTemplateWithAI(
    copyId: string, 
    template: any, 
    productImageUrl: string, 
    productData: ProductData
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 [TEMPLATE_COPY_AI] Starting AI processing for copy:', copyId);
      
      // ETAPA 1: Análise do produto com Claude Sonnet
      await this.updateCopyStatus(copyId, 'analyzing');
      
      const analysisPrompt = `
Você é um especialista em infográficos de produtos Amazon. Analise os dados fornecidos:

TEMPLATE ANALISADO:
- Nome: ${template.templateName}
- DNA do estilo: ${template.styleDna}
- Layout: ${JSON.stringify(template.layoutAnalysis)}
- Paleta de cores: ${JSON.stringify(template.colorPalette)}
- Tipografia: ${JSON.stringify(template.typographyAnalysis)}

PRODUTO DO USUÁRIO:
- Nome: ${productData.name}
- Categoria: ${productData.category}
- Benefícios: ${productData.benefits.join(', ')}
- Especificações: ${productData.specs.join(', ')}

Crie uma análise otimizada do produto seguindo o estilo do template.

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional, sem formatação markdown:

{
  "optimizedTitle": "Título otimizado (max 60 chars)",
  "keyBenefits": ["benefício 1", "benefício 2", "benefício 3"],
  "mainSpecs": ["spec técnica 1", "spec técnica 2"],
  "visualCues": ["ícone sugerido 1", "ícone sugerido 2"],
  "callToAction": "CTA otimizado"
}`;

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const analysisResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{ role: 'user', content: analysisPrompt }],
      });

      let analysisText = (analysisResponse.content[0] as any).text;
      // Extrair JSON do markdown se necessário
      if (analysisText.includes('```json')) {
        const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          analysisText = jsonMatch[1];
        }
      }
      const productAnalysis = JSON.parse(analysisText);
      console.log('✅ [TEMPLATE_COPY_AI] Product analysis completed');

      // ETAPA 2: Otimização do prompt para GPT-Image-1
      await this.updateCopyStatus(copyId, 'generating');
      
      const promptOptimizationPrompt = `
Baseado na análise do produto, crie um prompt detalhado para gerar um infográfico profissional:

ANÁLISE DO PRODUTO:
${JSON.stringify(productAnalysis)}

ESTILO DO TEMPLATE:
- Paleta: ${JSON.stringify(template.colorPalette)}
- Layout: ${JSON.stringify(template.layoutAnalysis)}
- Tipografia: ${JSON.stringify(template.typographyAnalysis)}

Crie um prompt técnico e específico para GPT-Image-1 que replique o estilo visual do template original aplicado ao novo produto. 

Seja muito específico sobre:
- Posições exatas dos elementos
- Cores hexadecimais
- Tipografia e tamanhos
- Layout e composição
- Ícones e elementos visuais

Retorne apenas o prompt otimizado, sem explicações.`;

      const promptResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        temperature: 0.1,
        messages: [{ role: 'user', content: promptOptimizationPrompt }],
      });

      const optimizedPrompt = (promptResponse.content[0] as any).text.trim();
      console.log('✅ [TEMPLATE_COPY_AI] Prompt optimization completed');

      // ETAPA 3: Geração da imagem com GPT-Image-1
      console.log('🎨 [TEMPLATE_COPY_AI] Starting image generation with GPT-Image-1...');
      
      // Processar imagem do produto
      let imageBuffer: Buffer;
      
      if (productImageUrl.startsWith('data:')) {
        // Se for data URL, extrair o base64
        const base64Data = productImageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (productImageUrl.startsWith('http')) {
        // Se for URL HTTP, fazer fetch
        const imageResponse = await fetch(productImageUrl);
        if (!imageResponse.ok) {
          throw new Error('Falha ao baixar imagem do produto');
        }
        imageBuffer = await imageResponse.buffer();
      } else {
        // Se for caminho local, ler do sistema de arquivos
        const fs = await import('fs');
        const path = await import('path');
        const fullPath = path.join(process.cwd(), productImageUrl);
        imageBuffer = fs.readFileSync(fullPath);
      }

      // Gerar com GPT-Image-1
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Criar arquivo para GPT-Image-1 usando FormData approach
      const { Blob } = await import('buffer');
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
      const imageFile = Object.assign(imageBlob, { 
        name: 'product.png',
        lastModified: Date.now(),
        webkitRelativePath: ''
      });

      const gptImageResponse = await openai.images.edit({
        model: 'gpt-image-1',
        image: imageFile as any,
        prompt: optimizedPrompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      });

      const imageBase64 = gptImageResponse.data?.[0]?.b64_json;
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      const estimatedCost = 0.167; // Custo estimado do GPT-Image-1

      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // Atualizar com resultado final
      await db.update(productCopies)
        .set({
          status: 'completed',
          generatedImageUrl: imageUrl,
          finalPrompt: optimizedPrompt,
          totalCost: estimatedCost.toString(),
          processingTime: processingTime,
          completedAt: new Date()
        })
        .where(eq(productCopies.id, copyId));

      console.log('✅ [TEMPLATE_COPY_AI] AI processing completed successfully');
      
    } catch (error: any) {
      console.error('❌ [TEMPLATE_COPY_AI] Error in AI processing:', error);
      
      await db.update(productCopies)
        .set({
          status: 'failed',
          errorMessage: error.message || 'Erro no processamento com IA'
        })
        .where(eq(productCopies.id, copyId));
    }
  }

  private async updateCopyStatus(copyId: string, status: string): Promise<void> {
    await db.update(productCopies)
      .set({ status })
      .where(eq(productCopies.id, copyId));
  }
}

export const templateCopyService = new TemplateCopyService();
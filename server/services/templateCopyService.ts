import { db } from "../db";
import { templateAnalyses, productCopies, type InsertTemplateAnalysis, type InsertProductCopy } from "@shared/schema";
import { eq } from "drizzle-orm";

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
        originalImageUrl: templateImageUrl,
        templateName,
        layout: mockAnalysis.layout,
        colorPalette: mockAnalysis.colorPalette,
        typography: mockAnalysis.typography,
        visualElements: mockAnalysis.visualElements,
        contentStructure: mockAnalysis.contentStructure,
        templateDNA,
        status: 'completed'
      };

      const [analysis] = await db.insert(templateAnalyses).values(analysisData).returning();
      
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
      
      // Simular processamento assíncrono
      setTimeout(async () => {
        try {
          await db.update(productCopies)
            .set({
              status: 'completed',
              generatedImageUrl: 'https://example.com/generated-image.jpg',
              finalPrompt: `Infográfico estilo ${template.templateName} para produto ${productData.name}`,
              completedAt: new Date()
            })
            .where(eq(productCopies.id, copy.id));
        } catch (error) {
          console.error('❌ [TEMPLATE_COPY] Error updating copy status:', error);
        }
      }, 5000);
      
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
}

export const templateCopyService = new TemplateCopyService();
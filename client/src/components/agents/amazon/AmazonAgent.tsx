import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  CSVUploadResult, 
  ProductConfig, 
  GeneratedContent, 
  AmazonAgentStep,
  AmazonCategory,
  AmazonMarketplace,
  AIModel,
  InsightType 
} from '@/types/amazon';
import { AmazonCSVUpload } from './AmazonCSVUpload';
import { AmazonProductForm } from './AmazonProductForm';
import { AmazonSteps } from './AmazonSteps';
import { AmazonResults } from './AmazonResults';

type AgentStep = 'upload' | 'config' | 'generate' | 'results';

interface AmazonAgentProps {
  onBack?: () => void;
}

export const AmazonAgent = ({ onBack }: AmazonAgentProps) => {
  const [currentStep, setCurrentStep] = useState<AgentStep>('upload');
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const steps: AmazonAgentStep[] = useMemo(() => [
    {
      id: 'upload',
      title: 'Upload de Dados',
      description: 'Carregue um arquivo CSV com avaliações da Amazon',
      status: uploadResult ? 'completed' : currentStep === 'upload' ? 'active' : 'pending',
      component: () => (
        <AmazonCSVUpload
          onUploadComplete={handleUploadComplete}
          onClear={handleClearUpload}
          uploadResult={uploadResult}
        />
      )
    },
    {
      id: 'config',
      title: 'Configuração do Produto',
      description: 'Configure as informações do seu produto',
      status: productConfig ? 'completed' : currentStep === 'config' ? 'active' : 'pending',
      component: () => (
        <AmazonProductForm
          onConfigSubmit={handleConfigSubmit}
          initialConfig={productConfig || undefined}
          isLoading={isGenerating}
        />
      )
    },
    {
      id: 'generate',
      title: 'Geração de Conteúdo',
      description: 'IA analisa os dados e gera conteúdo otimizado',
      status: isGenerating ? 'active' : generatedContent ? 'completed' : 'pending',
      component: () => (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg font-medium">Gerando conteúdo...</p>
              <p className="text-sm text-muted-foreground">
                Analisando {uploadResult?.validRows} avaliações e configurações do produto
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-medium">Pronto para gerar conteúdo!</p>
              <p className="text-sm text-muted-foreground">
                Dados carregados e produto configurado
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'results',
      title: 'Resultados',
      description: 'Visualize e baixe o conteúdo gerado',
      status: generatedContent ? 'completed' : 'pending',
      component: () => generatedContent && (
        <AmazonResults
          content={generatedContent}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )
    }
  ], [currentStep, uploadResult, productConfig, generatedContent, isGenerating, isExporting]);

  const handleUploadComplete = (result: CSVUploadResult) => {
    setUploadResult(result);
    setCurrentStep('config');
    toast({
      title: "Upload concluído!",
      description: `${result.validRows} avaliações processadas com sucesso.`,
    });
  };

  const handleClearUpload = () => {
    setUploadResult(null);
    setProductConfig(null);
    setGeneratedContent(null);
    setCurrentStep('upload');
  };

  const handleConfigSubmit = async (config: ProductConfig) => {
    setProductConfig(config);
    setCurrentStep('generate');
    setIsGenerating(true);

    try {
      // Simular geração de conteúdo com dados mais realistas
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockContent: GeneratedContent = {
        titles: [
          {
            id: '1',
            title: `${config.productName} Premium | ${config.keyFeatures.slice(0, 2).join(' + ')} | Garantia 2 Anos`,
            score: 9.2,
            reasoning: 'Inclui palavras-chave principais no início, menciona garantia e benefícios específicos',
            length: 98
          },
          {
            id: '2',
            title: `${config.productName} Profissional - ${config.mainBenefits[0]} - Ideal para ${config.targetAudience.split(',')[0]}`,
            score: 8.7,
            reasoning: 'Foca no benefício principal e público-alvo específico',
            length: 76
          },
          {
            id: '3',
            title: `${config.productName} | ${config.keyFeatures.slice(0, 3).join(' | ')} | Avaliação 4.8⭐`,
            score: 8.3,
            reasoning: 'Lista características técnicas e inclui prova social',
            length: 84
          }
        ],
        bulletPoints: [
          `✅ ${config.mainBenefits[0]} - Ideal para ${config.targetAudience.split(',')[0]?.trim()}`,
          `🔧 ${config.keyFeatures[0]} - Tecnologia avançada para melhor performance`,
          `📦 ${config.keyFeatures[1]} - Inclui tudo que você precisa para começar`,
          `⚡ Instalação rápida em 5 minutos - Manual ilustrado em português`,
          `🛡️ Garantia de 2 anos + Suporte técnico gratuito via WhatsApp`
        ],
        description: `Descubra o ${config.productName}, a solução definitiva para ${config.targetAudience.toLowerCase()}. 

Com ${config.keyFeatures.join(', ')}, este produto oferece ${config.mainBenefits.join(' e ')}.

CARACTERÍSTICAS PRINCIPAIS:
${config.keyFeatures.map(feature => `• ${feature}`).join('\n')}

BENEFÍCIOS EXCLUSIVOS:
${config.mainBenefits.map(benefit => `• ${benefit}`).join('\n')}

ESPECIFICAÇÕES TÉCNICAS:
• Material: Premium quality
• Dimensões: Compacto e portátil
• Compatibilidade: Universal
• Garantia: 2 anos

INCLUÍDO NA EMBALAGEM:
• 1x ${config.productName}
• Manual de instruções em português
• Certificado de garantia
• Suporte técnico gratuito

Ideal para quem busca qualidade, durabilidade e excelente custo-benefício. Mais de 10.000 clientes satisfeitos!`,
        keywords: [
          config.productName.toLowerCase(),
          ...config.keyFeatures.map(f => f.toLowerCase()),
          ...config.mainBenefits.map(b => b.toLowerCase()),
          'premium', 'qualidade', 'garantia', 'durável'
        ],
        searchTerms: [
          config.productName,
          `${config.productName} premium`,
          `${config.productName} profissional`,
          ...config.keyFeatures,
          config.targetAudience.split(',')[0]?.trim()
        ].filter(Boolean),
        insights: [
          {
            type: InsightType.KEYWORD_OPPORTUNITY,
            title: 'Oportunidade de Palavra-chave',
            description: `A palavra-chave "${config.keyFeatures[0]}" tem baixa concorrência mas alto volume de busca`,
            impact: 'high',
            category: 'keywords'
          },
          {
            type: InsightType.CONTENT_OPTIMIZATION,
            title: 'Otimização de Conteúdo',
            description: 'Inclua mais especificações técnicas nos bullet points para melhor conversão',
            impact: 'medium',
            category: 'optimization'
          },
          {
            type: InsightType.AUDIENCE_BEHAVIOR,
            title: 'Comportamento da Audiência',
            description: `${config.targetAudience} valoriza garantia e suporte técnico - destaque esses pontos`,
            impact: 'high',
            category: 'audience'
          }
        ]
      };

      setGeneratedContent(mockContent);
      setCurrentStep('results');
      
      toast({
        title: "Conteúdo gerado!",
        description: `${mockContent.titles.length} títulos, ${mockContent.bulletPoints.length} bullet points e descrição prontos.`,
      });

    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'txt') => {
    if (!generatedContent) return;
    
    setIsExporting(true);
    
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'csv':
          content = `Tipo,Conteúdo,Score,Caracteres\n${generatedContent.titles.map(t => 
            `Título,"${t.title}",${t.score},${t.length}`
          ).join('\n')}\n${generatedContent.bulletPoints.map(b => 
            `Bullet Point,"${b}",,${b.length}`
          ).join('\n')}\nDescrição,"${generatedContent.description}",,${generatedContent.description.length}`;
          filename = 'amazon-content.csv';
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(generatedContent, null, 2);
          filename = 'amazon-content.json';
          mimeType = 'application/json';
          break;
        case 'txt':
          content = `TÍTULOS:\n${generatedContent.titles.map(t => t.title).join('\n\n')}\n\nBULLET POINTS:\n${generatedContent.bulletPoints.join('\n')}\n\nDESCRIÇÃO:\n${generatedContent.description}`;
          filename = 'amazon-content.txt';
          mimeType = 'text/plain';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Arquivo exportado!",
        description: `Conteúdo exportado como ${filename}`,
      });

    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId as AgentStep);
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadResult(null);
    setProductConfig(null);
    setGeneratedContent(null);
    setIsGenerating(false);
  };

  const progressValue = useMemo(() => {
    const stepOrder = ['upload', 'config', 'generate', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return ((currentIndex + 1) / stepOrder.length) * 100;
  }, [currentStep]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">🛒 Gerador de Listings Amazon</h1>
            <p className="text-muted-foreground mt-1">
              Crie conteúdo otimizado para Amazon usando análise de avaliações e IA
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reiniciar
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <AmazonSteps 
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {steps.find(step => step.id === currentStep)?.component()}
      </div>
    </div>
  );
};
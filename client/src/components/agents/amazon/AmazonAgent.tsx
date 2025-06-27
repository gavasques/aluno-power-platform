import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Settings, Zap, Download } from 'lucide-react';
import { ProductConfig, GeneratedContent, CSVUploadResult, InsightType } from '@/types/amazon';
import { AmazonResults } from './AmazonResults';

type AgentStep = 'upload' | 'config' | 'generate' | 'results';

interface AmazonAgentProps {
  onBack?: () => void;
}

// Configuração dos passos - DRY principle
const STEP_CONFIG = {
  upload: { label: 'Upload CSV', icon: Upload, progress: 25 },
  config: { label: 'Configuração', icon: Settings, progress: 50 },
  generate: { label: 'Geração', icon: Zap, progress: 75 },
  results: { label: 'Resultados', icon: Download, progress: 100 }
} as const;

// Componente modular para navegação de passos
const StepIndicator = ({ 
  currentStep, 
  onStepClick 
}: { 
  currentStep: AgentStep; 
  onStepClick: (step: AgentStep) => void;
}) => (
  <div className="flex items-center justify-between mb-6">
    {Object.entries(STEP_CONFIG).map(([stepId, config], index) => {
      const isActive = currentStep === stepId;
      const isCompleted = STEP_CONFIG[currentStep as AgentStep].progress > config.progress;
      const Icon = config.icon;
      
      return (
        <React.Fragment key={stepId}>
          <div className="flex flex-col items-center">
            <Button
              variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
              size="sm"
              className="rounded-full w-10 h-10 p-0 mb-2"
              onClick={() => onStepClick(stepId as AgentStep)}
            >
              <Icon className="h-4 w-4" />
            </Button>
            <span className={`text-xs ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
              {config.label}
            </span>
          </div>
          {index < Object.keys(STEP_CONFIG).length - 1 && (
            <div className="flex-1 h-px bg-border mx-4 mt-5" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export const AmazonAgent = ({ onBack }: AmazonAgentProps) => {
  const [currentStep, setCurrentStep] = useState<AgentStep>('upload');
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers modulares
  const handleUploadComplete = (result: CSVUploadResult) => {
    setUploadResult(result);
    setCurrentStep('config');
  };

  const handleConfigSubmit = async (productConfig: ProductConfig) => {
    setConfig(productConfig);
    setCurrentStep('generate');
    setIsGenerating(true);

    // Simulação de geração de conteúdo
    setTimeout(() => {
      const mockContent: GeneratedContent = {
        titles: [
          { id: '1', title: `${productConfig.productName} - Premium Quality`, score: 9.2, length: 45 },
          { id: '2', title: `Best ${productConfig.productName} for ${productConfig.targetAudience}`, score: 8.8, length: 52 },
          { id: '3', title: `${productConfig.productName} - ${productConfig.keyFeatures[0]} Edition`, score: 8.5, length: 48 }
        ],
        bulletPoints: [
          `✅ ${productConfig.keyFeatures[0]} - Tecnologia avançada`,
          `🎯 Ideal para ${productConfig.targetAudience}`,
          `💡 ${productConfig.keyFeatures[1] || 'Fácil de usar'}`,
          `🚀 Resultados comprovados`,
          `⭐ Qualidade premium garantida`
        ],
        description: `Descubra o ${productConfig.productName}, a solução perfeita para ${productConfig.targetAudience}. 
        
Com ${productConfig.keyFeatures.join(', ')}, este produto oferece qualidade excepcional e resultados garantidos.

Características principais:
- Design inovador e funcional
- Materiais de alta qualidade
- Fácil instalação e uso
- Garantia de satisfação

Ideal para quem busca ${productConfig.keyFeatures[0]} com máxima eficiência. Transforme sua experiência com nossa tecnologia premium.`,
        keywords: [
          productConfig.productName.toLowerCase(),
          ...productConfig.keyFeatures.map(f => f.toLowerCase()),
          productConfig.targetAudience.toLowerCase(),
          'premium', 'qualidade', 'garantia', 'eficiente'
        ],
        searchTerms: [
          productConfig.productName,
          `${productConfig.productName} premium`,
          `melhor ${productConfig.productName}`,
          `${productConfig.productName} ${productConfig.targetAudience}`
        ],
        insights: [
          {
            type: 'opportunity',
            title: 'Alta Demanda de Mercado',
            description: 'Produto com potencial de crescimento de 25% no próximo trimestre.',
            impact: 'high'
          },
          {
            type: 'optimization',
            title: 'Otimização de Título',
            description: 'Considere incluir termos de busca de cauda longa.',
            impact: 'medium'
          }
        ]
      };
      
      setGeneratedContent(mockContent);
      setIsGenerating(false);
      setCurrentStep('results');
    }, 3000);
  };

  const handleStepClick = (step: AgentStep) => {
    const stepOrder: AgentStep[] = ['upload', 'config', 'generate', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'txt') => {
    if (!generatedContent) return;
    
    const content = format === 'json' 
      ? JSON.stringify(generatedContent, null, 2)
      : `Títulos:\n${generatedContent.titles.map(t => t.title).join('\n')}\n\nBullet Points:\n${generatedContent.bulletPoints.join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amazon-content.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Renderização condicional dos componentes de cada passo
  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <CSVUpload
            title="Upload da Planilha de Produtos"
            description="Faça upload da sua planilha CSV com os produtos para otimização"
            onUploadComplete={handleUploadComplete}
            acceptedColumns={['produto', 'categoria', 'preco', 'descricao']}
          />
        );
      
      case 'config':
        return uploadResult ? (
          <AmazonConfigForm 
            csvData={uploadResult}
            onSubmit={handleConfigSubmit}
          />
        ) : null;
      
      case 'generate':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Gerando Conteúdo Otimizado</h3>
            <p className="text-muted-foreground mb-4">
              Analisando seus produtos e criando títulos, descrições e bullet points otimizados...
            </p>
            <Progress value={75} className="w-64 mx-auto" />
          </div>
        );
      
      case 'results':
        return generatedContent ? (
          <AmazonResults 
            content={generatedContent}
            onExport={handleExport}
            isExporting={false}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-xl">Agente Amazon - Otimização de Produtos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gere títulos, descrições e bullet points otimizados para seus produtos
                </p>
              </div>
            </div>
            <Progress 
              value={STEP_CONFIG[currentStep].progress} 
              className="w-32" 
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <StepIndicator 
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
          
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
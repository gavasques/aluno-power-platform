import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, TrendingUp, CheckCircle2, Settings } from 'lucide-react';

import { FileUploader } from './FileUploader';
import { DataPreview } from './DataPreview';
import { AnalysisConfig } from './AnalysisConfig';
import { ResultsSummary } from './ResultsSummary';
import { RecommendationsTable } from './RecommendationsTable';
import { ChartsSection } from './ChartsSection';
import { DownloadButtons } from './DownloadButtons';
import { filterRecommendationsWithHistory } from './SmartFilter';

import { 
  AmazonKeyword, 
  SOPRecommendation, 
  AnalysisSummary, 
  AnalysisConfig as AnalysisConfigType,
  ProcessingStatus,
  ToleranceConfig
} from './types';

export const AmazonAdsSOPTool: React.FC = () => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'config' | 'results'>('upload');
  const [originalData, setOriginalData] = useState<AmazonKeyword[]>([]);
  const [recommendations, setRecommendations] = useState<SOPRecommendation[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [error, setError] = useState<string>('');

  // Configuração da análise
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfigType>({
    priceRange: 'auto',
    analysisMode: 'conservative',
    customTolerances: undefined
  });

  // Funções utilitárias
  const getTolerances = (priceRange: string, mode: string): ToleranceConfig => {
    const baseTolerances = {
      '50': { low: 10, medium: 15, high: 20 },
      '100': { low: 20, medium: 30, high: 40 },
      '200': { low: 30, medium: 45, high: 60 },
      '200+': { low: 40, medium: 60, high: 80 },
      'auto': { low: 20, medium: 30, high: 40 } // Default médio
    };

    const base = baseTolerances[priceRange as keyof typeof baseTolerances] || baseTolerances['100'];
    
    if (mode === 'aggressive') {
      return {
        low: Math.round(base.low * 0.7),
        medium: Math.round(base.medium * 0.7),
        high: Math.round(base.high * 0.7)
      };
    }
    
    return base;
  };

  const estimateProductPrice = (data: AmazonKeyword[]): number => {
    const keywordsWithSales = data.filter(item => {
      const sales = item.vendas || item.sales || 0;
      const orders = item.pedidos || item.orders || 0;
      return sales > 0 && orders > 0;
    });
    
    if (keywordsWithSales.length === 0) return 0;
    
    const avgPrice = keywordsWithSales.reduce((sum, item) => {
      const sales = item.vendas || item.sales || 0;
      const orders = item.pedidos || item.orders || 0;
      return sum + (orders > 0 ? sales / orders : 0);
    }, 0) / keywordsWithSales.length;
    
    return avgPrice;
  };

  // Aplicar regras SOP
  const applySOPRules = useCallback((
    data: AmazonKeyword[], 
    config: AnalysisConfigType
  ): { recommendations: SOPRecommendation[], summary: AnalysisSummary } => {
    
    const estimatedPrice = estimateProductPrice(data);
    const tolerances = config.customTolerances || getTolerances(config.priceRange, config.analysisMode);
    
    console.log('🎯 Tolerâncias aplicadas:', {
      low: tolerances.low,
      medium: tolerances.medium,
      high: tolerances.high,
      mode: config.analysisMode
    });
    
    // Filtrar keywords com performance
    const activeKeywords = data.filter(item => {
      const clicks = item.cliques || item.clicks || 0;
      const impressions = item.impressoes || item.impressions || 0;
      return clicks > 0 || impressions > 0;
    });

    const recommendations: SOPRecommendation[] = [];
    let totalEstimatedSavings = 0;

    activeKeywords.forEach((item, index) => {
      const keyword = item.textopalavraChave || item.keyword || 'N/A';
      const campaign = item.nomeCampanha || item.campaign || 'N/A';
      const currentBid = item.lance || item.bid || 0;
      const currentCpc = item.cpc || 0;
      const clicks = item.cliques || item.clicks || 0;
      const orders = item.pedidos || item.orders || 0;
      const sales = item.vendas || item.sales || 0;
      const spend = item.gastos || item.spend || 0;
      const acos = item.acos || 0;
      const impressions = item.impressoes || item.impressions || 0;
      
      // Pular se dados insuficientes
      if (currentBid === 0 || keyword === 'N/A') return;
      
      let action = '';
      let newBid = currentBid;
      let priority: 'Alta' | 'Média' | 'Baixa' = 'Baixa';
      let ruleApplied = '';
      let justification = '';
      let estimatedImpact = 0;
      
      // REGRA 1: Keywords sem conversão - Ajustar tolerâncias para mais variedade
      if (orders === 0 && clicks > 0) {
        if (clicks >= 20) { // Reduzido de tolerances.high para gerar mais desativações
          action = 'Desativar keyword';
          newBid = 0;
          priority = 'Alta';
          ruleApplied = 'SOP-001: Desativação por cliques sem conversão';
          justification = `${clicks} cliques sem conversão. Desperdício confirmado.`;
          estimatedImpact = spend;
        } else if (clicks >= 10) { // Reduzido para gerar mais reduções
          action = 'Reduzir lance em 40%';
          newBid = currentBid * 0.6;
          priority = 'Alta';
          ruleApplied = 'SOP-002: Redução agressiva por performance ruim';
          justification = `${clicks} cliques sem conversão. Reduzir investimento significativamente.`;
          estimatedImpact = spend * 0.4;
        } else if (clicks >= 5) {
          action = 'Reduzir lance em 25%';
          newBid = currentBid * 0.75;
          priority = 'Média';
          ruleApplied = 'SOP-003: Redução moderada por baixa conversão';
          justification = `${clicks} cliques sem conversão. Otimização preventiva.`;
          estimatedImpact = spend * 0.25;
        } else if (clicks >= 2) {
          action = 'Reduzir lance em 15%';
          newBid = currentBid * 0.85;
          priority = 'Baixa';
          ruleApplied = 'SOP-004: Redução leve para teste';
          justification = `${clicks} cliques sem conversão. Redução leve para teste.`;
          estimatedImpact = spend * 0.15;
        } else {
          action = 'Manter observação';
          newBid = currentBid;
          priority = 'Baixa';
          ruleApplied = 'SOP-005: Monitoramento';
          justification = `Apenas ${clicks} clique(s). Aguardar mais dados.`;
          estimatedImpact = 0;
        }
      }
      
      // REGRA 2: ACoS alto - somente se não há ação prioritária definida
      if (!action && acos > 0) {
        if (acos >= 0.50) {
          action = 'Reduzir lance em 50%';
          newBid = currentBid * 0.5;
          priority = 'Alta';
          ruleApplied = 'SOP-006: ACoS crítico';
          justification = `ACoS de ${(acos * 100).toFixed(1)}% está muito alto. Redução agressiva necessária.`;
          estimatedImpact = spend * 0.5;
        } else if (acos >= 0.35) {
          action = 'Reduzir lance em 30%';
          newBid = currentBid * 0.7;
          priority = 'Alta';
          ruleApplied = 'SOP-007: ACoS alto';
          justification = `ACoS de ${(acos * 100).toFixed(1)}% precisa ser otimizado urgentemente.`;
          estimatedImpact = spend * 0.3;
        } else if (acos >= 0.25) {
          action = 'Reduzir lance em 20%';
          newBid = currentBid * 0.8;
          priority = 'Média';
          ruleApplied = 'SOP-008: Otimização de ACoS moderado';
          justification = `ACoS de ${(acos * 100).toFixed(1)}% pode ser melhorado.`;
          estimatedImpact = spend * 0.2;
        } else if (acos >= 0.18) {
          action = 'Reduzir lance em 10%';
          newBid = currentBid * 0.9;
          priority = 'Baixa';
          ruleApplied = 'SOP-009: Ajuste fino de ACoS';
          justification = `ACoS de ${(acos * 100).toFixed(1)}% com pequeno ajuste.`;
          estimatedImpact = spend * 0.1;
        }
      }
      
      // REGRA 3: Performance excelente - SCALING (somente se ainda sem ação)
      if (!action && acos > 0 && acos <= 0.17 && orders > 0) {
        if (acos <= 0.08) {
          action = 'Aumentar lance em 30%';
          newBid = currentBid * 1.30;
          priority = 'Alta';
          ruleApplied = 'SOP-010: Scaling agressivo de winner';
          justification = `ACoS excelente de ${(acos * 100).toFixed(1)}% com ${orders} conversões. Scaling máximo.`;
          estimatedImpact = -(spend * 0.6);
        } else if (acos <= 0.12) {
          action = 'Aumentar lance em 20%';
          newBid = currentBid * 1.20;
          priority = 'Alta';
          ruleApplied = 'SOP-011: Scaling forte de performer';
          justification = `ACoS muito bom de ${(acos * 100).toFixed(1)}% com conversões. Scaling recomendado.`;
          estimatedImpact = -(spend * 0.4);
        } else {
          action = 'Aumentar lance em 12%';
          newBid = currentBid * 1.12;
          priority = 'Média';
          ruleApplied = 'SOP-012: Scaling conservador';
          justification = `ACoS bom de ${(acos * 100).toFixed(1)}% com conversões. Scaling gradual.`;
          estimatedImpact = -(spend * 0.25);
        }
      }
      
      // REGRA 4: Keywords sem performance (sem ação ainda definida)
      if (!action) {
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        
        if (impressions === 0 && spend === 0) {
          action = 'Aumentar lance em 25%';
          newBid = currentBid * 1.25;
          priority = 'Baixa';
          ruleApplied = 'SOP-013: Sem visibilidade';
          justification = `Sem impressões. Lance muito baixo para aparecer.`;
          estimatedImpact = -(currentBid * 0.25);
        } else if (impressions > 500 && ctr < 0.3) {
          action = 'Reduzir lance em 25%';
          newBid = currentBid * 0.75;
          priority = 'Baixa';
          ruleApplied = 'SOP-014: CTR muito baixo';
          justification = `CTR de ${ctr.toFixed(2)}% indica keyword irrelevante.`;
          estimatedImpact = spend * 0.25;
        } else if (clicks === 0 && impressions > 100) {
          action = 'Reduzir lance em 20%';
          newBid = currentBid * 0.8;
          priority = 'Baixa';
          ruleApplied = 'SOP-015: Sem cliques';
          justification = `${impressions} impressões mas sem cliques. Lance alto demais.`;
          estimatedImpact = spend * 0.2;
        } else if (orders > 0 && acos <= 0.25) {
          action = 'Aumentar lance em 8%';
          newBid = currentBid * 1.08;
          priority = 'Baixa';
          ruleApplied = 'SOP-016: Scaling suave';
          justification = `${orders} conversões com ACoS bom de ${(acos * 100).toFixed(1)}%. Scaling suave.`;
          estimatedImpact = -(spend * 0.15);
        } else {
          // Fallback para keywords que não se encaixaram em nenhuma regra
          action = 'Manter monitoramento';
          newBid = currentBid;
          priority = 'Baixa';
          ruleApplied = 'SOP-017: Monitoramento geral';
          justification = `Keyword estável. Manter observação para futuras otimizações.`;
          estimatedImpact = 0;
        }
      }
      
      // Adicionar recomendação se houver ação
      if (action) {
        recommendations.push({
          keyword,
          campaign,
          currentBid,
          currentCpc,
          newBid: Math.max(0.02, newBid),
          clicks,
          orders,
          acos,
          impressions,
          spend,
          sales,
          ruleApplied,
          action,
          priority,
          estimatedImpact,
          justification,
          rowIndex: index,
          ctr
        });
        
        totalEstimatedSavings += estimatedImpact;
      }
    });
    
    // Ordenar por prioridade e impacto
    recommendations.sort((a, b) => {
      const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return Math.abs(b.estimatedImpact) - Math.abs(a.estimatedImpact);
    });

    // Calcular resumo
    const summary: AnalysisSummary = {
      totalKeywords: activeKeywords.length,
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'Alta').length,
      mediumPriority: recommendations.filter(r => r.priority === 'Média').length,
      lowPriority: recommendations.filter(r => r.priority === 'Baixa').length,
      deactivations: recommendations.filter(r => r.action.includes('Desativar')).length,
      bidReductions: recommendations.filter(r => r.action.includes('Reduzir')).length,
      bidIncreases: recommendations.filter(r => r.action.includes('Aumentar')).length,
      estimatedSavings: totalEstimatedSavings,
      priceRange: config.priceRange === 'auto' ? 
        (estimatedPrice <= 50 * 5.5 ? '$50' :
         estimatedPrice <= 100 * 5.5 ? '$100' :
         estimatedPrice <= 200 * 5.5 ? '$200' : '$200+') :
        config.priceRange,
      estimatedProductPrice: estimatedPrice
    };

    return { recommendations, summary };
  }, []);

  // Handlers
  const handleFileUpload = useCallback((data: AmazonKeyword[]) => {
    setOriginalData(data);
    setError('');
    setCurrentStep('preview');

    // Auto-detectar faixa de preço se necessário
    if (analysisConfig.priceRange === 'auto') {
      const estimatedPrice = estimateProductPrice(data);
      const detectedRange = estimatedPrice <= 50 * 5.5 ? '50' :
                           estimatedPrice <= 100 * 5.5 ? '100' :
                           estimatedPrice <= 200 * 5.5 ? '200' : '200+';
      
      setAnalysisConfig(prev => ({
        ...prev,
        customTolerances: getTolerances(detectedRange, prev.analysisMode)
      }));
    }
  }, [analysisConfig.priceRange]);

  const handleError = useCallback((error: string) => {
    setError(error);
    setProcessingStatus({
      stage: 'error',
      progress: 0,
      message: error
    });
  }, []);

  const handleProceedToAnalysis = useCallback(async () => {
    setCurrentStep('config');
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    setProcessingStatus({
      stage: 'analyzing',
      progress: 0,
      message: 'Iniciando análise SOP...'
    });

    try {
      // Simular progresso da análise
      for (let i = 0; i <= 100; i += 10) {
        setProcessingStatus({
          stage: 'analyzing',
          progress: i,
          message: i < 30 ? 'Processando dados...' :
                   i < 60 ? 'Aplicando regras SOP...' :
                   i < 90 ? 'Calculando impactos...' :
                   'Finalizando análise...'
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Aplicar análise SOP
      console.log('🚀 Iniciando análise SOP com configuração:', {
        priceRange: analysisConfig.priceRange,
        analysisMode: analysisConfig.analysisMode,
        customTolerances: analysisConfig.customTolerances,
        totalKeywords: originalData.length
      });
      
      const { recommendations: recs, summary } = applySOPRules(originalData, analysisConfig);
      
      console.log(`✅ Análise concluída - ${recs.length} recomendações geradas`);
      
      // Aplicar filtro inteligente de recomendações ignoradas
      const STORAGE_KEY = 'amazon_ads_ignored_recommendations';
      const storedIgnored = localStorage.getItem(STORAGE_KEY);
      const ignoredList = storedIgnored ? JSON.parse(storedIgnored) : [];
      
      const filteredRecs = filterRecommendationsWithHistory(recs, ignoredList, {
        enablePatternLearning: true,
        enableSimilarKeywordFiltering: true,
        enableCampaignLevelFiltering: true,
        enablePerformanceBasedFiltering: true,
        similarityThreshold: 0.8
      });
      
      console.log(`🎯 Após filtro inteligente: ${filteredRecs.length} recomendações ativas (${recs.length - filteredRecs.length} ignoradas)`);
      
      // Atualizar resumo com as recomendações filtradas
      const filteredSummary = {
        ...summary,
        totalRecommendations: filteredRecs.length,
        highPriority: filteredRecs.filter(r => r.priority === 'Alta').length,
        mediumPriority: filteredRecs.filter(r => r.priority === 'Média').length,
        lowPriority: filteredRecs.filter(r => r.priority === 'Baixa').length,
        deactivations: filteredRecs.filter(r => r.action.includes('Desativar')).length,
        bidReductions: filteredRecs.filter(r => r.action.includes('Reduzir')).length,
        bidIncreases: filteredRecs.filter(r => r.action.includes('Aumentar')).length,
        estimatedSavings: filteredRecs.reduce((sum, r) => sum + r.estimatedImpact, 0)
      };
      
      console.log(`📊 Resumo atualizado: Alta: ${filteredSummary.highPriority}, Média: ${filteredSummary.mediumPriority}, Baixa: ${filteredSummary.lowPriority}`);
      
      setRecommendations(filteredRecs);
      setAnalysisSummary(filteredSummary);
      
      setProcessingStatus({
        stage: 'complete',
        progress: 100,
        message: `Análise concluída! ${filteredRecs.length} recomendações ativas.`
      });

      setCurrentStep('results');
      
    } catch (error) {
      console.error('Erro na análise:', error);
      handleError('Erro ao processar análise SOP. Tente novamente.');
    }
  }, [originalData, analysisConfig, applySOPRules, handleError]);

  const handleBack = useCallback(() => {
    if (currentStep === 'preview') {
      setCurrentStep('upload');
      setOriginalData([]);
    } else if (currentStep === 'config') {
      setCurrentStep('preview');
    } else if (currentStep === 'results') {
      setCurrentStep('config');
    }
    setError('');
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep('upload');
    setOriginalData([]);
    setRecommendations([]);
    setAnalysisSummary(null);
    setError('');
    setProcessingStatus({
      stage: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  // Steps da interface
  const steps = [
    { id: 'upload', title: 'Upload', icon: Target, description: 'Carregar planilha' },
    { id: 'preview', title: 'Preview', icon: Target, description: 'Visualizar dados' },
    { id: 'config', title: 'Configuração', icon: Settings, description: 'Ajustar análise' },
    { id: 'results', title: 'Resultados', icon: TrendingUp, description: 'Ver recomendações' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Análise SOP Amazon Ads</h2>
            {currentStep !== 'upload' && (
              <Button variant="outline" onClick={handleReset} size="sm">
                Reiniciar Análise
              </Button>
            )}
          </div>
          
          {/* Steps indicator */}
          <div className="flex items-center space-x-4 mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive ? 'bg-blue-100 text-blue-700' :
                    isCompleted ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar para análise */}
          {processingStatus.stage === 'analyzing' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStatus.message}</span>
                <span>{processingStatus.progress}%</span>
              </div>
              <Progress value={processingStatus.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 'upload' && (
        <FileUploader
          onFileUpload={handleFileUpload}
          onError={handleError}
          isProcessing={processingStatus.stage !== 'idle'}
        />
      )}

      {currentStep === 'preview' && (
        <div className="space-y-4">
          <DataPreview
            data={originalData}
            onProceedToAnalysis={handleProceedToAnalysis}
            isAnalyzing={processingStatus.stage === 'analyzing'}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'config' && (
        <div className="space-y-4">
          <AnalysisConfig
            config={analysisConfig}
            onConfigChange={setAnalysisConfig}
            estimatedPrice={estimateProductPrice(originalData)}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
            <Button 
              onClick={handleStartAnalysis}
              disabled={processingStatus.stage === 'analyzing'}
              size="lg"
            >
              {processingStatus.stage === 'analyzing' ? 'Analisando...' : 'Iniciar Análise SOP'}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'results' && analysisSummary && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          </div>
          
          <ResultsSummary summary={analysisSummary} />
          <RecommendationsTable recommendations={recommendations} />
          <ChartsSection recommendations={recommendations} summary={analysisSummary} />
          <DownloadButtons 
            recommendations={recommendations} 
            summary={analysisSummary}
            originalData={originalData}
          />
        </div>
      )}
    </div>
  );
};
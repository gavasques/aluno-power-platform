/**
 * PRESENTATION: AdvancedInfographicPresentation
 * Pure UI component for advanced infographic generation functionality
 * Extracted from AdvancedInfographicGenerator.tsx (671 lines) for modularization
 */
import React, { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import Layout from '@/components/layout/Layout';
import { ProductInfoStep } from './components/ProductInfoStep';
import { ConceptStep } from './components/ConceptStep';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { STEP_CONFIG, type AdvancedInfographicState, type AdvancedInfographicActions } from './types';

interface AdvancedInfographicPresentationProps {
  state: AdvancedInfographicState;
  actions: AdvancedInfographicActions;
  isGenerating: boolean;
}

export const AdvancedInfographicPresentation = memo<AdvancedInfographicPresentationProps>(({
  state,
  actions,
  isGenerating
}) => {
  const currentStepIndex = STEP_CONFIG.findIndex(step => step.id === state.currentStep);
  const progressPercentage = ((currentStepIndex + 1) / STEP_CONFIG.length) * 100;

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'product':
        return (
          <ProductInfoStep
            productInfo={state.productInfo}
            onUpdateField={actions.updateProductInfo}
            onNextStep={actions.nextStep}
          />
        );

      case 'concept':
        return (
          <ConceptStep
            conceptInfo={state.conceptInfo}
            onUpdateField={actions.updateConceptInfo}
            onPreviousStep={actions.previousStep}
            onGenerateInfographic={actions.generateInfographic}
          />
        );

      case 'generation':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Gerando seu Infográfico...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-lg font-medium">Criando seu infográfico personalizado</p>
                <p className="text-muted-foreground">
                  Analisando seu produto e aplicando o conceito visual...
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <Progress value={state.progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {state.progress}% concluído
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'preview':
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Seu Infográfico está Pronto!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.generatedImageUrl ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={state.generatedImageUrl} 
                      alt="Infográfico gerado"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <Button onClick={actions.downloadInfographic}>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Infográfico
                    </Button>
                    <Button variant="outline" onClick={actions.resetGenerator}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Criar Novo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Erro: Imagem não encontrada.</p>
                  <Button onClick={actions.resetGenerator} className="mt-4">
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <PermissionGuard feature="agents.advanced_infographic">
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Gerador Avançado de Infográficos</h1>
            <p className="text-xl text-muted-foreground">
              Crie infográficos profissionais com IA
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              {STEP_CONFIG.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center ${index < STEP_CONFIG.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${index <= currentStepIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={`font-medium ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < STEP_CONFIG.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4
                      ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="max-w-4xl mx-auto">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-red-600">{state.error}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex justify-center">
            {renderCurrentStep()}
          </div>
        </div>
      </Layout>
    </PermissionGuard>
  );
});
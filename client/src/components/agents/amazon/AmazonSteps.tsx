import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Upload, Package, Wand2, Download } from 'lucide-react';
import { AmazonAgentStep } from '@/types/amazon';

interface AmazonStepsProps {
  steps: AmazonAgentStep[];
  currentStep: string;
  onStepClick: (stepId: string) => void;
}

export const AmazonSteps = ({ steps, currentStep, onStepClick }: AmazonStepsProps) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set([currentStep]));

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'upload':
        return Upload;
      case 'config':
        return Package;
      case 'generate':
        return Wand2;
      case 'results':
        return Download;
      default:
        return CheckCircle;
    }
  };

  const getStatusIcon = (status: AmazonAgentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: AmazonAgentStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      case 'active':
        return 'border-l-blue-500 bg-blue-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wand2 className="h-5 w-5" />
          Processo de Geração
          <Badge variant="secondary" className="ml-2">
            {steps.length} Etapas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const isCurrentStep = currentStep === step.id;
          const StepIcon = getStepIcon(step.id);
          
          return (
            <Card 
              key={step.id} 
              className={`border-l-4 transition-all duration-200 ${getStatusColor(step.status)} ${
                isCurrentStep ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <CardHeader 
                className="cursor-pointer pb-4"
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <StepIcon className="h-5 w-5 text-gray-600" />
                      <Badge variant="outline" className="text-xs">
                        Etapa {index + 1}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {step.title}
                        {isCurrentStep && (
                          <Badge variant="default" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    {step.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepClick(step.id);
                        }}
                      >
                        Continuar
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="bg-white border rounded-lg p-4">
                    <step.component stepId={step.id} />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Como funciona o processo:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. <strong>Upload:</strong> Carregue um arquivo CSV com avaliações da Amazon</p>
                <p>2. <strong>Configuração:</strong> Defina as informações do seu produto</p>
                <p>3. <strong>Geração:</strong> IA analisa os dados e gera conteúdo otimizado</p>
                <p>4. <strong>Resultados:</strong> Baixe títulos, bullet points e descrições prontos</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, BrainCircuit, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PromptStep } from '@/types/prompt';

interface PromptStepsProps {
  steps: PromptStep[];
  title: string;
}

export const PromptSteps = ({ steps, title }: PromptStepsProps) => {
  const { toast } = useToast();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['step-1']));

  const copyToClipboard = async (content: string, stepTitle: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Prompt copiado!",
        description: `O ${stepTitle} foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

  // Função para destacar conteúdo dentro de {} e []
  const highlightPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]*\]|\{[^}]*\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\[[^\]]*\]$/) || part.match(/^\{[^}]*\}$/)) {
        return (
          <span 
            key={index} 
            className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (steps.length === 1) {
    // Se há apenas um passo, exibe no formato tradicional
    const step = steps[0];
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BrainCircuit className="h-5 w-5" />
              Conteúdo do Prompt
            </CardTitle>
            <Button 
              onClick={() => copyToClipboard(step.content, step.title)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Prompt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {step.explanation && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">{step.explanation}</p>
              </div>
            </div>
          )}
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {highlightPlaceholders(step.content)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se há múltiplos passos, exibe o formato de passos
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="h-5 w-5" />
          Passos do Prompt
          <Badge variant="secondary" className="ml-2">
            {steps.length} {steps.length === 1 ? 'Passo' : 'Passos'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps
          .sort((a, b) => a.order - b.order)
          .map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);
            const isFirst = index === 0;
            
            return (
              <Card key={step.id} className={`border-l-4 ${isFirst ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant={isFirst ? "default" : "secondary"} className="text-xs">
                        {step.title}
                      </Badge>
                      {isFirst && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Comece aqui
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(step.content, step.title);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="space-y-4">
                    {step.explanation && (
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">{step.explanation}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                        {highlightPlaceholders(step.content)}
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Como usar os passos:</h4>
              <p className="text-sm text-yellow-700">
                Execute os passos em ordem. Os textos destacados em amarelo (entre [ ] ou { }) devem ser substituídos pelas suas informações específicas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

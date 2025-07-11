import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Save, 
  ChevronRight, 
  ChevronDown as ChevronDownIcon,
  Layers,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProviderConfiguration from "./ProviderConfiguration";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AgentStep {
  id?: number;
  agentId: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  promptTemplate: string;
  outputFormat: string;
  isActive: boolean;
}

interface AgentStepsConfigProps {
  agentId: string;
  agentName: string;
}

interface TestStepState {
  isTestingStep: number | null;
  testResponse: string;
  testError: string;
}

export default function AgentStepsConfig({ agentId, agentName }: AgentStepsConfigProps) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [testState, setTestState] = useState<TestStepState>({
    isTestingStep: null,
    testResponse: '',
    testError: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available AI providers and models with caching
  const { data: providers } = useQuery({
    queryKey: ['/api/ai-providers/models'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Fetch existing steps for this agent
  const { data: existingSteps, isLoading } = useQuery({
    queryKey: ['/api/agent-steps', agentId],
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Add step function
  const addStep = () => {
    const newStep: any = {
      agentId,
      stepNumber: steps.length + 1,
      stepName: `Etapa ${steps.length + 1}`,
      stepDescription: "",
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 2000,
      promptTemplate: "{{input}}",
      outputFormat: "text",
      isActive: true,
      // Additional fields for ProviderConfiguration
      reasoningLevel: 'disabled',
      enableSearch: false,
      enableImageUnderstanding: false,
      enableReasoning: false,
      reasoning_effort: 'medium',
      responseFormat: 'text',
      seed: undefined,
      top_p: undefined,
      frequency_penalty: undefined,
      presence_penalty: undefined,
      enableCodeInterpreter: false,
      enableRetrieval: false,
      fineTuneModel: '',
      selectedCollections: [],
      enableExtendedThinking: false,
      thinkingBudgetTokens: 10000,
    };
    setSteps([...steps, newStep]);
  };

  // Load existing steps
  useEffect(() => {
    if (existingSteps?.steps && existingSteps.steps.length > 0) {
      setSteps(existingSteps.steps);
      setIsMultiStep(existingSteps.steps.length > 1);
    } else if (agentId && !isLoading && existingSteps && steps.length === 0) {
      // Only add default step if we have agentId, data is loaded, and no steps exist
      addStep();
    }
  }, [existingSteps, agentId, isLoading]);

  // Save steps mutation
  const saveStepsMutation = useMutation({
    mutationFn: async (stepsData: AgentStep[]) => {
      return apiRequest(`/api/agent-steps/${agentId}`, {
        method: 'POST',
        body: JSON.stringify({ steps: stepsData }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuração Salva",
        description: "As etapas do agente foram salvas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-steps', agentId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    },
  });

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setSteps(renumberedSteps);
  };

  const updateStep = (index: number, field: keyof AgentStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex >= 0 && swapIndex < newSteps.length) {
      // Swap steps
      [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
      // Renumber
      newSteps.forEach((step, i) => step.stepNumber = i + 1);
      setSteps(newSteps);
    }
  };

  const toggleMultiStep = (enabled: boolean) => {
    setIsMultiStep(enabled);
    if (!enabled && steps.length > 1) {
      // Keep only first step when disabling multi-step
      setSteps([steps[0]]);
    } else if (enabled && steps.length === 1) {
      // Add a second step when enabling multi-step
      addStep();
    }
  };

  // Test individual step
  const testStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    setTestState({
      isTestingStep: stepIndex,
      testResponse: '',
      testError: ''
    });

    try {
      const testData = {
        provider: step.provider,
        model: step.model,
        prompt: step.promptTemplate.includes('{{input}}') 
          ? step.promptTemplate.replace('{{input}}', 'Dados de teste para validação') 
          : step.promptTemplate,
        temperature: step.temperature,
        maxTokens: step.maxTokens,
        messages: [
          {
            role: "system",
            content: "Você está sendo testado como parte de uma etapa de processamento multi-step."
          },
          {
            role: "user",
            content: step.promptTemplate.includes('{{input}}') 
              ? step.promptTemplate.replace('{{input}}', 'Dados de teste para validação')
              : step.promptTemplate
          }
        ]
      };

      const response = await apiRequest('/api/ai-providers/test', {
        method: 'POST',
        body: JSON.stringify(testData)
      });

      setTestState(prev => ({
        ...prev,
        testResponse: response.response || 'Teste executado com sucesso!',
        isTestingStep: null
      }));

    } catch (error: any) {
      setTestState(prev => ({
        ...prev,
        testError: error.message || 'Erro ao testar a etapa',
        isTestingStep: null
      }));
    }
  };

  const saveSteps = () => {
    if (steps.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma etapa antes de salvar",
        variant: "destructive",
      });
      return;
    }
    saveStepsMutation.mutate(steps);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{agentName}</h2>
          <p className="text-muted-foreground">Configure o processamento multi-etapas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isMultiStep} 
              onCheckedChange={toggleMultiStep}
              id="multi-step-toggle"
            />
            <Label htmlFor="multi-step-toggle">Multi-Etapas</Label>
          </div>
          <Badge variant={isMultiStep ? "default" : "secondary"}>
            <Layers className="h-4 w-4 mr-1" />
            {steps.length} Etapa{steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Steps Configuration */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={`step-${index}`} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    >
                      {expandedStep === index ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <Badge variant="outline">Etapa {step.stepNumber}</Badge>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={step.stepName}
                      onChange={(e) => updateStep(index, 'stepName', e.target.value)}
                      className="font-medium"
                      placeholder="Nome da etapa"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {steps.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testStep(index)}
                    disabled={testState.isTestingStep === index}
                  >
                    {testState.isTestingStep === index ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {isMultiStep && steps.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedStep === index && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Descrição da Etapa</Label>
                    <Textarea
                      value={step.stepDescription}
                      onChange={(e) => updateStep(index, 'stepDescription', e.target.value)}
                      placeholder="Descreva o que esta etapa deve fazer..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Template do Prompt</Label>
                    <Textarea
                      value={step.promptTemplate}
                      onChange={(e) => updateStep(index, 'promptTemplate', e.target.value)}
                      placeholder="Digite o prompt para esta etapa... Use {{input}} para dados da etapa anterior"
                      rows={4}
                    />
                  </div>

                  {/* Provider Configuration */}
                  <ProviderConfiguration
                    selectedProvider={step.provider}
                    selectedModel={step.model}
                    temperature={step.temperature || 0.7}
                    maxTokens={step.maxTokens || 2000}
                    onProviderChange={(provider) => updateStep(index, 'provider', provider)}
                    onModelChange={(model) => updateStep(index, 'model', model)}
                    onTemperatureChange={(temp) => updateStep(index, 'temperature', temp)}
                    onMaxTokensChange={(tokens) => updateStep(index, 'maxTokens', tokens)}
                    onAdvancedSettingsChange={(settings) => {
                      Object.entries(settings).forEach(([key, value]) => {
                        updateStep(index, key as keyof AgentStep, value);
                      });
                    }}
                  />
                </div>

                {/* Test Results */}
                {(testState.testResponse || testState.testError) && expandedStep === index && (
                  <Alert className={testState.testError ? "border-red-200" : "border-green-200"}>
                    <AlertDescription>
                      <strong>Resultado do Teste:</strong>
                      <pre className="mt-2 whitespace-pre-wrap text-sm">
                        {testState.testError || testState.testResponse}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-2">
          {isMultiStep && (
            <Button onClick={addStep} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Etapa
            </Button>
          )}
        </div>
        
        <Button 
          onClick={saveSteps}
          disabled={saveStepsMutation.isPending}
          className="min-w-32"
        >
          {saveStepsMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}
// Agent Steps Configuration - Complete rewrite using UnifiedProviderManager
// Supports: placeholders, reasoning, knowledge base, multi-provider workflows

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Save, 
  ChevronRight, 
  Layers,
  Settings,
  Bot,
  Zap,
  Brain,
  TestTube,
  Copy,
  ArrowRight,
  Eye,
  MessageSquare,
  Wrench
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UnifiedProviderManager } from "@/components/providers/UnifiedProviderManager";
import { ProviderConfiguration, ProviderWorkflow, ProviderStep } from "@/components/providers/types";

interface AgentStepAdvanced {
  id?: number;
  agentId: string;
  stepNumber: number;
  stepName: string;
  stepDescription: string;
  promptTemplate: string;
  placeholders: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    description?: string;
  }>;
  outputFormat: 'text' | 'json' | 'markdown';
  isActive: boolean;
  passOutputToNext: boolean;
  outputKey: string; // Key to use when passing to next step
  configuration: ProviderConfiguration;
}

interface AgentStepsConfigProps {
  agentId: string;
  agentName: string;
}

export default function AgentStepsConfigNew({ agentId, agentName }: AgentStepsConfigProps) {
  const [steps, setSteps] = useState<AgentStepAdvanced[]>([]);
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [workflow, setWorkflow] = useState<ProviderWorkflow>({
    name: agentName,
    description: '',
    isMultiStep: false,
    steps: []
  });
  const [testResults, setTestResults] = useState<Record<number, any>>({});
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing steps
  const { data: existingSteps, isLoading } = useQuery({
    queryKey: ['/api/agent-steps', agentId],
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000,
  });

  // Create default step
  const createDefaultStep = (stepNumber: number): AgentStepAdvanced => ({
    id: undefined,
    agentId,
    stepNumber,
    stepName: `Etapa ${stepNumber}`,
    stepDescription: `Configuração da etapa ${stepNumber}`,
    promptTemplate: stepNumber === 1 
      ? "Analise o seguinte conteúdo: {{input}}" 
      : "Continue o processamento baseado nos resultados anteriores: {{previousOutput}}",
    placeholders: stepNumber === 1 
      ? [
          {
            key: 'input',
            label: 'Entrada Principal',
            type: 'textarea',
            required: true,
            description: 'Dados de entrada para processamento'
          }
        ]
      : [
          {
            key: 'previousOutput',
            label: 'Resultado da Etapa Anterior',
            type: 'textarea',
            required: true,
            description: 'Resultado automático da etapa anterior'
          }
        ],
    outputFormat: 'text',
    isActive: true,
    passOutputToNext: true,
    outputKey: `step${stepNumber}_output`,
    configuration: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
      // OpenAI specific
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
      // Grok specific
      reasoningLevel: 'disabled',
      enableSearch: false,
      enableImageUnderstanding: false,
      // Claude specific
      enableExtendedThinking: false,
      thinkingBudgetTokens: 10000,
    }
  });

  // Initialize steps
  useEffect(() => {
    if (existingSteps?.steps && existingSteps.steps.length > 0) {
      setSteps(existingSteps.steps);
      setIsMultiStep(existingSteps.steps.length > 1);
      setWorkflow({
        isMultiStep: existingSteps.steps.length > 1,
        steps: existingSteps.steps.map(step => ({ configuration: step.configuration }))
      });
    } else if (agentId && !isLoading && steps.length === 0) {
      const defaultStep = createDefaultStep(1);
      setSteps([defaultStep]);
      setWorkflow({
        isMultiStep: false,
        steps: [{ configuration: defaultStep.configuration }]
      });
    }
  }, [existingSteps, agentId, isLoading]);

  // Add new step
  const addStep = () => {
    const newStepNumber = steps.length + 1;
    const newStep = createDefaultStep(newStepNumber);
    setSteps([...steps, newStep]);
    setWorkflow(prev => ({
      ...prev,
      isMultiStep: true,
      steps: [...prev.steps, { configuration: newStep.configuration }]
    }));
    setIsMultiStep(true);
    setExpandedStep(steps.length); // Expand the new step
  };

  // Remove step
  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      toast({
        title: "Não é possível remover",
        description: "Deve haver pelo menos uma etapa configurada",
        variant: "destructive"
      });
      return;
    }

    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({ 
      ...step, 
      stepNumber: i + 1,
      stepName: step.stepName.replace(/\d+/, (i + 1).toString())
    }));
    
    setSteps(renumberedSteps);
    setWorkflow(prev => ({
      ...prev,
      isMultiStep: renumberedSteps.length > 1,
      steps: renumberedSteps.map(step => ({ configuration: step.configuration }))
    }));
    setIsMultiStep(renumberedSteps.length > 1);
    
    // Adjust expanded step
    if (expandedStep === index) {
      setExpandedStep(null);
    } else if (expandedStep !== null && expandedStep > index) {
      setExpandedStep(expandedStep - 1);
    }
  };

  // Update step
  const updateStep = (index: number, updates: Partial<AgentStepAdvanced>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
    
    // Update workflow if configuration changed
    if (updates.configuration) {
      setWorkflow(prev => ({
        ...prev,
        steps: prev.steps.map((step, i) => 
          i === index ? { configuration: updates.configuration! } : step
        )
      }));
    }
  };

  // Update step configuration from UnifiedProviderManager
  const updateStepConfiguration = (index: number, configuration: Partial<ProviderConfiguration>) => {
    updateStep(index, { 
      configuration: { ...steps[index].configuration, ...configuration }
    });
  };

  // Move step up/down
  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex >= 0 && swapIndex < newSteps.length) {
      [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
      // Renumber
      newSteps.forEach((step, i) => {
        step.stepNumber = i + 1;
        step.stepName = step.stepName.replace(/\d+/, (i + 1).toString());
      });
      setSteps(newSteps);
      
      // Update expanded step
      if (expandedStep === index) {
        setExpandedStep(swapIndex);
      } else if (expandedStep === swapIndex) {
        setExpandedStep(index);
      }
    }
  };

  // Add placeholder to step
  const addPlaceholder = (stepIndex: number) => {
    const newPlaceholder = {
      key: `placeholder_${Date.now()}`,
      label: 'Novo Placeholder',
      type: 'text' as const,
      required: false,
      defaultValue: '',
      description: ''
    };
    
    updateStep(stepIndex, {
      placeholders: [...steps[stepIndex].placeholders, newPlaceholder]
    });
  };

  // Update placeholder
  const updatePlaceholder = (stepIndex: number, placeholderIndex: number, updates: any) => {
    const newPlaceholders = [...steps[stepIndex].placeholders];
    newPlaceholders[placeholderIndex] = { ...newPlaceholders[placeholderIndex], ...updates };
    updateStep(stepIndex, { placeholders: newPlaceholders });
  };

  // Remove placeholder
  const removePlaceholder = (stepIndex: number, placeholderIndex: number) => {
    const newPlaceholders = steps[stepIndex].placeholders.filter((_, i) => i !== placeholderIndex);
    updateStep(stepIndex, { placeholders: newPlaceholders });
  };

  // Test individual step
  const testStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    setTestResults(prev => ({ ...prev, [stepIndex]: { loading: true } }));

    try {
      const testConfig = {
        prompt: step.promptTemplate,
        placeholders: step.placeholders,
        referenceImages: [],
        placeholderValues: {}
      };

      // Simulate test (you would integrate with actual test endpoint)
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          provider: step.configuration.provider,
          model: step.configuration.model,
          prompt: step.promptTemplate.replace(/{{(\w+)}}/g, 'valor_teste'),
          ...step.configuration
        })
      });

      const result = await response.json();
      setTestResults(prev => ({ 
        ...prev, 
        [stepIndex]: { 
          loading: false, 
          success: true, 
          data: result 
        } 
      }));

      toast({
        title: "Teste executado",
        description: `Etapa ${stepIndex + 1} testada com sucesso`
      });
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [stepIndex]: { 
          loading: false, 
          success: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        } 
      }));

      toast({
        title: "Erro no teste",
        description: `Falha ao testar etapa ${stepIndex + 1}`,
        variant: "destructive"
      });
    }
  };

  // Test complete workflow
  const testWorkflow = async () => {
    setIsTestingWorkflow(true);
    try {
      // Test each step sequentially
      for (let i = 0; i < steps.length; i++) {
        await testStep(i);
      }
      toast({
        title: "Workflow testado",
        description: "Todas as etapas foram testadas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro no workflow",
        description: "Falha ao testar o workflow completo",
        variant: "destructive"
      });
    } finally {
      setIsTestingWorkflow(false);
    }
  };

  // Save configuration
  const saveConfiguration = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/agent-steps/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ steps })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar configuração');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva",
        description: "As etapas foram salvas com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-steps', agentId] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Layers className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Configuração de Etapas - {agentName}</h2>
            <p className="text-gray-600 text-sm">Configure workflows multi-etapas com provedores IA diferentes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => testWorkflow()}
            disabled={isTestingWorkflow}
            variant="outline"
            size="sm"
          >
            {isTestingWorkflow ? (
              <>
                <TestTube className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Testar Workflow
              </>
            )}
          </Button>
          <Button
            onClick={() => saveConfiguration.mutate()}
            disabled={saveConfiguration.isPending}
            size="sm"
          >
            {saveConfiguration.isPending ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration Mode Toggle */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Simple/Advanced Toggle */}
            <div className="flex items-center justify-between border-b border-purple-200 pb-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={showAdvancedMode}
                  onCheckedChange={setShowAdvancedMode}
                />
                <div>
                  <Label className="text-base font-medium">
                    {showAdvancedMode ? 'Modo Avançado' : 'Modo Simples'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {showAdvancedMode 
                      ? 'Controle total sobre placeholders, workflows e configurações avançadas'
                      : 'Interface simplificada com configurações essenciais'
                    }
                  </p>
                </div>
              </div>
              <Badge variant={showAdvancedMode ? "default" : "outline"}>
                {showAdvancedMode ? 'Avançado' : 'Simples'}
              </Badge>
            </div>

            {/* Multi-step toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={isMultiStep}
                  onCheckedChange={(checked) => {
                    setIsMultiStep(checked);
                    if (!checked && steps.length > 1) {
                      setSteps([steps[0]]);
                    } else if (checked && steps.length === 1) {
                      addStep();
                    }
                  }}
                />
                <div>
                  <Label className="text-base font-medium">Processamento Multi-Etapas</Label>
                  <p className="text-sm text-gray-600">
                    {isMultiStep 
                      ? `${steps.length} etapas configuradas - cada etapa pode usar um provedor IA diferente`
                      : 'Agente com configuração única'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {isMultiStep ? `${steps.length} Etapas` : '1 Etapa'}
                </Badge>
                {isMultiStep && (
                  <Button onClick={addStep} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow visualization */}
      {isMultiStep && steps.length > 1 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Fluxo do Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="flex flex-col items-center min-w-[120px] p-3 border rounded-lg bg-white cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  >
                    <Badge className="mb-2">{step.configuration.provider}</Badge>
                    <span className="text-sm font-medium text-center">{step.stepName}</span>
                    <span className="text-xs text-gray-500">{step.configuration.model}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps configuration */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="cursor-pointer" onClick={() => setExpandedStep(expandedStep === index ? null : index)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {expandedStep === index ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Bot className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{step.stepName}</CardTitle>
                  </div>
                  <Badge variant="outline">{step.configuration.provider}</Badge>
                  <Badge variant="outline">{step.configuration.model}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[index] && (
                    <Badge 
                      className={testResults[index].success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {testResults[index].loading ? 'Testando...' : testResults[index].success ? 'Teste OK' : 'Erro'}
                    </Badge>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      testStep(index);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  {steps.length > 1 && (
                    <>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStep(index, 'up');
                        }}
                        disabled={index === 0}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveStep(index, 'down');
                        }}
                        disabled={index === steps.length - 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(index);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {step.stepDescription && (
                <p className="text-sm text-gray-600 mt-2">{step.stepDescription}</p>
              )}
            </CardHeader>

            {expandedStep === index && (
              <CardContent className="space-y-6">
                {/* Basic step info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{isMultiStep ? 'Nome da Etapa' : 'Nome do Agente'}</Label>
                    <Input
                      value={step.stepName}
                      onChange={(e) => updateStep(index, { stepName: e.target.value })}
                      placeholder={isMultiStep ? "Nome da etapa" : "Nome do agente"}
                    />
                  </div>
                  <div>
                    <Label>Formato de Saída</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={step.outputFormat}
                      onChange={(e) => updateStep(index, { outputFormat: e.target.value as any })}
                    >
                      <option value="text">Texto</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>{isMultiStep ? 'Descrição da Etapa' : 'Descrição do Agente'}</Label>
                  <Textarea
                    value={step.stepDescription}
                    onChange={(e) => updateStep(index, { stepDescription: e.target.value })}
                    placeholder={isMultiStep ? "Descreva o que esta etapa faz..." : "Descreva a função deste agente..."}
                  />
                </div>

                {/* Prompt template */}
                <div>
                  <Label>Template do Prompt</Label>
                  <Textarea
                    value={step.promptTemplate}
                    onChange={(e) => updateStep(index, { promptTemplate: e.target.value })}
                    placeholder="Digite o template do prompt com placeholders {{variavel}}"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{{'} nome_variavel {'}}'}  para criar placeholders. Ex: {'{{'} input {'}}'}  , {'{{'} previousOutput {'}}'}
                  </p>
                </div>

                {/* Placeholders management - only in advanced mode */}
                {showAdvancedMode && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium">Placeholders</Label>
                      <Button
                        onClick={() => addPlaceholder(index)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Placeholder
                      </Button>
                    </div>
                    
                    {step.placeholders.map((placeholder, pIndex) => (
                      <Card key={pIndex} className="mb-3">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Chave</Label>
                              <Input
                                value={placeholder.key}
                                onChange={(e) => updatePlaceholder(index, pIndex, { key: e.target.value })}
                                placeholder="nome_variavel"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={placeholder.label}
                                onChange={(e) => updatePlaceholder(index, pIndex, { label: e.target.value })}
                                placeholder="Nome amigável"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Tipo</Label>
                              <div className="flex items-center gap-2">
                                <select
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                  value={placeholder.type}
                                  onChange={(e) => updatePlaceholder(index, pIndex, { type: e.target.value })}
                                >
                                  <option value="text">Texto</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="number">Número</option>
                                  <option value="select">Seleção</option>
                                </select>
                                <Button
                                  onClick={() => removePlaceholder(index, pIndex)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <Label className="text-xs">Valor Padrão</Label>
                              <Input
                                value={placeholder.defaultValue || ''}
                                onChange={(e) => updatePlaceholder(index, pIndex, { defaultValue: e.target.value })}
                                placeholder="Valor padrão (opcional)"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={placeholder.required}
                                  onCheckedChange={(checked) => updatePlaceholder(index, pIndex, { required: checked })}
                                />
                                <Label className="text-xs">Obrigatório</Label>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label className="text-xs">Descrição</Label>
                            <Textarea
                              value={placeholder.description || ''}
                              onChange={(e) => updatePlaceholder(index, pIndex, { description: e.target.value })}
                              placeholder="Descrição do placeholder (opcional)"
                              className="min-h-[60px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <>
            <Separator />

            {/* Unified Provider Configuration */}
            <div>
            <Label className="text-base font-medium mb-4 block">
              Configuração do Provedor IA {isMultiStep && `- Etapa ${index + 1}`}
            </Label>
            <UnifiedProviderManager
              mode={showAdvancedMode ? "full-configuration" : "step-configuration"}
              workflow={{
                isMultiStep: isMultiStep,
                steps: [{ configuration: step.configuration }]
              }}
              onConfigurationChange={(config) => updateStepConfiguration(index, config)}
              showTesting={true}
              showPromptConfiguration={false}
              compact={!showAdvancedMode}
            />
          </div>

          {/* Test results */}
          {testResults[index] && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Resultado do Teste
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults[index].loading ? (
                  <div className="text-center py-4">
                    <TestTube className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p>Testando etapa...</p>
                  </div>
                ) : testResults[index].success ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">Teste bem-sucedido</Badge>
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-40">
                      {JSON.stringify(testResults[index].data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge className="bg-red-100 text-red-800">Erro no teste</Badge>
                    <p className="text-red-600 text-sm">{testResults[index].error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </>
        </div>
      ))}
    </div>

    {/* Global actions */}
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="text-sm text-gray-600">
        {steps.length} etapa{steps.length !== 1 ? 's' : ''} configurada{steps.length !== 1 ? 's' : ''}
      </div>
      <div className="flex gap-2">
        {isMultiStep && (
          <Button onClick={addStep} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Etapa
          </Button>
        )}
        <Button
          onClick={() => saveConfiguration.mutate()}
          disabled={saveConfiguration.isPending}
        >
          {saveConfiguration.isPending ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Plus, Trash2, ArrowUp, ArrowDown, Zap, Settings, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AgentStep {
  id?: string;
  agentId: string;
  stepNumber: number;
  stepName: string;
  stepDescription?: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  promptTemplate: string;
  outputFormat: string;
  isActive: boolean;
}

interface AgentStepsConfigProps {
  agentId: string;
  agentName: string;
}

export default function AgentStepsConfig({ agentId, agentName }: AgentStepsConfigProps) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available AI providers and models
  const { data: providers } = useQuery({
    queryKey: ['/api/ai-providers/models'],
  });

  // Fetch existing steps for this agent
  const { data: existingSteps, isLoading } = useQuery({
    queryKey: ['/api/agent-steps', agentId],
    enabled: !!agentId,
  });

  // Load existing steps
  useEffect(() => {
    if (existingSteps?.steps) {
      setSteps(existingSteps.steps);
      setIsMultiStep(existingSteps.steps.length > 1);
      if (existingSteps.steps.length === 0) {
        // Add default single step if no steps exist
        addStep();
      }
    }
  }, [existingSteps]);

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

  const addStep = () => {
    const newStep: AgentStep = {
      agentId,
      stepNumber: steps.length + 1,
      stepName: `Etapa ${steps.length + 1}`,
      stepDescription: "",
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 2000,
      promptTemplate: "\{\{input\}\}",
      outputFormat: "text",
      isActive: true,
    };
    setSteps([...steps, newStep]);
  };

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

  const getAvailableModels = (provider: string) => {
    if (!providers) return [];
    return providers.filter((p: any) => p.provider === provider);
  };

  const renderStepCard = (step: AgentStep, index: number) => {
    const isExpanded = expandedStep === index;
    
    return (
      <Card key={index} className={`mb-4 ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50">
                Etapa {step.stepNumber}
              </Badge>
              <CardTitle className="text-lg">{step.stepName}</CardTitle>
              <Badge variant="secondary">
                {step.provider}/{step.model}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isMultiStep && steps.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedStep(isExpanded ? null : index)}
              >
                {isExpanded ? <Eye className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              </Button>
              {isMultiStep && steps.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {step.stepDescription && (
            <p className="text-sm text-muted-foreground">{step.stepDescription}</p>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`stepName-${index}`}>Nome da Etapa</Label>
                <Input
                  id={`stepName-${index}`}
                  value={step.stepName}
                  onChange={(e) => updateStep(index, 'stepName', e.target.value)}
                  placeholder="Ex: Análise de CSV, Avaliação, Geração de Imagem"
                />
              </div>
              <div>
                <Label htmlFor={`stepDescription-${index}`}>Descrição</Label>
                <Input
                  id={`stepDescription-${index}`}
                  value={step.stepDescription || ''}
                  onChange={(e) => updateStep(index, 'stepDescription', e.target.value)}
                  placeholder="O que esta etapa faz?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`provider-${index}`}>Provider AI</Label>
                <Select
                  value={step.provider}
                  onValueChange={(value) => updateStep(index, 'provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                    <SelectItem value="xai">xAI (Grok)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`model-${index}`}>Modelo</Label>
                <Select
                  value={step.model}
                  onValueChange={(value) => updateStep(index, 'model', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableModels(step.provider).map((model: any) => (
                      <SelectItem key={model.model} value={model.model}>
                        {model.model}
                        {model.recommended && <Badge className="ml-2" variant="secondary">Recomendado</Badge>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`outputFormat-${index}`}>Formato de Saída</Label>
                <Select
                  value={step.outputFormat}
                  onValueChange={(value) => updateStep(index, 'outputFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="structured">Estruturado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`temperature-${index}`}>Temperature ({step.temperature})</Label>
                <Input
                  id={`temperature-${index}`}
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={step.temperature}
                  onChange={(e) => updateStep(index, 'temperature', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor={`maxTokens-${index}`}>Max Tokens</Label>
                <Input
                  id={`maxTokens-${index}`}
                  type="number"
                  min="100"
                  max="10000"
                  value={step.maxTokens}
                  onChange={(e) => updateStep(index, 'maxTokens', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`promptTemplate-${index}`}>Template do Prompt</Label>
              <Textarea
                id={`promptTemplate-${index}`}
                value={step.promptTemplate}
                onChange={(e) => updateStep(index, 'promptTemplate', e.target.value)}
                placeholder="Use {{input}} para dados de entrada e {{previousOutput}} para resultado da etapa anterior"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variáveis disponíveis: {{input}}, {{previousOutput}}, {{productName}}, {{category}}, etc.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração de Etapas</h2>
          <p className="text-muted-foreground">Agente: {agentName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="multi-step"
              checked={isMultiStep}
              onCheckedChange={toggleMultiStep}
            />
            <Label htmlFor="multi-step">Múltiplas Etapas</Label>
          </div>
          <Button
            onClick={() => saveStepsMutation.mutate(steps)}
            disabled={saveStepsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            {saveStepsMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </div>
      </div>

      {isMultiStep && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo Multi-Etapas Ativado:</strong> Este agente executará {steps.length} etapas sequenciais, 
            onde cada etapa pode usar um provider de IA diferente. A saída de cada etapa é passada para a próxima.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => renderStepCard(step, index))}
        
        {isMultiStep && steps.length < 5 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex items-center justify-center py-8">
              <Button
                onClick={addStep}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Etapa {steps.length + 1}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {steps.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Resumo da Configuração</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Total de Etapas:</strong> {steps.length}
            </div>
            <div>
              <strong>Providers Utilizados:</strong> {new Set(steps.map(s => s.provider)).size}
            </div>
            <div>
              <strong>Estimativa de Tokens:</strong> {steps.reduce((acc, s) => acc + s.maxTokens, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
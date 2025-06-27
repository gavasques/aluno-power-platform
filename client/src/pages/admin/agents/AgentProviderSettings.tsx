import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  TestTube, 
  Settings, 
  Bot,
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek';
  model: string;
  temperature: number;
  maxTokens: number;
  costPer1kTokens: number;
  isActive: boolean;
}

interface ModelConfig {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
}

interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
  deepseek: boolean;
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek', icon: '🔍', color: 'bg-orange-100 text-orange-800' }
];

function ProviderStatusCard({ status }: { status: ProviderStatus }) {
  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Status dos Provedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {PROVIDERS.map((provider) => {
            const isActive = status[provider.value as keyof ProviderStatus];
            return (
              <div key={provider.value} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-xl">{provider.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{provider.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Não configurado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Configure as chaves de API nas variáveis de ambiente para ativar os provedores.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function ModelSelector({ 
  provider, 
  currentModel, 
  models, 
  onChange 
}: { 
  provider: string;
  currentModel: string;
  models: ModelConfig[];
  onChange: (model: string) => void;
}) {
  const providerModels = models.filter((m: ModelConfig) => m.provider === provider);

  return (
    <div className="space-y-2">
      <Label>Modelo</Label>
      <Select value={currentModel} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um modelo" />
        </SelectTrigger>
        <SelectContent>
          {providerModels.map((model) => (
            <SelectItem key={model.model} value={model.model}>
              <div className="flex items-center justify-between w-full">
                <span>{model.model}</span>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline" className="text-xs">
                    {model.maxTokens.toLocaleString()} tokens
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ${model.inputCostPer1M.toFixed(2)}/1M
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {providerModels.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum modelo disponível para este provedor</p>
      )}
    </div>
  );
}

export default function AgentProviderSettings() {
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    provider: 'openai',
    model: '',
    temperature: 0.7,
    maxTokens: 2000
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
  }, [isAdmin, navigate]);

  // Fetch agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    }
  });

  // Fetch available models
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const response = await fetch('/api/ai-providers/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    }
  });

  // Fetch provider status
  const { data: providerStatus = {} } = useQuery({
    queryKey: ['ai-providers-status'],
    queryFn: async () => {
      const response = await fetch('/api/ai-providers/status');
      if (!response.ok) throw new Error('Failed to fetch provider status');
      return response.json();
    }
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (agentData: Partial<Agent>) => {
      const response = await fetch(`/api/agents/${selectedAgent?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error('Failed to update agent');
      return response.json();
    },
    onSuccess: () => {
      toast({ description: "Agente atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: () => {
      toast({ 
        description: "Erro ao atualizar agente",
        variant: "destructive" 
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (testData: { provider: string; model: string }) => {
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (!response.ok) throw new Error('Connection test failed');
      return response.json();
    },
    onSuccess: (result) => {
      toast({ description: result.message });
    },
    onError: () => {
      toast({ 
        description: "Erro ao testar conexão",
        variant: "destructive" 
      });
    }
  });

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      provider: agent.provider,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens
    });
  };

  const handleSave = () => {
    if (!selectedAgent) return;

    const selectedModel = models.find(m => m.model === formData.model);
    const costPer1kTokens = selectedModel 
      ? (selectedModel.inputCostPer1M + selectedModel.outputCostPer1M) / 1000
      : selectedAgent.costPer1kTokens;

    updateAgentMutation.mutate({
      ...selectedAgent,
      provider: formData.provider as any,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      costPer1kTokens
    });
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate({
      provider: formData.provider,
      model: formData.model
    });
  };

  if (!isAdmin) return null;

  if (agentsLoading || modelsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Configurações de Provedores IA
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure os provedores de IA e modelos para cada agente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Provider Status */}
          <div className="lg:col-span-1">
            <ProviderStatusCard status={providerStatus} />
          </div>

          {/* Agent List */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Agentes Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {agents.map((agent: Agent) => (
                    <div 
                      key={agent.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAgent?.id === agent.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {PROVIDERS.find(p => p.value === agent.provider) && (
                              <Badge className={PROVIDERS.find(p => p.value === agent.provider)?.color}>
                                {PROVIDERS.find(p => p.value === agent.provider)?.icon} {agent.provider}
                              </Badge>
                            )}
                            <Badge variant="outline">{agent.model}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Temperatura</div>
                          <div className="font-medium">{agent.temperature}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configuration Panel */}
        {selectedAgent && (
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações - {selectedAgent.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label>Provedor de IA</Label>
                  <Select 
                    value={formData.provider} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value, model: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((provider) => (
                        <SelectItem 
                          key={provider.value} 
                          value={provider.value}
                          disabled={!providerStatus[provider.value as keyof ProviderStatus]}
                        >
                          <div className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            <span>{provider.label}</span>
                            {!providerStatus[provider.value as keyof ProviderStatus] && (
                              <Badge variant="outline" className="text-xs">Não configurado</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <ModelSelector
                  provider={formData.provider}
                  currentModel={formData.model}
                  models={models}
                  onChange={(model) => setFormData(prev => ({ ...prev, model }))}
                />

                {/* Temperature */}
                <div className="space-y-2">
                  <Label>Temperatura ({formData.temperature})</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500">0 = mais conservador, 2 = mais criativo</p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label>Máximo de Tokens</Label>
                  <Input
                    type="number"
                    min="100"
                    max="8000"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500">Limite de tokens para resposta</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleTestConnection}
                  variant="outline"
                  disabled={testConnectionMutation.isPending || !formData.model}
                >
                  {testConnectionMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleSave}
                  disabled={updateAgentMutation.isPending || !formData.model}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateAgentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
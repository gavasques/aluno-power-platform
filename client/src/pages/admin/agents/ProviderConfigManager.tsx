import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Bot,
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign,
  Brain,
  Search,
  Eye,
  Globe,
  Users,
  Image,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProviderConfig {
  id?: number;
  provider: string;
  name: string;
  description: string;
  isActive: boolean;
  defaultTemperature: string;
  defaultMaxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  customSettings: Record<string, any>;
}

interface ModelConfig {
  id?: number;
  provider: string;
  model: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
  contextWindow: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  recommended: boolean;
  customSettings: Record<string, any>;
}

const PROVIDER_INFO = {
  openai: { label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  anthropic: { label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  gemini: { label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  deepseek: { label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' },
  xai: { label: 'xAI (Grok)', icon: '🧪', color: 'bg-indigo-100 text-indigo-800' }
};

export default function ProviderConfigManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [providerFormData, setProviderFormData] = useState<ProviderConfig | null>(null);
  const [modelFormData, setModelFormData] = useState<ModelConfig | null>(null);

  // Fetch provider configurations
  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['/api/provider-configs/providers'],
    queryFn: async () => {
      const response = await fetch('/api/provider-configs/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    }
  });

  // Fetch model configurations
  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: ['/api/provider-configs/models', selectedProvider],
    queryFn: async () => {
      const response = await fetch(`/api/provider-configs/models?provider=${selectedProvider}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch models');
      return response.json();
    }
  });

  // Initialize configurations
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/provider-configs/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to initialize');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider-configs/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider-configs/models'] });
      toast({
        title: "Configurações inicializadas",
        description: "As configurações padrão foram carregadas com sucesso."
      });
    }
  });

  // Update provider configuration
  const updateProviderMutation = useMutation({
    mutationFn: async ({ provider, data }: { provider: string; data: Partial<ProviderConfig> }) => {
      const response = await fetch(`/api/provider-configs/providers/${provider}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update provider');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider-configs/providers'] });
      toast({
        title: "Provedor atualizado",
        description: "As configurações do provedor foram salvas com sucesso."
      });
    }
  });

  // Update model configuration
  const updateModelMutation = useMutation({
    mutationFn: async ({ provider, model, data }: { provider: string; model: string; data: Partial<ModelConfig> }) => {
      const response = await fetch(`/api/provider-configs/models/${provider}/${model}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update model');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider-configs/models'] });
      toast({
        title: "Modelo atualizado",
        description: "As configurações do modelo foram salvas com sucesso."
      });
    }
  });

  useEffect(() => {
    const currentProvider = providers.find(p => p.provider === selectedProvider);
    if (currentProvider) {
      setProviderFormData(currentProvider);
    }
  }, [selectedProvider, providers]);

  const handleProviderSave = () => {
    if (!providerFormData) return;
    
    updateProviderMutation.mutate({
      provider: providerFormData.provider,
      data: {
        name: providerFormData.name,
        description: providerFormData.description,
        isActive: providerFormData.isActive,
        defaultTemperature: providerFormData.defaultTemperature,
        defaultMaxTokens: providerFormData.defaultMaxTokens,
        supportsStreaming: providerFormData.supportsStreaming,
        supportsVision: providerFormData.supportsVision,
        supportsFunctionCalling: providerFormData.supportsFunctionCalling,
        customSettings: providerFormData.customSettings
      }
    });
  };

  const handleModelSave = () => {
    if (!modelFormData) return;
    
    updateModelMutation.mutate({
      provider: modelFormData.provider,
      model: modelFormData.model,
      data: {
        displayName: modelFormData.displayName,
        description: modelFormData.description,
        isActive: modelFormData.isActive,
        inputCostPer1M: modelFormData.inputCostPer1M,
        outputCostPer1M: modelFormData.outputCostPer1M,
        maxTokens: modelFormData.maxTokens,
        contextWindow: modelFormData.contextWindow,
        supportsVision: modelFormData.supportsVision,
        supportsStreaming: modelFormData.supportsStreaming,
        supportsFunctionCalling: modelFormData.supportsFunctionCalling,
        recommended: modelFormData.recommended,
        customSettings: modelFormData.customSettings
      }
    });
  };

  if (loadingProviders || loadingModels) {
    return <div className="flex items-center justify-center h-64">Carregando configurações...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Configurações de Provedores e Modelos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as configurações globais dos provedores de IA e seus modelos
            </p>
          </div>
        </div>
        
        {providers.length === 0 && (
          <Button onClick={() => initializeMutation.mutate()}>
            Inicializar Configurações Padrão
          </Button>
        )}
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Provider List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Provedores Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {providers.map((provider) => (
                  <button
                    key={provider.provider}
                    onClick={() => setSelectedProvider(provider.provider)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedProvider === provider.provider
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{PROVIDER_INFO[provider.provider]?.icon}</span>
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Provider Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuração do Provedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {providerFormData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Provedor</Label>
                        <Input
                          value={providerFormData.name}
                          onChange={(e) => setProviderFormData({
                            ...providerFormData,
                            name: e.target.value
                          })}
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerFormData.isActive}
                            onCheckedChange={(checked) => setProviderFormData({
                              ...providerFormData,
                              isActive: checked
                            })}
                          />
                          <Label>Provedor Ativo</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={providerFormData.description}
                        onChange={(e) => setProviderFormData({
                          ...providerFormData,
                          description: e.target.value
                        })}
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Configurações Padrão</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Temperatura Padrão ({providerFormData.defaultTemperature})</Label>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[parseFloat(providerFormData.defaultTemperature)]}
                            onValueChange={(value) => setProviderFormData({
                              ...providerFormData,
                              defaultTemperature: value[0].toString()
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Máximo de Tokens Padrão</Label>
                          <Input
                            type="number"
                            value={providerFormData.defaultMaxTokens}
                            onChange={(e) => setProviderFormData({
                              ...providerFormData,
                              defaultMaxTokens: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Capacidades do Provedor</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerFormData.supportsStreaming}
                            onCheckedChange={(checked) => setProviderFormData({
                              ...providerFormData,
                              supportsStreaming: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Suporta Streaming
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerFormData.supportsVision}
                            onCheckedChange={(checked) => setProviderFormData({
                              ...providerFormData,
                              supportsVision: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Suporta Visão (Imagens)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerFormData.supportsFunctionCalling}
                            onCheckedChange={(checked) => setProviderFormData({
                              ...providerFormData,
                              supportsFunctionCalling: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Suporta Function Calling
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* xAI specific settings */}
                    {providerFormData.provider === 'xai' && (
                      <>
                        <Separator />
                        <div className="space-y-4 p-4 border rounded-lg bg-indigo-50 border-indigo-200">
                          <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                            <span className="text-xl">🧪</span>
                            Configurações Especiais do Grok
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={providerFormData.customSettings?.enableThinkLevel ?? false}
                                onCheckedChange={(checked) => setProviderFormData({
                                  ...providerFormData,
                                  customSettings: {
                                    ...providerFormData.customSettings,
                                    enableThinkLevel: checked
                                  }
                                })}
                              />
                              <Label className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-indigo-600" />
                                Habilitar Níveis de Raciocínio (Think Level)
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={providerFormData.customSettings?.enableLiveSearch ?? false}
                                onCheckedChange={(checked) => setProviderFormData({
                                  ...providerFormData,
                                  customSettings: {
                                    ...providerFormData.customSettings,
                                    enableLiveSearch: checked
                                  }
                                })}
                              />
                              <Label className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-indigo-600" />
                                Habilitar Busca em Tempo Real
                              </Label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleProviderSave}
                        disabled={updateProviderMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações do Provedor
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Modelos de {PROVIDER_INFO[selectedProvider]?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.model}
                    onClick={() => {
                      setSelectedModel(model);
                      setModelFormData(model);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedModel?.model === model.model
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.displayName}</span>
                        {model.recommended && (
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{model.contextWindow.toLocaleString()} tokens</span>
                        <Badge variant={model.isActive ? "default" : "secondary"} className="text-xs">
                          {model.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Model Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Configuração do Modelo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {modelFormData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome de Exibição</Label>
                        <Input
                          value={modelFormData.displayName}
                          onChange={(e) => setModelFormData({
                            ...modelFormData,
                            displayName: e.target.value
                          })}
                        />
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={modelFormData.isActive}
                            onCheckedChange={(checked) => setModelFormData({
                              ...modelFormData,
                              isActive: checked
                            })}
                          />
                          <Label>Modelo Ativo</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={modelFormData.recommended}
                            onCheckedChange={(checked) => setModelFormData({
                              ...modelFormData,
                              recommended: checked
                            })}
                          />
                          <Label>Recomendado</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={modelFormData.description || ''}
                        onChange={(e) => setModelFormData({
                          ...modelFormData,
                          description: e.target.value
                        })}
                        rows={2}
                        placeholder="Descrição opcional do modelo"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Custos
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Custo de Entrada (por 1M tokens)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={modelFormData.inputCostPer1M}
                              onChange={(e) => setModelFormData({
                                ...modelFormData,
                                inputCostPer1M: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Custo de Saída (por 1M tokens)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={modelFormData.outputCostPer1M}
                              onChange={(e) => setModelFormData({
                                ...modelFormData,
                                outputCostPer1M: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                          Custo médio por 1K tokens: ${((modelFormData.inputCostPer1M + modelFormData.outputCostPer1M) / 2000).toFixed(4)}
                        </AlertDescription>
                      </Alert>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Limites e Capacidades</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Máximo de Tokens de Saída</Label>
                          <Input
                            type="number"
                            value={modelFormData.maxTokens}
                            onChange={(e) => setModelFormData({
                              ...modelFormData,
                              maxTokens: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label>Janela de Contexto</Label>
                          <Input
                            type="number"
                            value={modelFormData.contextWindow}
                            onChange={(e) => setModelFormData({
                              ...modelFormData,
                              contextWindow: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={modelFormData.supportsVision}
                            onCheckedChange={(checked) => setModelFormData({
                              ...modelFormData,
                              supportsVision: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Suporta Visão (Imagens)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={modelFormData.supportsStreaming}
                            onCheckedChange={(checked) => setModelFormData({
                              ...modelFormData,
                              supportsStreaming: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Suporta Streaming
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={modelFormData.supportsFunctionCalling}
                            onCheckedChange={(checked) => setModelFormData({
                              ...modelFormData,
                              supportsFunctionCalling: checked
                            })}
                          />
                          <Label className="flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Suporta Function Calling
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleModelSave}
                        disabled={updateModelMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações do Modelo
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
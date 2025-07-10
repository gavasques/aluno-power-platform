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
  DollarSign,
  ImageIcon,
  Upload,
  Trash2,
  Brain,
  Search,
  Eye,
  FileJson,
  Sliders,
  Wrench,
  Settings2,
  Database
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
import { KnowledgeBaseManager } from "./KnowledgeBaseManager";

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai';
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
  xai: boolean;
}

interface ProviderInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}

const PROVIDERS: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' },
  { value: 'xai', label: 'xAI (Grok)', icon: '🧪', color: 'bg-indigo-100 text-indigo-800' }
];

export default function AgentProviderSettings() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'providers' | 'knowledge-base'>('providers');
  
  const [formData, setFormData] = useState<any>({
    provider: 'openai' as Agent['provider'],
    model: '',
    temperature: 0.7,
    maxTokens: 2000,
    // Grok specific features
    reasoningLevel: 'disabled' as 'disabled' | 'low' | 'high',
    enableSearch: false,
    enableImageUnderstanding: false,
    // OpenAI specific features
    enableReasoning: false,
    reasoning_effort: 'medium' as 'low' | 'medium' | 'high',
    responseFormat: 'text',
    seed: undefined,
    top_p: undefined,
    frequency_penalty: undefined,
    presence_penalty: undefined,
    enableCodeInterpreter: false,
    enableRetrieval: false,
    fineTuneModel: '',
    selectedCollections: [] as number[],
    // Claude specific features
    enableExtendedThinking: false,
    thinkingBudgetTokens: 10000
  });

  const [testPrompt, setTestPrompt] = useState('Olá! Como você está hoje?');
  const [testResponse, setTestResponse] = useState('');
  const [requestSent, setRequestSent] = useState('');
  const [responseReceived, setResponseReceived] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<Array<{file: File, preview: string}>>([]);

  // Fetch provider status
  const { data: status = { openai: false, anthropic: false, gemini: false, deepseek: false } } = useQuery<ProviderStatus>({
    queryKey: ['/api/ai-providers/status'],
    enabled: user?.role === 'admin'
  });

  // Fetch available models
  const { data: models = [] } = useQuery<ModelConfig[]>({
    queryKey: ['/api/ai-providers/models'],
    enabled: user?.role === 'admin'
  });

  // Fetch agents
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    enabled: user?.role === 'admin'
  });

  // Fetch knowledge base collections
  const { data: collections = [] } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    enabled: user?.role === 'admin'
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (agentData: Agent) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/agents/${agentData.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(agentData)
      });
      if (!response.ok) throw new Error('Failed to update agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agente atualizado",
        description: "As configurações do agente foram salvas com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setReferenceImages(prev => [...prev, { file, preview }]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setReferenceImages([]);
  };

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: { 
      provider: string; 
      model: string; 
      prompt: string; 
      temperature: number; 
      maxTokens: number; 
      imageData?: string;
      reasoningLevel?: 'disabled' | 'low' | 'high';
      enableSearch?: boolean;
      enableImageUnderstanding?: boolean;
      referenceImages?: Array<{ data: string; filename: string }>;
    }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Full response data:', data);
      setTestResponse(data.response || 'Teste realizado com sucesso!');
      setRequestSent(data.requestSent || '');
      setResponseReceived(data.responseReceived || '');
      toast({
        title: "Conexão testada",
        description: "A conexão com o provedor foi testada com sucesso."
      });
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : "Falha no teste de conexão";
      setTestResponse(`Erro: ${errorMsg}`);
      setRequestSent('');
      setResponseReceived('');
      toast({
        title: "Erro no teste",
        description: errorMsg,
        variant: "destructive"
      });
    }
  });

  // Filter models by selected provider
  const availableModels = models.filter(model => model.provider === formData.provider);

  // Check if model supports temperature
  const selectedModel = models.find((m: ModelConfig) => m.model === formData.model);
  const supportsTemperature = selectedModel ? !selectedModel.model.includes('o1') && !selectedModel.model.includes('o4') && !selectedModel.model.includes('image') : true;

  // Load agent data when selected
  useEffect(() => {
    if (selectedAgent) {
      setFormData({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: typeof selectedAgent.temperature === 'string' ? parseFloat(selectedAgent.temperature) : selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
        // Reset Grok features when changing agent
        reasoningLevel: 'disabled',
        enableSearch: false,
        enableImageUnderstanding: false,
        // Reset OpenAI features when changing agent
        enableReasoning: false,
        responseFormat: 'text',
        seed: undefined,
        top_p: undefined,
        frequency_penalty: undefined,
        presence_penalty: undefined,
        enableCodeInterpreter: false,
        enableRetrieval: false,
        fineTuneModel: '',
        // Reset Claude features when changing agent
        enableExtendedThinking: false,
        thinkingBudgetTokens: 10000
      });
    }
  }, [selectedAgent]);

  const handleSave = () => {
    if (!selectedAgent) return;

    const selectedModel = models.find((m: ModelConfig) => m.model === formData.model);
    const costPer1kTokens = selectedModel 
      ? (selectedModel.inputCostPer1M + selectedModel.outputCostPer1M) / 1000
      : parseFloat(selectedAgent.costPer1kTokens.toString());

    updateAgentMutation.mutate({
      ...selectedAgent,
      provider: formData.provider,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      costPer1kTokens
    });
  };

  const handleTestConnection = () => {
    if (!testPrompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um prompt para testar",
        variant: "destructive"
      });
      return;
    }

    // Check if image is required for gpt-image-edit model
    if (formData.model === 'gpt-image-edit' && !uploadedImage) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem para o modelo gpt-image-edit",
        variant: "destructive"
      });
      return;
    }

    setTestResponse('');
    setRequestSent('');
    setResponseReceived('');

    const testData: any = {
      provider: formData.provider,
      model: formData.model,
      prompt: testPrompt,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens
    };

    // Add Grok-specific features for xAI provider
    if (formData.provider === 'xai') {
      // Only include reasoningLevel if not disabled
      if (formData.reasoningLevel !== 'disabled') {
        testData.reasoningLevel = formData.reasoningLevel;
      }
      testData.enableSearch = formData.enableSearch;
      testData.enableImageUnderstanding = formData.enableImageUnderstanding;
    }

    // Add OpenAI-specific features
    if (formData.provider === 'openai') {
      // Reasoning for o3/o4-mini/o3-mini models
      if (['o3', 'o4-mini', 'o3-mini'].includes(formData.model)) {
        if (formData.enableReasoning) {
          testData.enableReasoning = formData.enableReasoning;
        }
        // Reasoning effort for o3-mini and o4-mini
        if (['o3-mini', 'o4-mini'].includes(formData.model) && formData.reasoning_effort) {
          testData.reasoning_effort = formData.reasoning_effort;
        }
      }

      // Response format
      if (formData.responseFormat && formData.responseFormat !== 'text') {
        testData.response_format = { type: formData.responseFormat };
      }

      // Advanced parameters (NOT for reasoning models)
      if (!['o3', 'o4-mini', 'o3-mini'].includes(formData.model)) {
        if (formData.seed) testData.seed = formData.seed;
        if (formData.top_p) testData.top_p = formData.top_p;
        if (formData.frequency_penalty) testData.frequency_penalty = formData.frequency_penalty;
        if (formData.presence_penalty) testData.presence_penalty = formData.presence_penalty;
      }

      // Tools
      const tools = [];
      if (formData.enableCodeInterpreter) {
        tools.push({ type: 'code_interpreter' });
      }
      if (formData.enableRetrieval) {
        tools.push({ type: 'retrieval' });
        // Add selected collections if any
        if (formData.selectedCollections && formData.selectedCollections.length > 0) {
          testData.selectedCollections = formData.selectedCollections;
        }
      }
      if (tools.length > 0) {
        testData.tools = tools;
      }

      // Fine-tuned model
      if (formData.fineTuneModel) {
        testData.fineTuneModel = formData.fineTuneModel;
      }
    }

    // Add Claude-specific features for Anthropic provider
    if (formData.provider === 'anthropic') {
      if (formData.enableExtendedThinking) {
        testData.claudeAdvanced = {
          enableExtendedThinking: formData.enableExtendedThinking,
          thinkingBudgetTokens: formData.thinkingBudgetTokens
        };
      }
    }

    // Add image data for image models
    if (formData.model === 'gpt-image-edit' && uploadedImage) {
      testData.imageData = uploadedImage.split(',')[1]; // Remove data:image/...;base64, prefix
    }

    // Add reference images for image/vision models
    if ((formData.model.includes('image') || formData.model.includes('vision')) && referenceImages.length > 0) {
      testData.referenceImages = referenceImages.map(img => ({
        data: img.preview.split(',')[1], // Remove data:image/...;base64, prefix
        filename: img.file.name
      }));
    }

    testConnectionMutation.mutate(testData);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Provedores IA</h1>
            <p className="text-gray-600">Configure os provedores de IA e modelos para cada agente</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'providers'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configurações de Provedores
          </button>
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'knowledge-base'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Base de Conhecimento
          </button>
        </div>
      </div>

      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status dos Provedores */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Status dos Provedores
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
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

          {/* Agentes Disponíveis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agentes Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAgent?.id === agent.id
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {PROVIDERS.find(p => p.value === agent.provider)?.label} • {agent.model}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-600">Temperatura: {agent.temperature}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          status[agent.provider as keyof ProviderStatus] 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {status[agent.provider as keyof ProviderStatus] ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações do Agente */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações - {selectedAgent.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Provedor de IA */}
                <div>
                  <Label htmlFor="provider">Provedor de IA</Label>
                  <Select value={formData.provider} onValueChange={(value) => {
                    setFormData({ ...formData, provider: value as Agent['provider'], model: '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            <span>{provider.label}</span>
                            {!status[provider.value as keyof ProviderStatus] && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Não configurado
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modelo */}
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(value) => {
                      const isReasoningModel = ['o3', 'o4-mini', 'o3-mini'].includes(value);
                      setFormData({ 
                        ...formData, 
                        model: value,
                        // Clear tools if switching to reasoning model
                        enableCodeInterpreter: isReasoningModel ? false : formData.enableCodeInterpreter,
                        enableRetrieval: isReasoningModel ? false : formData.enableRetrieval,
                        selectedCollections: isReasoningModel ? [] : formData.selectedCollections
                      });
                    }}
                    disabled={!formData.provider || availableModels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.model} value={model.model}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>{model.model}</span>
                              {model.recommended && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                  Recomendado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs text-gray-500">
                                {model.maxTokens.toLocaleString()} tokens
                              </span>
                              <span className="text-xs text-green-600">
                                ${((model.inputCostPer1M + model.outputCostPer1M) / 1000).toFixed(3)}/1K
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperatura */}
                <div className="space-y-2">
                  <Label htmlFor="temperature" className={!supportsTemperature ? "text-muted-foreground" : ""}>
                    Temperatura ({typeof formData.temperature === 'number' ? formData.temperature.toFixed(2) : formData.temperature})
                    {!supportsTemperature && <span className="text-xs ml-2">(Não disponível para este modelo)</span>}
                  </Label>
                  <div className="px-4">
                    <Slider
                      id="temperature"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[formData.temperature]}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, temperature: value[0] }))
                      }
                      className={`w-full ${!supportsTemperature ? "opacity-50 pointer-events-none" : ""}`}
                      disabled={!supportsTemperature}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0 = mais conservador, 2 = mais criativo</span>
                    </div>
                  </div>
                </div>

                {/* Máximo de Tokens */}
                <div>
                  <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                  <div className="text-sm text-gray-500 mb-2">
                    Limite de tokens para resposta
                    {selectedModel && (
                      <span className="text-xs ml-2">
                        (máximo: {selectedModel.maxTokens.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    max={selectedModel?.maxTokens || 256000}
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 1000 })}
                    className="w-full"
                  />
                </div>

                {/* Grok-specific Features */}
                {formData.provider === 'xai' && (
                  <div className="space-y-6 p-4 border rounded-lg bg-indigo-50 border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🧪</span>
                      <h3 className="text-lg font-semibold text-indigo-800">Funcionalidades Especiais do Grok</h3>
                    </div>

                    {/* Reasoning Level */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-indigo-600" />
                        <Label className="text-indigo-800 font-medium">
                          Nível de Raciocínio (Think Level)
                        </Label>
                      </div>
                      <p className="text-sm text-indigo-600">
                        Controla a profundidade do raciocínio do modelo. "High" gera respostas mais detalhadas e reflexivas.
                      </p>
                      <Select 
                        value={formData.reasoningLevel} 
                        onValueChange={(value) => setFormData({ ...formData, reasoningLevel: value as 'low' | 'high' })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">
                            <div className="flex items-center gap-2">
                              <span>⚪ Desabilitado</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <span>🔸 Low (Rápido)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <span>🔹 High (Profundo)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Live Search */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-indigo-600" />
                        <Label className="text-indigo-800 font-medium">
                          Busca em Tempo Real
                        </Label>
                      </div>
                      <p className="text-sm text-indigo-600">
                        Permite que o modelo busque informações atuais na web durante a geração de respostas.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enableSearch"
                          checked={formData.enableSearch}
                          onCheckedChange={(checked) => setFormData({ ...formData, enableSearch: checked })}
                        />
                        <Label htmlFor="enableSearch" className="text-sm">
                          Habilitar busca ao vivo
                        </Label>
                      </div>
                    </div>

                    {/* Image Understanding */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-indigo-600" />
                        <Label className="text-indigo-800 font-medium">
                          Compreensão de Imagens
                        </Label>
                      </div>
                      <p className="text-sm text-indigo-600">
                        Habilita análise e descrição detalhada de imagens (disponível para modelos vision).
                      </p>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enableImageUnderstanding"
                          checked={formData.enableImageUnderstanding}
                          onCheckedChange={(checked) => setFormData({ ...formData, enableImageUnderstanding: checked })}
                          disabled={!formData.model.includes('vision')}
                        />
                        <Label htmlFor="enableImageUnderstanding" className="text-sm">
                          Habilitar análise de imagens
                          {formData.model && !formData.model.includes('vision') && (
                            <span className="text-gray-500 ml-2">(requer modelo vision)</span>
                          )}
                        </Label>
                      </div>
                    </div>

                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Dica:</strong> As funcionalidades especiais do Grok aumentam a qualidade das respostas, 
                        mas podem resultar em maior consumo de tokens e custo.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* OpenAI-specific Features */}
                {formData.provider === 'openai' && (
                  <div className="space-y-6 p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🚀</span>
                      <h3 className="text-lg font-semibold text-green-800">Funcionalidades Avançadas da OpenAI</h3>
                    </div>

                    {/* Model Capabilities Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Capacidades do {formData.model}:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {formData.model === 'gpt-4.1' && (
                          <>
                            <div>✅ Chat tradicional • ✅ Análise de imagens • ✅ Busca na web • ✅ Ferramentas • ✅ JSON estruturado</div>
                            <div>💡 <strong>Ideal para:</strong> Tarefas complexas com análise de imagem e busca de informações atuais</div>
                          </>
                        )}
                        {formData.model === 'gpt-4o' && (
                          <>
                            <div>✅ Chat tradicional • ✅ Análise de imagens • ✅ Busca na web • ✅ Ferramentas • ✅ JSON estruturado</div>
                            <div>💡 <strong>Ideal para:</strong> Aplicações multimodais com alta qualidade de resposta</div>
                          </>
                        )}
                        {formData.model === 'gpt-4o-mini' && (
                          <>
                            <div>✅ Chat tradicional • ✅ Análise de imagens • ✅ Busca na web • ✅ Ferramentas • ✅ JSON estruturado</div>
                            <div>💡 <strong>Ideal para:</strong> Tarefas econômicas com boa qualidade e recursos completos</div>
                          </>
                        )}
                        {formData.model === 'o4-mini' && (
                          <>
                            <div>✅ Raciocínio avançado • ✅ Análise de imagens • ✅ Controle de esforço • ✅ JSON estruturado</div>
                            <div>❌ Sem busca na web • ❌ Sem parâmetros tradicionais (temperature, top_p)</div>
                            <div>💡 <strong>Ideal para:</strong> Problemas complexos que requerem raciocínio profundo com visão</div>
                          </>
                        )}
                        {formData.model === 'o3' && (
                          <>
                            <div>✅ Raciocínio premium • ✅ Análise de imagens • ✅ Sempre nível máximo • ✅ JSON estruturado</div>
                            <div>❌ Sem busca na web • ❌ Sem controle de esforço • ❌ Sem parâmetros tradicionais</div>
                            <div>💡 <strong>Ideal para:</strong> Problemas extremamente complexos que exigem o melhor raciocínio</div>
                          </>
                        )}
                        {formData.model === 'o3-mini' && (
                          <>
                            <div>✅ Raciocínio STEM • ✅ Controle de esforço • ✅ JSON estruturado • ✅ Econômico</div>
                            <div>❌ Sem análise de imagens • ❌ Sem busca na web • ❌ Sem parâmetros tradicionais</div>
                            <div>💡 <strong>Ideal para:</strong> Matemática, ciência, programação e análise lógica</div>
                          </>
                        )}
                        {formData.model === 'gpt-image-1' && (
                          <>
                            <div>✅ Geração de imagens • ✅ Edição de imagens • ✅ Alta qualidade</div>
                            <div>❌ Sem chat tradicional • ❌ Sem análise de texto</div>
                            <div>💡 <strong>Ideal para:</strong> Criação e edição profissional de imagens</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Web Search (for GPT models only) */}
                    {['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'].includes(formData.model) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-green-600" />
                          <Label className="text-green-800 font-medium">
                            Busca na Web em Tempo Real
                          </Label>
                        </div>
                        <div className="p-3 bg-green-100 rounded border border-green-200">
                          <p className="text-sm text-green-700 mb-2">
                            <strong>O que faz:</strong> Permite ao modelo buscar informações atualizadas na internet durante a conversa.
                          </p>
                          <p className="text-sm text-green-600">
                            <strong>Quando usar:</strong> Para consultas sobre notícias recentes, preços atuais, eventos, clima, ou qualquer informação que mude frequentemente.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enableSearch"
                            checked={formData.enableSearch || false}
                            onCheckedChange={(checked) => setFormData({ ...formData, enableSearch: checked })}
                          />
                          <Label htmlFor="enableSearch" className="text-sm">
                            Habilitar busca na web (recomendado para informações atuais)
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Reasoning Mode (for o3, o4-mini, o3-mini) */}
                    {['o3', 'o4-mini', 'o3-mini'].includes(formData.model) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-green-600" />
                          <Label className="text-green-800 font-medium">
                            Modo de Raciocínio Avançado
                          </Label>
                        </div>
                        <div className="p-3 bg-purple-50 rounded border border-purple-200">
                          <p className="text-sm text-purple-700 mb-2">
                            <strong>O que faz:</strong> Ativa raciocínio step-by-step profundo, ideal para problemas complexos de matemática, ciência, programação e lógica.
                          </p>
                          <p className="text-sm text-purple-600">
                            <strong>Quando usar:</strong> Para resolver problemas que requerem múltiplas etapas de análise, cálculos complexos, ou raciocínio dedutivo.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enableReasoning"
                            checked={formData.enableReasoning || false}
                            onCheckedChange={(checked) => setFormData({ ...formData, enableReasoning: checked })}
                          />
                          <Label htmlFor="enableReasoning" className="text-sm">
                            Habilitar raciocínio avançado (recomendado para este modelo)
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Reasoning Effort (for o3-mini, o4-mini) */}
                    {['o3-mini', 'o4-mini'].includes(formData.model) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-green-600" />
                          <Label className="text-green-800 font-medium">
                            Nível de Esforço de Raciocínio
                          </Label>
                        </div>
                        <div className="p-3 bg-amber-50 rounded border border-amber-200">
                          <p className="text-sm text-amber-700 mb-2">
                            <strong>O que controla:</strong> A profundidade e tempo gasto no raciocínio - níveis mais altos = respostas mais precisas mas mais lentas.
                          </p>
                          <div className="text-xs text-amber-600 space-y-1">
                            <div><strong>Baixo:</strong> Raciocínio rápido para problemas simples (mais econômico)</div>
                            <div><strong>Médio:</strong> Balanceado entre velocidade e precisão (recomendado)</div>
                            <div><strong>Alto:</strong> Raciocínio máximo para problemas extremamente complexos</div>
                          </div>
                        </div>
                        <Select 
                          value={formData.reasoning_effort || 'medium'} 
                          onValueChange={(value) => setFormData({ ...formData, reasoning_effort: value as 'low' | 'medium' | 'high' })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <span>🚀 Baixo - Rápido e econômico</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <span>⚖️ Médio - Balanceado (padrão)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <span>🧠 Alto - Raciocínio máximo</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Special note for o3 */}
                    {formData.model === 'o3' && (
                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Modelo o3:</strong> Opera sempre no nível máximo de raciocínio automaticamente. 
                          Não há controle de esforço - foi otimizado para sempre dar a melhor resposta possível.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Response Format */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-green-600" />
                        <Label className="text-green-800 font-medium">
                          Formato de Resposta Estruturada
                        </Label>
                      </div>
                      <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
                        <p className="text-sm text-cyan-700 mb-2">
                          <strong>O que faz:</strong> Força o modelo a retornar dados em formatos específicos para integração com sistemas.
                        </p>
                        <div className="text-xs text-cyan-600 space-y-1">
                          <div><strong>Texto Normal:</strong> Resposta livre em linguagem natural</div>
                          <div><strong>JSON Object:</strong> Dados estruturados em formato JSON válido</div>
                          <div><strong>JSON Schema:</strong> JSON que segue um schema específico definido</div>
                        </div>
                      </div>
                      <Select 
                        value={formData.responseFormat || 'text'} 
                        onValueChange={(value) => setFormData({ ...formData, responseFormat: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <span>📝 Texto Normal - Para conversas naturais</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="json_object">
                            <div className="flex items-center gap-2">
                              <span>📊 JSON Object - Para extração de dados</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="json_schema">
                            <div className="flex items-center gap-2">
                              <span>📋 JSON Schema - Para formato específico</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Advanced Parameters - Only for non-reasoning models */}
                    {!['o3', 'o4-mini', 'o3-mini'].includes(formData.model) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-green-600" />
                          <Label className="text-green-800 font-medium">
                            Parâmetros Avançados
                          </Label>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-4">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Parâmetros Avançados:</strong> Controles finos para ajustar o comportamento do modelo tradicional.
                          </p>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong>Seed:</strong> Torna as respostas determinísticas - mesmo prompt sempre gera mesma resposta</div>
                            <div><strong>Top P:</strong> Controla diversidade das palavras escolhidas (baixo = mais focado, alto = mais criativo)</div>
                            <div><strong>Frequency Penalty:</strong> Reduz repetição de palavras já usadas (positivo = menos repetição)</div>
                            <div><strong>Presence Penalty:</strong> Encoraja exploração de novos tópicos (positivo = mais inovador)</div>
                          </div>
                        </div>
                        
                        {/* Seed */}
                        <div className="space-y-2">
                          <Label htmlFor="seed" className="text-sm font-medium">
                            🎲 Seed - Para resultados determinísticos
                          </Label>
                          <Input
                            id="seed"
                            type="number"
                            placeholder="Ex: 12345 (deixe vazio para aleatoriedade)"
                            value={formData.seed || ''}
                            onChange={(e) => setFormData({ ...formData, seed: parseInt(e.target.value) || undefined })}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Use quando precisar de respostas consistentes para o mesmo prompt</p>
                        </div>

                        {/* Top P */}
                        <div className="space-y-2">
                          <Label htmlFor="top_p" className="text-sm font-medium">
                            🎯 Top P - Controle de criatividade (0.0 - 1.0)
                          </Label>
                          <Input
                            id="top_p"
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            placeholder="Ex: 0.9 (padrão) - 0.1 = focado, 1.0 = criativo"
                            value={formData.top_p || ''}
                            onChange={(e) => setFormData({ ...formData, top_p: parseFloat(e.target.value) || undefined })}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Alternativa à temperatura: 0.1 = respostas focadas, 0.9 = mais variação</p>
                        </div>

                        {/* Frequency Penalty */}
                        <div className="space-y-2">
                          <Label htmlFor="frequency_penalty" className="text-sm font-medium">
                            🔄 Frequency Penalty - Reduzir repetições (-2.0 a 2.0)
                          </Label>
                          <Input
                            id="frequency_penalty"
                            type="number"
                            step="0.1"
                            min="-2"
                            max="2"
                            placeholder="Ex: 0.5 - positivo reduz repetições"
                            value={formData.frequency_penalty || ''}
                            onChange={(e) => setFormData({ ...formData, frequency_penalty: parseFloat(e.target.value) || undefined })}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Valores positivos reduzem repetição de palavras já usadas na resposta</p>
                        </div>

                        {/* Presence Penalty */}
                        <div className="space-y-2">
                          <Label htmlFor="presence_penalty" className="text-sm font-medium">
                            💡 Presence Penalty - Explorar novos tópicos (-2.0 a 2.0)
                          </Label>
                          <Input
                            id="presence_penalty"
                            type="number"
                            step="0.1"
                            min="-2"
                            max="2"
                            placeholder="Ex: 0.5 - positivo incentiva novos tópicos"
                            value={formData.presence_penalty || ''}
                            onChange={(e) => setFormData({ ...formData, presence_penalty: parseFloat(e.target.value) || undefined })}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Valores positivos encorajam o modelo a explorar novos tópicos</p>
                        </div>
                      </div>
                    )}

                    {/* Warning for reasoning models */}
                    {['o3', 'o4-mini', 'o3-mini'].includes(formData.model) && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Modelos de Reasoning:</strong> Os modelos o3, o4-mini e o3-mini não suportam 
                          parâmetros avançados como temperature, top_p, frequency_penalty, presence_penalty. 
                          Use apenas os controles de raciocínio específicos acima.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Tools/Functions - Only for non-reasoning models */}
                    {!['o3', 'o4-mini', 'o3-mini'].includes(formData.model) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-green-600" />
                          <Label className="text-green-800 font-medium">
                            Ferramentas e Funções Avançadas
                          </Label>
                        </div>
                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                          <p className="text-sm text-orange-700 mb-2">
                            <strong>O que são:</strong> Extensões que permitem ao modelo executar código, analisar documentos e realizar tarefas específicas.
                          </p>
                          <div className="text-xs text-orange-600 space-y-1">
                            <div><strong>Code Interpreter:</strong> Executa código Python, faz cálculos, gera gráficos e processa dados</div>
                            <div><strong>Retrieval:</strong> Busca e analisa informações em documentos ou bases de conhecimento específicas</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enableCodeInterpreter"
                              checked={formData.enableCodeInterpreter || false}
                              onCheckedChange={(checked) => setFormData({ ...formData, enableCodeInterpreter: checked })}
                            />
                            <Label htmlFor="enableCodeInterpreter" className="text-sm">
                              🐍 Interpretador de Código - Para cálculos e análise de dados
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enableRetrieval"
                              checked={formData.enableRetrieval || false}
                              onCheckedChange={(checked) => setFormData({ ...formData, enableRetrieval: checked })}
                            />
                            <Label htmlFor="enableRetrieval" className="text-sm">
                              📚 Recuperação de Informações - Para busca em documentos
                            </Label>
                          </div>
                        
                        {/* Collection selector when retrieval is enabled */}
                        {formData.enableRetrieval && (
                          <div className="mt-3 ml-6">
                            <Label htmlFor="selectedCollections" className="text-sm text-gray-600 mb-2 block">
                              Selecione as bases de conhecimento para utilizar:
                            </Label>
                            <Select 
                              value={formData.selectedCollections?.length > 0 ? formData.selectedCollections[0].toString() : 'none'} 
                              onValueChange={(value) => setFormData({ 
                                ...formData, 
                                selectedCollections: value === 'none' ? [] : [parseInt(value)] 
                              })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione uma base de conhecimento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-gray-500">Nenhuma coleção selecionada</span>
                                </SelectItem>
                                {collections.map(collection => (
                                  <SelectItem key={collection.id} value={collection.id.toString()}>
                                    {collection.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              A base de conhecimento selecionada será usada para enriquecer as respostas do modelo
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    )}

                    {/* Fine-tuned Model */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-green-600" />
                        <Label className="text-green-800 font-medium">
                          Modelo Personalizado (Fine-tuned)
                        </Label>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <p className="text-sm text-purple-700 mb-2">
                          <strong>O que é:</strong> Um modelo OpenAI treinado especificamente com seus dados para comportamentos e respostas personalizadas.
                        </p>
                        <div className="text-xs text-purple-600 space-y-1">
                          <div><strong>Quando usar:</strong> Para casos específicos da sua empresa, estilo de escrita particular, ou domínio técnico especializado</div>
                          <div><strong>Como obter:</strong> Através do processo de fine-tuning da OpenAI com seus dados de treinamento</div>
                        </div>
                      </div>
                      <Input
                        placeholder="ID do modelo fine-tuned (ex: ft:gpt-3.5-turbo:my-org:custom:abc123)"
                        value={formData.fineTuneModel || ''}
                        onChange={(e) => setFormData({ ...formData, fineTuneModel: e.target.value })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        💡 Se especificado, este modelo personalizado será usado no lugar do modelo base selecionado
                      </p>
                    </div>

                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Dica:</strong> As funcionalidades avançadas da OpenAI permitem controle preciso sobre as respostas. 
                        Use com moderação para otimizar custos e performance.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Claude-specific Features */}
                {formData.provider === 'anthropic' && (
                  <div className="space-y-6 p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🧠</span>
                      <h3 className="text-lg font-semibold text-purple-800">Funcionalidades Avançadas da Claude</h3>
                    </div>

                    {/* Model Capabilities Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Modelos Compatíveis com Extended Thinking:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-20250219'].includes(formData.model) ? (
                          <>
                            <div>✅ <strong>{formData.model}</strong> suporta Extended Thinking</div>
                            <div>💡 <strong>Ideal para:</strong> Análise profunda, raciocínio complexo e resolução de problemas que exigem reflexão detalhada</div>
                          </>
                        ) : (
                          <>
                            <div>❌ <strong>{formData.model}</strong> não suporta Extended Thinking</div>
                            <div>💡 <strong>Modelos compatíveis:</strong> claude-opus-4-20250514, claude-sonnet-4-20250514, claude-3-7-sonnet-20250219</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Extended Thinking Controls */}
                    {['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-20250219'].includes(formData.model) && (
                      <div className="space-y-4">
                        {/* Extended Thinking Toggle */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <Label className="text-purple-800 font-medium">
                              Extended Thinking (Raciocínio Estendido)
                            </Label>
                          </div>
                          <div className="p-3 bg-purple-50 rounded border border-purple-200">
                            <p className="text-sm text-purple-700 mb-2">
                              <strong>O que é:</strong> Permite que o Claude faça um raciocínio mais profundo e detalhado antes de responder.
                            </p>
                            <div className="text-xs text-purple-600 space-y-1">
                              <div><strong>Como funciona:</strong> O modelo "pensa" internamente antes de gerar a resposta final</div>
                              <div><strong>Benefícios:</strong> Respostas mais precisas, análises mais detalhadas, melhor resolução de problemas complexos</div>
                              <div><strong>Custo:</strong> Consome tokens adicionais para o processo de raciocínio interno</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="enableExtendedThinking"
                              checked={formData.enableExtendedThinking}
                              onCheckedChange={(checked) => setFormData({ ...formData, enableExtendedThinking: checked })}
                            />
                            <Label htmlFor="enableExtendedThinking" className="text-sm">
                              Habilitar Extended Thinking
                            </Label>
                          </div>
                        </div>

                        {/* Budget Tokens */}
                        {formData.enableExtendedThinking && (
                          <div className="space-y-3 ml-6">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-purple-600" />
                              <Label className="text-purple-800 font-medium">
                                Budget de Tokens para Raciocínio
                              </Label>
                            </div>
                            <p className="text-sm text-purple-600">
                              Controla quantos tokens podem ser usados para o processo de raciocínio interno.
                              Mais tokens = raciocínio mais profundo, mas maior custo.
                            </p>
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min="1000"
                                max="50000"
                                step="1000"
                                value={formData.thinkingBudgetTokens}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  thinkingBudgetTokens: Math.max(1000, parseInt(e.target.value) || 10000)
                                })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-purple-600">
                                <span>1.000 = raciocínio básico</span>
                                <span>25.000 = raciocínio profundo</span>
                                <span>50.000 = raciocínio máximo</span>
                              </div>
                              <p className="text-xs text-purple-500">
                                💡 Recomendado: 10.000 tokens para maioria dos casos
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Dica:</strong> O Extended Thinking da Claude é ideal para tarefas que requerem análise profunda, 
                        mas resulta em maior consumo de tokens. Use quando precisar de raciocínio mais detalhado.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Test Connection Section */}
                <div className="space-y-4 border-t pt-6">
                  
            {/* Prompt de Teste */}
            <div className="space-y-2">
              <Label htmlFor="testPrompt">Prompt de Teste</Label>
              <Textarea
                id="testPrompt"
                placeholder="Digite um prompt para testar a conexão..."
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Upload de Imagens de Referência - Só aparece para modelos de imagem ou vision do Grok */}
            {selectedModel && selectedModel.model && (selectedModel.model.toLowerCase().includes('image') || selectedModel.model.toLowerCase().includes('vision')) && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <Label className="text-blue-800 font-medium">
                    Imagens de Referência (Opcional)
                  </Label>
                </div>
                <p className="text-sm text-blue-600">
                  {selectedModel.model.includes('vision') 
                    ? "Para modelos vision, você pode fornecer imagens para análise e descrição detalhada."
                    : "Para modelos de geração de imagem, você pode fornecer imagens de referência que serão usadas como base para edição ou inspiração."
                  }
                </p>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="reference-images"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('reference-images')?.click()}
                    className="w-full border-dashed border-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagens de Referência
                  </Button>

                  {/* Preview das imagens selecionadas */}
                  {referenceImages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Imagens Selecionadas:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {referenceImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Referência ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                              {image.file.name.substring(0, 15)}...
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearImages}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Limpar Todas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

                <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleTestConnection}
                      disabled={!formData.provider || !formData.model || testConnectionMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      {testConnectionMutation.isPending ? 'Testando...' : 'Testar Conexão'}
                    </Button>

                    <Button 
                      onClick={handleSave}
                      disabled={!formData.provider || !formData.model || updateAgentMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateAgentMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>

                  {/* Test Response Area */}
                  {(testResponse || testConnectionMutation.isPending) && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Resposta do Modelo</Label>
                        <div className="p-4 border rounded-lg bg-muted/50 min-h-[100px] whitespace-pre-wrap">
                          {testConnectionMutation.isPending ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                              Aguardando resposta do modelo...
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {testResponse || 'Nenhuma resposta ainda'}
                              
                              {/* Exibir imagem gerada se houver URL na resposta */}
                              {testResponse && (() => {
                                // Procurar por URLs de imagem (HTTP/HTTPS)
                                const httpImageMatch = testResponse.match(/https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp)/i);
                                
                                // Procurar por imagens base64
                                const base64ImageMatch = testResponse.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/i);
                                
                                const imageUrl = httpImageMatch ? httpImageMatch[0] : (base64ImageMatch ? base64ImageMatch[0] : null);
                                
                                if (imageUrl) {
                                  return (
                                    <div className="mt-4 p-4 border rounded-lg bg-white">
                                      <Label className="block mb-2 font-medium">Imagem Gerada:</Label>
                                      <div className="flex justify-center">
                                        <img 
                                          src={imageUrl} 
                                          alt="Imagem gerada pelo modelo"
                                          className="max-w-full max-h-96 rounded-lg shadow-md"
                                          onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.style.display = 'none';
                                            console.log('Erro ao carregar imagem:', imageUrl.substring(0, 100) + '...');
                                          }}
                                        />
                                      </div>
                                      <div className="mt-2 text-sm text-gray-600 flex gap-4">
                                        {imageUrl.startsWith('http') ? (
                                          <a 
                                            href={imageUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            Abrir imagem em nova aba
                                          </a>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              link.href = imageUrl;
                                              link.download = 'imagem-gerada.png';
                                              link.click();
                                            }}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                          >
                                            Baixar imagem
                                          </button>
                                        )}
                                        <span className="text-gray-500">
                                          Formato: {imageUrl.startsWith('data:') ? 'Base64' : 'URL'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Request JSON */}
                      {requestSent && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Requisição Enviada (JSON)</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const blob = new Blob([requestSent], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'request.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download JSON
                            </Button>
                          </div>
                          <div className="p-4 border rounded-lg bg-slate-900 text-green-400 text-sm font-mono overflow-x-auto max-h-60">
                            <pre>{requestSent}</pre>
                          </div>
                        </div>
                      )}

                      {/* Response JSON */}
                      {responseReceived && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Resposta Recebida (JSON)</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const blob = new Blob([responseReceived], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'response.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download JSON
                            </Button>
                          </div>
                          <div className="p-4 border rounded-lg bg-slate-900 text-blue-400 text-sm font-mono overflow-x-auto max-h-60">
                            <pre>{responseReceived}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um Agente
                </h3>
                <p className="text-gray-600">
                  Escolha um agente na lista ao lado para configurar suas opções de provedor e modelo.
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      )}

      {activeTab === 'knowledge-base' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Gerenciamento de Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">
                  📚 Sistema de Recuperação OpenAI (Retrieval)
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  Faça upload de documentos para que os agentes OpenAI possam usar informações específicas 
                  da sua empresa em suas respostas. Ideal para manuais, políticas, catálogos de produtos e conhecimento especializado.
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <div><strong>Tipos suportados:</strong> PDF, TXT, MD, DOCX (até 10MB cada)</div>
                  <div><strong>Como usar:</strong> Ative "Recuperação de Informações" nas configurações do agente OpenAI</div>
                  <div><strong>Funcionamento:</strong> O agente busca automaticamente nos documentos quando relevante para a pergunta</div>
                </div>
              </div>
              <KnowledgeBaseManager />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
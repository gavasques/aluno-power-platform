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
  Trash2
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
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'anthropic' | 'gemini';
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
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' }
];

export default function AgentProviderSettings() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    provider: 'openai' as Agent['provider'],
    model: '',
    temperature: 0.7,
    maxTokens: 2000
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

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (agentData: Agent) => {
      const response = await fetch(`/api/agents/${agentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    mutationFn: async (data: { provider: string; model: string; prompt: string; temperature: number; maxTokens: number; imageData?: string }) => {
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        maxTokens: selectedAgent.maxTokens
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

    // Add image data for gpt-image-edit model
    if (formData.model === 'gpt-image-edit' && uploadedImage) {
      testData.imageData = uploadedImage.split(',')[1]; // Remove data:image/...;base64, prefix
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
                    onValueChange={(value) => setFormData({ ...formData, model: value })}
                    disabled={!formData.provider || availableModels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.model} value={model.model}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.model}</span>
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
                  <div className="text-sm text-gray-500 mb-2">Limite de tokens para resposta</div>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    max="32000"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 1000 })}
                    className="w-full"
                  />
                </div>

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

            {/* Upload de Imagens de Referência - Só aparece para modelos de imagem */}
            {selectedModel && selectedModel.model && selectedModel.model.toLowerCase().includes('image') && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <Label className="text-blue-800 font-medium">
                    Imagens de Referência (Opcional)
                  </Label>
                </div>
                <p className="text-sm text-blue-600">
                  Para modelos de geração de imagem, você pode fornecer imagens de referência que serão usadas como base para edição ou inspiração.
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
                            testResponse || 'Nenhuma resposta ainda'
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
    </div>
  );
}
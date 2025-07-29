/**
 * Componente de apresentação para configuração de agentes
 * Formulário completo de configuração com validação
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Bot, DollarSign, AlertCircle, Zap } from "lucide-react";
import { PROVIDERS, RESPONSE_FORMATS, REASONING_EFFORTS, formatCost } from '../../types/agent.types';
import type { AgentConfigurationProps } from '../../types/agent.types';

export const AgentConfigurationCard = ({
  agent,
  models,
  formData,
  onFormDataUpdate,
  onSave,
  onTestConnection,
  isLoading = false,
  isSaving = false,
  isTesting = false
}: AgentConfigurationProps) => {
  if (!agent) {
    return (
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
    );
  }

  const selectedProvider = PROVIDERS.find(p => p.value === formData.provider);
  const availableModels = models.filter(m => m.provider === formData.provider);
  const selectedModel = availableModels.find(m => m.model === formData.model);

  const estimatedCost = selectedModel 
    ? (selectedModel.inputCostPer1M + selectedModel.outputCostPer1M) / 1000
    : 0;

  const handleTestConnection = () => {
    onTestConnection({
      provider: formData.provider,
      model: formData.model,
      testMessage: "Este é um teste de conexão. Responda apenas 'Conexão bem-sucedida!'",
      temperature: formData.temperature,
      maxTokens: 50
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações do Agente
          <Badge variant="outline">{agent.name}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Provider de IA</Label>
          <Select 
            value={formData.provider} 
            onValueChange={(value) => onFormDataUpdate('provider', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  <div className="flex items-center space-x-2">
                    <span>{provider.icon}</span>
                    <span>{provider.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvider && (
            <p className="text-xs text-gray-600">{selectedProvider.description}</p>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Select 
            value={formData.model} 
            onValueChange={(value) => onFormDataUpdate('model', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.model} value={model.model}>
                  <div className="flex items-center justify-between w-full">
                    <span>{model.model}</span>
                    {model.recommended && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel && (
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Input: {formatCost(selectedModel.inputCostPer1M)}/1M</span>
              <span>Output: {formatCost(selectedModel.outputCostPer1M)}/1M</span>
              <span>Max: {selectedModel.maxTokens} tokens</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Core Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium">Parâmetros Principais</h4>
          
          {/* Temperature */}
          <div className="space-y-2">
            <Label>Temperatura: {formData.temperature}</Label>
            <Slider
              value={[formData.temperature]}
              onValueChange={(value) => onFormDataUpdate('temperature', value[0])}
              max={1}
              min={0}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mais preciso</span>
              <span>Mais criativo</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Máximo de Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={formData.maxTokens}
              onChange={(e) => onFormDataUpdate('maxTokens', parseInt(e.target.value))}
              min={1}
              max={selectedModel?.maxTokens || 16000}
            />
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Prompt do Sistema</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => onFormDataUpdate('systemPrompt', e.target.value)}
              placeholder="Instruções específicas para o comportamento do agente..."
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* Advanced Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium">Parâmetros Avançados</h4>
          
          {/* Response Format */}
          <div className="space-y-2">
            <Label htmlFor="responseFormat">Formato de Resposta</Label>
            <Select 
              value={formData.responseFormat} 
              onValueChange={(value) => onFormDataUpdate('responseFormat', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESPONSE_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reasoning Mode (for OpenAI o-series) */}
          {formData.provider === 'openai' && formData.model.includes('o') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Raciocínio</Label>
                  <p className="text-xs text-gray-600">
                    Ativa raciocínio profundo para modelos o3/o4-mini
                  </p>
                </div>
                <Switch
                  checked={formData.reasoningMode}
                  onCheckedChange={(checked) => onFormDataUpdate('reasoningMode', checked)}
                />
              </div>
              
              {formData.reasoningMode && (
                <div className="space-y-2">
                  <Label>Nível de Raciocínio</Label>
                  <Select 
                    value={formData.reasoningEffort} 
                    onValueChange={(value) => onFormDataUpdate('reasoningEffort', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONING_EFFORTS.map((effort) => (
                        <SelectItem key={effort.value} value={effort.value}>
                          {effort.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Web Search */}
          {formData.provider === 'openai' && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Busca na Web</Label>
                <p className="text-xs text-gray-600">
                  Permite acesso a informações em tempo real
                </p>
              </div>
              <Switch
                checked={formData.webSearch}
                onCheckedChange={(checked) => onFormDataUpdate('webSearch', checked)}
              />
            </div>
          )}

          {/* Retrieval */}
          {formData.provider === 'openai' && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recuperação de Informações</Label>
                <p className="text-xs text-gray-600">
                  Usa base de conhecimento para respostas contextuais
                </p>
              </div>
              <Switch
                checked={formData.useRetrieval}
                onCheckedChange={(checked) => onFormDataUpdate('useRetrieval', checked)}
              />
            </div>
          )}

          {/* Code Interpreter */}
          {formData.provider === 'openai' && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Interpretador de Código</Label>
                <p className="text-xs text-gray-600">
                  Permite execução de código Python
                </p>
              </div>
              <Switch
                checked={formData.useCodeInterpreter}
                onCheckedChange={(checked) => onFormDataUpdate('useCodeInterpreter', checked)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Cost Estimation */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium">Estimativa de Custo</h4>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCost(estimatedCost)}/1k tokens
          </div>
          <p className="text-xs text-gray-600">
            Baseado nos preços atuais do provider selecionado
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={onSave} 
            disabled={isSaving || isLoading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTesting || isLoading}
          >
            <Zap className="w-4 h-4 mr-2" />
            {isTesting ? 'Testando...' : 'Testar'}
          </Button>
        </div>

        {/* Validation Warning */}
        {formData.maxTokens > (selectedModel?.maxTokens || 16000) && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              O número máximo de tokens excede o limite do modelo selecionado.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
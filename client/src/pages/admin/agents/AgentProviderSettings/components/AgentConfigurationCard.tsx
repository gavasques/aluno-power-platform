import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Bot, DollarSign, Zap } from 'lucide-react';
import { PROVIDERS, REASONING_LEVELS, REASONING_EFFORTS, RESPONSE_FORMATS } from '../types';
import type { AgentConfigurationCardProps } from '../types';

/**
 * AGENT CONFIGURATION CARD - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para configuração de agentes
 * Responsabilidade única: Formulário de configuração com campos específicos por provedor
 */
export function AgentConfigurationCard({
  selectedAgent,
  formData,
  models,
  collections,
  isLoading,
  onFormDataUpdate,
  onSave
}: AgentConfigurationCardProps) {

  if (!selectedAgent) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Agente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter models by selected provider
  const availableModels = models.filter(model => model.provider === formData.provider);
  
  // Find selected model details
  const selectedModel = models.find((m) => m.model === formData.model);
  const supportsTemperature = selectedModel ? 
    !selectedModel.model.toLowerCase().includes('o1') && 
    !selectedModel.model.toLowerCase().includes('o4') && 
    !selectedModel.model.toLowerCase().includes('image') : true;

  const getProviderInfo = (providerValue: string) => {
    return PROVIDERS.find(p => p.value === providerValue) || PROVIDERS[0];
  };

  const providerInfo = getProviderInfo(formData.provider);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Agente
          </div>
          <Badge className={providerInfo.color}>
            <span className="mr-1">{providerInfo.icon}</span>
            {providerInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-1">{selectedAgent.name}</h3>
          <p className="text-sm text-blue-700">{selectedAgent.description}</p>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">Provedor de IA</Label>
          <Select 
            value={formData.provider} 
            onValueChange={(value) => onFormDataUpdate('provider', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um provedor" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(provider => (
                <SelectItem key={provider.value} value={provider.value}>
                  <div className="flex items-center space-x-2">
                    <span>{provider.icon}</span>
                    <span>{provider.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Select 
            value={formData.model} 
            onValueChange={(value) => onFormDataUpdate('model', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(model => (
                <SelectItem key={model.model} value={model.model}>
                  <div className="flex items-center justify-between w-full">
                    <span>{model.model}</span>
                    {model.recommended && (
                      <Badge className="bg-green-100 text-green-800 ml-2 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedModel && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>Input: ${selectedModel.inputCostPer1M}/1M</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>Output: ${selectedModel.outputCostPer1M}/1M</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Max: {selectedModel.maxTokens.toLocaleString()} tokens</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Basic Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Parâmetros Básicos</h4>
          
          {/* Temperature */}
          {supportsTemperature && (
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
          )}

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Máximo de Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={formData.maxTokens}
              onChange={(e) => onFormDataUpdate('maxTokens', parseInt(e.target.value))}
              min={1}
              max={selectedModel?.maxTokens || 32000}
            />
          </div>
        </div>

        {/* Provider-specific features */}
        {formData.provider === 'xai' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recursos do Grok (xAI)</h4>
              
              <div className="space-y-2">
                <Label>Nível de Raciocínio</Label>
                <Select 
                  value={formData.reasoningLevel} 
                  onValueChange={(value) => onFormDataUpdate('reasoningLevel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONING_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Busca na Web</Label>
                  <p className="text-sm text-gray-600">
                    Permite ao modelo buscar informações atualizadas na internet
                  </p>
                </div>
                <Switch
                  checked={formData.enableSearch}
                  onCheckedChange={(checked) => onFormDataUpdate('enableSearch', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compreensão de Imagens</Label>
                  <p className="text-sm text-gray-600">
                    Permite ao modelo analisar e descrever imagens
                  </p>
                </div>
                <Switch
                  checked={formData.enableImageUnderstanding}
                  onCheckedChange={(checked) => onFormDataUpdate('enableImageUnderstanding', checked)}
                />
              </div>
            </div>
          </>
        )}

        {formData.provider === 'openai' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recursos OpenAI</h4>
              
              {/* Response Format */}
              <div className="space-y-2">
                <Label>Formato de Resposta</Label>
                <Select 
                  value={formData.responseFormat} 
                  onValueChange={(value) => onFormDataUpdate('responseFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSE_FORMATS.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed (Opcional)</Label>
                  <Input
                    id="seed"
                    type="number"
                    placeholder="Ex: 12345"
                    value={formData.seed || ''}
                    onChange={(e) => onFormDataUpdate('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top_p">Top P (Opcional)</Label>
                  <Input
                    id="top_p"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="Ex: 0.9"
                    value={formData.top_p || ''}
                    onChange={(e) => onFormDataUpdate('top_p', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Code Interpreter</Label>
                    <p className="text-sm text-gray-600">
                      Permite ao modelo executar código Python
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableCodeInterpreter}
                    onCheckedChange={(checked) => onFormDataUpdate('enableCodeInterpreter', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recuperação de Informações</Label>
                    <p className="text-sm text-gray-600">
                      Permite ao modelo buscar em documentos da base de conhecimento
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableRetrieval}
                    onCheckedChange={(checked) => onFormDataUpdate('enableRetrieval', checked)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {formData.provider === 'anthropic' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recursos Claude</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Extended Thinking</Label>
                  <p className="text-sm text-gray-600">
                    Permite ao modelo usar raciocínio estendido antes de responder
                  </p>
                </div>
                <Switch
                  checked={formData.enableExtendedThinking}
                  onCheckedChange={(checked) => onFormDataUpdate('enableExtendedThinking', checked)}
                />
              </div>

              {formData.enableExtendedThinking && (
                <div className="space-y-2">
                  <Label htmlFor="thinkingBudget">Orçamento de Thinking (Tokens)</Label>
                  <Input
                    id="thinkingBudget"
                    type="number"
                    value={formData.thinkingBudgetTokens}
                    onChange={(e) => onFormDataUpdate('thinkingBudgetTokens', parseInt(e.target.value))}
                    min={1000}
                    max={100000}
                  />
                  <p className="text-xs text-gray-500">
                    Controla quantos tokens o modelo pode usar para raciocínio interno
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={onSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>

        {/* Cost Information */}
        {selectedModel && (
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Custo estimado:</strong> Input ${selectedModel.inputCostPer1M}/1M tokens, 
              Output ${selectedModel.outputCostPer1M}/1M tokens. 
              Máximo de {selectedModel.maxTokens.toLocaleString()} tokens por requisição.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
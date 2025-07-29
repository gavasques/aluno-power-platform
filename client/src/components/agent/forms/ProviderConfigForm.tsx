import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { AgentFormData, AgentProvider } from '@/types/agent';

interface ProviderConfigFormProps {
  provider: AgentProvider;
  formData: AgentFormData;
  onFormDataUpdate: <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => void;
  collections: any[];
}

export const ProviderConfigForm: React.FC<ProviderConfigFormProps> = ({
  provider,
  formData,
  onFormDataUpdate,
  collections
}) => {
  const renderTemperatureControl = () => (
    <div>
      <Label>Temperatura: {formData.temperature}</Label>
      <Slider
        value={[formData.temperature]}
        onValueChange={(value) => onFormDataUpdate('temperature', value[0])}
        max={1}
        min={0}
        step={0.1}
        className="mt-2"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Mais preciso</span>
        <span>Mais criativo</span>
      </div>
    </div>
  );

  const renderMaxTokensControl = () => (
    <div>
      <Label htmlFor="maxTokens">Máximo de Tokens</Label>
      <Input
        id="maxTokens"
        type="number"
        value={formData.maxTokens}
        onChange={(e) => onFormDataUpdate('maxTokens', parseInt(e.target.value))}
        min={1}
        max={16000}
      />
    </div>
  );

  const renderOpenAIFeatures = () => (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-medium text-gray-900">Recursos OpenAI</h3>
      
      {/* Reasoning Mode */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Modo Raciocínio (o1/o4 models)</Label>
          <p className="text-xs text-gray-500">Análise step-by-step profunda</p>
        </div>
        <Switch
          checked={formData.enableReasoning}
          onCheckedChange={(checked) => onFormDataUpdate('enableReasoning', checked)}
        />
      </div>

      {formData.enableReasoning && (
        <div>
          <Label>Esforço de Raciocínio</Label>
          <Select 
            value={formData.reasoning_effort} 
            onValueChange={(value) => onFormDataUpdate('reasoning_effort', value as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixo</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Response Format */}
      <div>
        <Label>Formato de Resposta</Label>
        <Select 
          value={formData.responseFormat} 
          onValueChange={(value) => onFormDataUpdate('responseFormat', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="json_object">JSON Object</SelectItem>
            <SelectItem value="json_schema">JSON Schema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seed">Seed (determinismo)</Label>
          <Input
            id="seed"
            type="number"
            value={formData.seed || ''}
            onChange={(e) => onFormDataUpdate('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <Label htmlFor="top_p">Top P</Label>
          <Input
            id="top_p"
            type="number"
            value={formData.top_p || ''}
            onChange={(e) => onFormDataUpdate('top_p', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0-1"
            step={0.1}
            min={0}
            max={1}
          />
        </div>
      </div>

      {/* Tools */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Code Interpreter</Label>
          <p className="text-xs text-gray-500">Execução de código Python</p>
        </div>
        <Switch
          checked={formData.enableCodeInterpreter}
          onCheckedChange={(checked) => onFormDataUpdate('enableCodeInterpreter', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Recuperação de Informações</Label>
          <p className="text-xs text-gray-500">Busca em documentos</p>
        </div>
        <Switch
          checked={formData.enableRetrieval}
          onCheckedChange={(checked) => onFormDataUpdate('enableRetrieval', checked)}
        />
      </div>
    </div>
  );

  const renderGrokFeatures = () => (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-medium text-gray-900">Recursos Grok (xAI)</h3>
      
      <div>
        <Label>Nível de Raciocínio</Label>
        <Select 
          value={formData.reasoningLevel} 
          onValueChange={(value) => onFormDataUpdate('reasoningLevel', value as 'disabled' | 'low' | 'high')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled">Desabilitado</SelectItem>
            <SelectItem value="low">Think Low</SelectItem>
            <SelectItem value="high">Think High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Busca ao Vivo</Label>
          <p className="text-xs text-gray-500">Busca na web em tempo real</p>
        </div>
        <Switch
          checked={formData.enableSearch}
          onCheckedChange={(checked) => onFormDataUpdate('enableSearch', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Compreensão de Imagem</Label>
          <p className="text-xs text-gray-500">Análise de imagens</p>
        </div>
        <Switch
          checked={formData.enableImageUnderstanding}
          onCheckedChange={(checked) => onFormDataUpdate('enableImageUnderstanding', checked)}
        />
      </div>
    </div>
  );

  const renderClaudeFeatures = () => (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-medium text-gray-900">Recursos Claude</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Pensamento Estendido</Label>
          <p className="text-xs text-gray-500">Raciocínio step-by-step visível</p>
        </div>
        <Switch
          checked={formData.enableExtendedThinking}
          onCheckedChange={(checked) => onFormDataUpdate('enableExtendedThinking', checked)}
        />
      </div>

      {formData.enableExtendedThinking && (
        <div>
          <Label htmlFor="thinkingBudgetTokens">Budget de Tokens para Pensamento</Label>
          <Input
            id="thinkingBudgetTokens"
            type="number"
            value={formData.thinkingBudgetTokens}
            onChange={(e) => onFormDataUpdate('thinkingBudgetTokens', parseInt(e.target.value))}
            min={1000}
            max={50000}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controles básicos */}
      {renderTemperatureControl()}
      {renderMaxTokensControl()}

      {/* Recursos específicos por provedor */}
      {provider === 'openai' && renderOpenAIFeatures()}
      {provider === 'xai' && renderGrokFeatures()}
      {provider === 'anthropic' && renderClaudeFeatures()}
      {provider === 'openrouter' && renderOpenAIFeatures()}
    </div>
  );
};
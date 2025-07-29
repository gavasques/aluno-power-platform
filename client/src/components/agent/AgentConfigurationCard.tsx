import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Bot } from "lucide-react";
import { ProviderConfigForm } from './forms/ProviderConfigForm';
import { TestConnectionSection } from './TestConnectionSection';
import type { 
  Agent, 
  AgentFormData, 
  ModelConfig, 
  ProviderStatus 
} from '@/types/agent';
import { PROVIDERS } from '@/types/agent';

interface AgentConfigurationCardProps {
  selectedAgent: Agent | null;
  formData: AgentFormData;
  availableModels: ModelConfig[];
  status: ProviderStatus;
  collections: any[];
  onFormDataUpdate: <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AgentConfigurationCard: React.FC<AgentConfigurationCardProps> = ({
  selectedAgent,
  formData,
  availableModels,
  status,
  collections,
  onFormDataUpdate,
  onSave,
  isSaving
}) => {
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

  return (
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
          <Select 
            value={formData.provider} 
            onValueChange={(value) => {
              onFormDataUpdate('provider', value as Agent['provider']);
              onFormDataUpdate('model', '');
            }}
          >
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
          <Select value={formData.model} onValueChange={(value) => onFormDataUpdate('model', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.model} value={model.model}>
                  <div className="flex items-center justify-between w-full">
                    <span>{model.model}</span>
                    {model.recommended && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Configurações específicas do provedor */}
        <ProviderConfigForm
          provider={formData.provider}
          formData={formData}
          onFormDataUpdate={onFormDataUpdate}
          collections={collections}
        />

        {/* Seção de teste */}
        <TestConnectionSection
          formData={formData}
          selectedAgent={selectedAgent}
        />

        {/* Botão de salvar */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={onSave}
            disabled={isSaving || !formData.model}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
  );
};
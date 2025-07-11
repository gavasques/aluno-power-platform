// Refactored Provider Configuration Component - Clean, modular component
// This is a bridge component that uses the new unified system while maintaining backward compatibility

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TestTube, Save, AlertTriangle } from "lucide-react";
import { UnifiedProviderManager } from "../UnifiedProviderManager";
import { ProviderConfiguration, ProviderWorkflow } from "../types";
import { DEFAULT_CONFIGURATION } from "../constants";

interface ProviderConfigurationRefactoredProps {
  selectedAgent?: any;
  onSave?: (config: ProviderConfiguration) => void;
  onTest?: (config: ProviderConfiguration) => void;
  showTesting?: boolean;
  showPromptConfiguration?: boolean;
  mode?: 'single-step' | 'multi-step' | 'full-configuration';
}

export function ProviderConfigurationRefactored({
  selectedAgent,
  onSave,
  onTest,
  showTesting = true,
  showPromptConfiguration = true,
  mode = 'full-configuration'
}: ProviderConfigurationRefactoredProps) {
  const [configuration, setConfiguration] = useState<ProviderConfiguration>(() => {
    if (selectedAgent) {
      return {
        ...DEFAULT_CONFIGURATION,
        name: selectedAgent.name || 'Configuração do Agente',
        description: selectedAgent.description || '',
        provider: selectedAgent.provider || 'openai',
        model: selectedAgent.model || 'gpt-4o-mini',
        temperature: selectedAgent.temperature || 0.7,
        maxTokens: selectedAgent.maxTokens || 2000
      };
    }
    return { ...DEFAULT_CONFIGURATION };
  });

  const [workflow, setWorkflow] = useState<ProviderWorkflow>({
    name: selectedAgent?.name || 'Novo Fluxo',
    description: selectedAgent?.description || '',
    steps: [],
    isMultiStep: false
  });

  // Update configuration when agent changes
  useEffect(() => {
    if (selectedAgent) {
      setConfiguration(prev => ({
        ...prev,
        name: selectedAgent.name || 'Configuração do Agente',
        description: selectedAgent.description || '',
        provider: selectedAgent.provider || 'openai',
        model: selectedAgent.model || 'gpt-4o-mini',
        temperature: selectedAgent.temperature || 0.7,
        maxTokens: selectedAgent.maxTokens || 2000
      }));
    }
  }, [selectedAgent]);

  const handleConfigurationChange = (updates: Partial<ProviderConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  };

  const handleWorkflowChange = (updatedWorkflow: ProviderWorkflow) => {
    setWorkflow(updatedWorkflow);
  };

  const handleSave = () => {
    if (workflow.isMultiStep) {
      // Save multi-step workflow - could be handled by parent or internal logic
      console.log('Saving multi-step workflow:', workflow);
    } else {
      // Save single configuration
      onSave?.(configuration);
    }
  };

  const handleTest = () => {
    onTest?.(configuration);
  };

  if (!selectedAgent) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Selecione um agente para configurar seus provedores de IA.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Info Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedAgent.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAgent.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Agente ID: {selectedAgent.id}
              </Badge>
              <Badge className={selectedAgent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {selectedAgent.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Unified Provider Manager */}
      <UnifiedProviderManager
        mode={mode}
        workflow={workflow}
        onWorkflowChange={handleWorkflowChange}
        onConfigurationChange={handleConfigurationChange}
        showTesting={showTesting}
        showPromptConfiguration={showPromptConfiguration}
      />

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configuração para agente: <strong>{selectedAgent.name}</strong>
            </p>
            <div className="flex items-center gap-2">
              {showTesting && (
                <Button variant="outline" onClick={handleTest}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Configuração
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
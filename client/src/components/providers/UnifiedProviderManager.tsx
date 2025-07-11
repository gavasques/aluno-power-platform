// Unified Provider Manager - Clean and simplified interface

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  TestTube, 
  Save, 
  Plus, 
  Layers, 
  CheckCircle2,
  AlertTriangle,
  Bot,
  Zap
} from "lucide-react";

import { UnifiedProviderManagerProps, ProviderConfiguration } from './types';
import { DEFAULT_CONFIGURATION, QUERY_CONFIG } from './constants';
import { useUnifiedProviderConfig } from './hooks/useUnifiedProviderConfig';

// Component imports
import { ProviderSelector } from './components/ProviderSelector';
import { ModelSelector } from './components/ModelSelector';
import { TemperatureControl } from './components/TemperatureControl';
import { TokenControl } from './components/TokenControl';
import { OpenAIAdvancedSettings } from './components/OpenAIAdvancedSettings';
import { GrokAdvancedSettings } from './components/GrokAdvancedSettings';
import { ClaudeAdvancedSettings } from './components/ClaudeAdvancedSettings';
import { ProviderTesting } from './components/ProviderTesting';

export function UnifiedProviderManager({
  mode = 'full-configuration',
  workflow,
  onWorkflowChange,
  onConfigurationChange,
  showTesting = true,
  showPromptConfiguration = true,
  compact = false
}: UnifiedProviderManagerProps) {
  const [activeSection, setActiveSection] = useState<'config' | 'test'>('config');
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const {
    configuration,
    workflow: currentWorkflow,
    updateConfiguration,
    updateStep,
    addStep,
    removeStep,
    testConfiguration,
    saveWorkflow,
    isLoading
  } = useUnifiedProviderConfig(workflow);

  // API queries with optimized caching
  const { data: status = {} } = useQuery({
    queryKey: ['/api/ai-providers/status'],
    ...QUERY_CONFIG
  });

  const { data: allModels = [] } = useQuery({
    queryKey: ['/api/ai-providers/models'],
    ...QUERY_CONFIG
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    ...QUERY_CONFIG,
    enabled: configuration.enableRetrieval
  });

  // Computed values
  const availableModels = allModels.filter((m: any) => m.provider === configuration.provider);
  const isMultiStep = currentWorkflow.isMultiStep;
  const currentStep = currentWorkflow.steps[selectedStepIndex];
  const currentConfig = isMultiStep ? currentStep?.configuration || configuration : configuration;

  // Handle configuration updates
  const handleConfigurationUpdate = (updates: Partial<ProviderConfiguration>) => {
    if (isMultiStep && currentStep) {
      updateStep(selectedStepIndex, {
        configuration: { ...currentStep.configuration, ...updates }
      });
    } else {
      updateConfiguration(updates);
    }
    
    onConfigurationChange?.(updates);
  };

  // Render provider-specific advanced settings
  const renderAdvancedSettings = () => {
    switch (currentConfig.provider) {
      case 'openai':
        return (
          <OpenAIAdvancedSettings
            configuration={currentConfig}
            onConfigurationChange={handleConfigurationUpdate}
            collections={collections}
          />
        );
      case 'xai':
        return (
          <GrokAdvancedSettings
            configuration={currentConfig}
            onConfigurationChange={handleConfigurationUpdate}
          />
        );
      case 'anthropic':
        return (
          <ClaudeAdvancedSettings
            configuration={currentConfig}
            onConfigurationChange={handleConfigurationUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Configuração de Provedores IA</h2>
            <p className="text-gray-600 text-sm">Configure provedores e modelos de IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeSection === 'config' ? 'default' : 'outline'}
            onClick={() => setActiveSection('config')}
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuração
          </Button>
          {showTesting && (
            <Button
              variant={activeSection === 'test' ? 'default' : 'outline'}
              onClick={() => setActiveSection('test')}
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Teste
            </Button>
          )}
        </div>
      </div>

      {/* Multi-step indicator */}
      {isMultiStep && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Multi-etapas: {currentWorkflow.steps.length} etapas configuradas
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentWorkflow.steps.map((_, index) => (
                  <Button
                    key={index}
                    variant={selectedStepIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStepIndex(index)}
                    className="w-8 h-8 p-0"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button onClick={addStep} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Section */}
      {activeSection === 'config' && (
        <div className="space-y-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Provedor de IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderSelector
                selectedProvider={currentConfig.provider}
                onProviderChange={(provider) => handleConfigurationUpdate({ provider, model: '' })}
                providerStatus={status}
                showDetails={false}
                compact={true}
              />
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelSelector
                selectedModel={currentConfig.model}
                onModelChange={(model) => handleConfigurationUpdate({ model })}
                availableModels={availableModels}
                compact={true}
              />
            </CardContent>
          </Card>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <TemperatureControl
                  temperature={currentConfig.temperature}
                  onTemperatureChange={(temperature) => handleConfigurationUpdate({ temperature })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenControl
                  maxTokens={currentConfig.maxTokens}
                  onMaxTokensChange={(maxTokens) => handleConfigurationUpdate({ maxTokens })}
                  modelMaxTokens={availableModels.find(m => m.model === currentConfig.model)?.maxTokens}
                  inputCostPer1M={availableModels.find(m => m.model === currentConfig.model)?.inputCostPer1M}
                  outputCostPer1M={availableModels.find(m => m.model === currentConfig.model)?.outputCostPer1M}
                />
              </CardContent>
            </Card>
          </div>

          {/* Advanced Settings */}
          {renderAdvancedSettings()}
        </div>
      )}

      {/* Testing Section */}
      {activeSection === 'test' && showTesting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Teste de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProviderTesting
              configuration={currentConfig}
              onTest={testConfiguration}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveWorkflow} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Configuração
        </Button>
      </div>
    </div>
  );
}
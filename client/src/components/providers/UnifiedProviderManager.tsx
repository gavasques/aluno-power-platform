// Unified Provider Manager - Main component integrating all provider functionality

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { UnifiedProviderManagerProps, ProviderConfiguration, ProviderStep } from './types';
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
import { PromptConfiguration } from './components/PromptConfiguration';
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
  const [activeTab, setActiveTab] = useState<'configuration' | 'prompts' | 'testing' | 'steps'>('configuration');
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

  // Initialize single step if no steps exist
  useEffect(() => {
    if (mode === 'multi-step' && currentWorkflow.steps.length === 0) {
      addStep();
    }
  }, [mode, currentWorkflow.steps.length, addStep]);

  // Sync with external workflow changes
  useEffect(() => {
    if (workflow && onWorkflowChange) {
      onWorkflowChange(currentWorkflow);
    }
  }, [currentWorkflow, onWorkflowChange, workflow]);

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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {mode === 'single-step' ? 'Configuração Simples' : 
               mode === 'multi-step' ? 'Configuração Multi-Etapas' : 
               'Gerenciador Unificado de Provedores'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isMultiStep && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Layers className="w-3 h-3 mr-1" />
                  {currentWorkflow.steps.length} Etapas
                </Badge>
              )}
              <Badge variant="outline">
                {status[currentConfig.provider] ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Configurado</>
                ) : (
                  <><AlertTriangle className="w-3 h-3 mr-1" />Não configurado</>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Multi-step Controls */}
      {(mode === 'multi-step' || mode === 'full-configuration') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Etapas do Fluxo
              </CardTitle>
              <Button onClick={addStep} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentWorkflow.steps.map((step, index) => (
                <Button
                  key={index}
                  variant={selectedStepIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStepIndex(index)}
                  className="flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step.stepName}
                  {currentWorkflow.steps.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStep(index);
                        if (selectedStepIndex >= index && selectedStepIndex > 0) {
                          setSelectedStepIndex(selectedStepIndex - 1);
                        }
                      }}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuração
          </TabsTrigger>
          {showPromptConfiguration && (
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Prompts
            </TabsTrigger>
          )}
          {showTesting && (
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Teste
            </TabsTrigger>
          )}
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Etapas
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Provider Selection */}
              <ProviderSelector
                selectedProvider={currentConfig.provider}
                onProviderChange={(provider) => handleConfigurationUpdate({ provider, model: '' })}
                providerStatus={status}
                showDetails={!compact}
                compact={compact}
              />

              {/* Model Selection */}
              <ModelSelector
                selectedModel={currentConfig.model}
                onModelChange={(model) => handleConfigurationUpdate({ model })}
                availableModels={availableModels}
                compact={compact}
              />
            </div>

            <div className="space-y-6">
              {/* Temperature Control */}
              <TemperatureControl
                temperature={currentConfig.temperature}
                onTemperatureChange={(temperature) => handleConfigurationUpdate({ temperature })}
              />

              {/* Token Control */}
              <TokenControl
                maxTokens={currentConfig.maxTokens}
                onMaxTokensChange={(maxTokens) => handleConfigurationUpdate({ maxTokens })}
                modelMaxTokens={availableModels.find(m => m.model === currentConfig.model)?.maxTokens}
                inputCostPer1M={availableModels.find(m => m.model === currentConfig.model)?.inputCostPer1M}
                outputCostPer1M={availableModels.find(m => m.model === currentConfig.model)?.outputCostPer1M}
              />
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          {renderAdvancedSettings()}
        </TabsContent>

        {/* Prompts Tab */}
        {showPromptConfiguration && (
          <TabsContent value="prompts" className="space-y-6">
            <PromptConfiguration
              configuration={currentConfig}
              onConfigurationChange={handleConfigurationUpdate}
              showPreview={true}
            />
          </TabsContent>
        )}

        {/* Testing Tab */}
        {showTesting && (
          <TabsContent value="testing" className="space-y-6">
            <ProviderTesting
              configuration={currentConfig}
              onTest={testConfiguration}
              isLoading={isLoading}
            />
          </TabsContent>
        )}

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuração de Etapas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWorkflow.steps.map((step, index) => (
                <Card key={index} className={`p-4 ${selectedStepIndex === index ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step.stepName}
                        onChange={(e) => updateStep(index, { stepName: e.target.value })}
                        className="font-medium bg-transparent border-none focus:outline-none"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStepIndex(index)}
                    >
                      Configurar
                    </Button>
                  </div>
                  <textarea
                    value={step.stepDescription}
                    onChange={(e) => updateStep(index, { stepDescription: e.target.value })}
                    placeholder="Descrição da etapa..."
                    className="w-full p-2 text-sm border rounded resize-none h-16"
                  />
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{step.configuration.provider}</span>
                    <span>•</span>
                    <span>{step.configuration.model}</span>
                    <span>•</span>
                    <span>{step.outputFormat}</span>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isMultiStep ? `${currentWorkflow.steps.length} etapas configuradas` : 'Configuração simples'}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setActiveTab('testing')} disabled={!showTesting}>
                <TestTube className="w-4 h-4 mr-2" />
                Testar
              </Button>
              <Button onClick={saveWorkflow} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
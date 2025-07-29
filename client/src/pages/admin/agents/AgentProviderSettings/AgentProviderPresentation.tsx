import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Database } from 'lucide-react';

// Import specialized presentation components
import { ProviderStatusCard } from './components/ProviderStatusCard';
import { AgentListCard } from './components/AgentListCard';
import { AgentConfigurationCard } from './components/AgentConfigurationCard';
import { TestConnectionCard } from './components/TestConnectionCard';
import { KnowledgeBaseTab } from './components/KnowledgeBaseTab';

// Import hook return types
import type { 
  Agent,
  UseAgentDataReturn,
  UseAgentFormReturn,
  UseTestConnectionReturn,
  UseImageHandlingReturn,
  UseAgentTabsReturn,
  UseAgentFiltersReturn
} from './types';

interface AgentProviderPresentationProps {
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  
  // Data hooks
  agentData: UseAgentDataReturn;
  agentForm: UseAgentFormReturn;
  testConnection: UseTestConnectionReturn;
  imageHandling: UseImageHandlingReturn;
  
  // UI state hooks
  tabsState: UseAgentTabsReturn;
  filtersState: UseAgentFiltersReturn;
  
  // Action handlers
  onSave: () => void;
  onTestConnection: () => void;
}

/**
 * AGENT PROVIDER PRESENTATION - FASE 4 REFATORAÇÃO
 * 
 * Presentation Component seguindo padrão Container/Presentational
 * Responsabilidade única: Renderizar UI pura sem lógica de negócio
 * 
 * Antes: UI misturada com lógica no componente de 1.847 linhas
 * Depois: Apresentação pura focada apenas em renderização
 */
export function AgentProviderPresentation({
  selectedAgent,
  onAgentSelect,
  agentData,
  agentForm,
  testConnection,
  imageHandling,
  tabsState,
  filtersState,
  onSave,
  onTestConnection
}: AgentProviderPresentationProps) {

  return (
    <div className="container mx-auto py-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações de Provedores</h1>
            <p className="text-gray-600">Gerencie provedores de IA e configurações de agentes</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs 
        value={tabsState.tabState.activeTab} 
        onValueChange={(value) => tabsState.setActiveTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Provedores e Agentes</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge-base" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Base de Conhecimento</span>
          </TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6 mt-6">
          {/* Provider Status */}
          <ProviderStatusCard 
            status={agentData.status}
            isLoading={agentData.isLoadingStatus}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Agent List */}
            <div className="lg:col-span-1">
              <AgentListCard
                agents={agentData.agents}
                selectedAgent={selectedAgent}
                filters={filtersState.agentFilters}
                isLoading={agentData.isLoadingAgents}
                onAgentSelect={onAgentSelect}
                onFiltersChange={filtersState.updateAgentFilters}
              />
            </div>

            {/* Right Column - Configuration and Test */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agent Configuration */}
              <AgentConfigurationCard
                selectedAgent={selectedAgent}
                formData={agentForm.formData}
                models={agentData.models}
                collections={agentData.collections}
                isLoading={agentData.isLoadingModels}
                onFormDataUpdate={agentForm.updateFormData}
                onSave={onSave}
              />

              {/* Test Connection */}
              {selectedAgent && (
                <TestConnectionCard
                  formData={agentForm.formData}
                  testState={testConnection.testState}
                  imageState={imageHandling.imageState}
                  onTestStateUpdate={testConnection.updateTestState}
                  onImageUpload={imageHandling.handleImageUpload}
                  onRemoveImage={imageHandling.removeImage}
                  onClearImages={imageHandling.clearImages}
                  onRunTest={onTestConnection}
                  isLoading={testConnection.isLoading}
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-6 mt-6">
          <KnowledgeBaseTab
            collections={agentData.collections}
            isLoading={agentData.isLoadingCollections}
          />
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {tabsState.tabState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Carregando...</p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {tabsState.tabState.hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-yellow-800">
            Você tem alterações não salvas. Lembre-se de salvá-las antes de sair.
          </p>
        </div>
      )}
    </div>
  );
}
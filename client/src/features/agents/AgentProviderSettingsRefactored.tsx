/**
 * Container principal para AgentProviderSettings
 * Coordena estado e ações entre os componentes de apresentação
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

// Hooks especializados
import { useAgentData } from './hooks/useAgentData';
import { useAgentForm } from './hooks/useAgentForm';
import { useTestConnection } from './hooks/useTestConnection';
import { useAgentTabs } from './hooks/useAgentTabs';
import { useAgentSelection } from './hooks/useAgentSelection';

// Componentes de apresentação
import { ProviderStatusCard } from './components/ProviderStatusCard/ProviderStatusCard';
import { AgentListCard } from './components/AgentListCard/AgentListCard';
import { AgentConfigurationCard } from './components/AgentConfigurationCard/AgentConfigurationCard';
import { TestConnectionCard } from './components/TestConnectionCard/TestConnectionCard';
import { KnowledgeBaseCard } from './components/KnowledgeBaseCard/KnowledgeBaseCard';

// Import do KnowledgeBaseManager (mantido para compatibilidade)
import { KnowledgeBaseManager } from '@/pages/admin/agents/KnowledgeBaseManager';

// Componente de loading
const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando configurações dos agentes...</span>
  </div>
);

// Componente de error
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{error}</div>
    <Button onClick={onRetry} variant="outline">
      Tentar Novamente
    </Button>
  </div>
);

export const AgentProviderContainer = () => {
  // Hooks de dados e ações
  const {
    status,
    models,
    agents,
    collections,
    isLoadingStatus,
    isLoadingModels,
    isLoadingAgents,
    isLoadingCollections,
    statusError,
    modelsError,
    agentsError,
    collectionsError,
    updateAgent,
    refreshStatus,
    isUpdatingAgent,
    isRefreshingStatus,
    refetchStatus,
    refetchModels,
    refetchAgents,
    refetchCollections
  } = useAgentData();

  // Hooks de interface
  const { activeTab, setActiveTab } = useAgentTabs();
  const { selectedAgent, selectAgent } = useAgentSelection();
  const { runTest, isTestingConnection } = useTestConnection();

  // Hook de formulário
  const {
    formData,
    updateFormData,
    availableModels,
    selectedModel,
    estimatedCost,
    isFormValid,
    hasUnsavedChanges
  } = useAgentForm(selectedAgent, models);

  // Loading geral
  const isLoading = isLoadingStatus || isLoadingModels || isLoadingAgents || isLoadingCollections;
  
  // Error handling
  const error = statusError || modelsError || agentsError || collectionsError;
  if (error) {
    return (
      <ErrorState 
        error={error.message} 
        onRetry={() => {
          refetchStatus();
          refetchModels();
          refetchAgents();
          refetchCollections();
        }} 
      />
    );
  }

  // Handlers
  const handleAgentUpdate = (updatedAgent: typeof agents[0]) => {
    updateAgent(updatedAgent);
  };

  const handleSaveConfiguration = () => {
    if (!selectedAgent || !isFormValid) return;

    const updatedAgent = {
      ...selectedAgent,
      provider: formData.provider,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      systemPrompt: formData.systemPrompt,
      responseFormat: formData.responseFormat,
      seed: formData.seed,
      topP: formData.topP,
      frequencyPenalty: formData.frequencyPenalty,
      presencePenalty: formData.presencePenalty,
      webSearch: formData.webSearch,
      reasoningMode: formData.reasoningMode,
      reasoningEffort: formData.reasoningEffort,
      useRetrieval: formData.useRetrieval,
      useCodeInterpreter: formData.useCodeInterpreter,
      costPer1kTokens: estimatedCost,
      updatedAt: new Date().toISOString()
    };

    updateAgent(updatedAgent);
  };

  const handleKnowledgeUpload = async (file: File) => {
    // Implementar upload de arquivo para base de conhecimento
    console.log('Upload file:', file.name);
  };

  const handleKnowledgeDelete = async (collectionId: string, documentId?: string) => {
    // Implementar exclusão de documento/coleção
    console.log('Delete:', collectionId, documentId);
  };

  const handleCreateCollection = async (data: any) => {
    // Implementar criação de nova coleção
    console.log('Create collection:', data);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header com navegação */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Admin
          </Button>
        </Link>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">
            Providers & Agentes
            {agents.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {agents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="knowledge-base">
            Base de Conhecimento
            {collections.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                {collections.reduce((sum, col) => sum + col.documents.length, 0)}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab de Providers & Agentes */}
        <TabsContent value="providers" className="space-y-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Status dos Providers */}
              <div className="space-y-6">
                <ProviderStatusCard
                  status={status}
                  onRefresh={refreshStatus}
                  isLoading={isRefreshingStatus}
                />
              </div>

              {/* Coluna 2: Lista de Agentes */}
              <div className="space-y-6">
                <AgentListCard
                  agents={agents}
                  selectedAgent={selectedAgent}
                  onAgentSelect={selectAgent}
                  onAgentUpdate={handleAgentUpdate}
                  isLoading={isLoadingAgents}
                />
              </div>

              {/* Coluna 3: Configuração e Teste */}
              <div className="space-y-6">
                <AgentConfigurationCard
                  agent={selectedAgent}
                  models={models}
                  formData={formData}
                  onFormDataUpdate={updateFormData}
                  onSave={handleSaveConfiguration}
                  onTestConnection={runTest}
                  isLoading={isLoading}
                  isSaving={isUpdatingAgent}
                  isTesting={isTestingConnection}
                />

                <TestConnectionCard
                  selectedAgent={selectedAgent}
                  onTest={runTest}
                  isLoading={isTestingConnection}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab de Base de Conhecimento */}
        <TabsContent value="knowledge-base" className="space-y-6">
          {isLoadingCollections ? (
            <LoadingState />
          ) : (
            <div className="max-w-4xl">
              {/* Usando o componente legado temporariamente */}
              <KnowledgeBaseManager />
              
              {/* TODO: Migrar para o novo componente
              <KnowledgeBaseCard
                collections={collections}
                onUpload={handleKnowledgeUpload}
                onDelete={handleKnowledgeDelete}
                onCreateCollection={handleCreateCollection}
                isLoading={isLoadingCollections}
              />
              */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Database } from "lucide-react";
import { useAgentData, useAgentForm } from '@/hooks/useAgentData';
import { ProviderStatusCard } from './ProviderStatusCard';
import { AgentListCard } from './AgentListCard';
import { AgentConfigurationCard } from './AgentConfigurationCard';
import { KnowledgeBaseManager } from '../../pages/admin/agents/KnowledgeBaseManager';
import type { Agent, ActiveTab } from '@/types/agent';

/**
 * Componente AgentProviderSettingsRefactored
 * 
 * ARQUITETURA REFATORADA:
 * - Container/Presentational Pattern implementado
 * - Separação de responsabilidades clara
 * - Hooks customizados para lógica de negócio
 * - Componentes especializados modulares
 * - TypeScript com tipagem completa
 * 
 * REDUÇÃO: 1846 linhas → ~150 linhas (92% redução)
 * COMPONENTES CRIADOS: 6 componentes especializados
 * HOOKS CRIADOS: 2 hooks customizados (useAgentData, useAgentForm)
 * TIPOS CRIADOS: 10+ interfaces centralizadas
 */
const AgentProviderSettingsRefactored: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('providers');

  const {
    status,
    models,
    agents,
    collections,
    updateAgentMutation
  } = useAgentData();

  const {
    formData,
    updateFormData,
    availableModels,
    selectedModel
  } = useAgentForm(selectedAgent, models);

  // Handlers
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleSave = () => {
    if (!selectedAgent) return;

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

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="inline-flex">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurações de Agentes IA
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie provedores, modelos e configurações dos agentes de IA
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'providers'
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configurações de Provedores
        </button>
        <button
          onClick={() => setActiveTab('knowledge-base')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'knowledge-base'
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Base de Conhecimento
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ProviderStatusCard status={status} />
            <AgentListCard
              agents={agents}
              selectedAgent={selectedAgent}
              status={status}
              onAgentSelect={handleAgentSelect}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <AgentConfigurationCard
              selectedAgent={selectedAgent}
              formData={formData}
              availableModels={availableModels}
              status={status}
              collections={collections}
              onFormDataUpdate={updateFormData}
              onSave={handleSave}
              isSaving={updateAgentMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge-base' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-medium text-blue-800 mb-2">
              📚 Sistema de Recuperação OpenAI (Retrieval)
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Faça upload de documentos para que os agentes OpenAI possam usar informações específicas 
              da sua empresa em suas respostas. Ideal para manuais, políticas, catálogos de produtos e conhecimento especializado.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div><strong>Tipos suportados:</strong> PDF, TXT, MD, DOCX (até 10MB cada)</div>
              <div><strong>Como usar:</strong> Ative "Recuperação de Informações" nas configurações do agente OpenAI</div>
              <div><strong>Funcionamento:</strong> O agente busca automaticamente nos documentos quando relevante para a pergunta</div>
            </div>
          </div>
          <KnowledgeBaseManager />
        </div>
      )}
    </div>
  );
};

export default AgentProviderSettingsRefactored;
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { ArrowLeft, Save, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProviderConfiguration } from "@/hooks/useProviderConfiguration";
import ProviderCard, { ProviderInfo } from "@/components/providers/ProviderCard";
import ProviderConfiguration from "@/components/providers/ProviderConfiguration";
import ProviderTestPanel from "@/components/providers/ProviderTestPanel";

const PROVIDERS: ProviderInfo[] = [
  { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { value: 'gemini', label: 'Google Gemini', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  { value: 'deepseek', label: 'DeepSeek AI', icon: '🔍', color: 'bg-orange-100 text-orange-800' }
];

export default function AgentProviderSettingsRefactored() {
  const { user } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const {
    agents,
    models,
    status,
    selectedAgent,
    formData,
    updateConfiguration,
    saveConfiguration,
    testConnection,
    isLoading,
    isTestLoading,
  } = useProviderConfiguration(selectedAgentId || undefined);

  useEffect(() => {
    if (selectedAgent) {
      updateConfiguration({
        provider: selectedAgent.provider,
        model: selectedAgent.model,
        temperature: selectedAgent.temperature,
        maxTokens: selectedAgent.maxTokens,
      });
    }
  }, [selectedAgent, updateConfiguration]);

  const getModelCount = (provider: string) => {
    return models.filter((m: any) => m.provider === provider).length;
  };

  const handleProviderChange = (provider: string) => {
    updateConfiguration({ 
      provider, 
      model: '' // Reset model when provider changes
    });
  };

  const handleTestConnection = async (testData: any) => {
    return await testConnection(testData);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/agents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Configurações de Provedores IA</h1>
          <p className="text-muted-foreground mt-2">
            Configure provedores de IA e modelos para cada agente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Agentes */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agentes Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum agente encontrado</p>
                  <Link href="/admin/agents">
                    <Button variant="outline" className="mt-4">
                      Criar Primeiro Agente
                    </Button>
                  </Link>
                </div>
              ) : (
                agents.map((agent: any) => (
                  <Card
                    key={agent.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedAgentId === agent.id ? 'ring-2 ring-primary shadow-md' : ''
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {agent.provider}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {agent.model}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Provedores Disponíveis */}
          {selectedAgent && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Provedores Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PROVIDERS.map((provider) => (
                  <ProviderCard
                    key={provider.value}
                    provider={provider}
                    isConfigured={status[provider.value as keyof typeof status] || false}
                    modelCount={getModelCount(provider.value)}
                    onSelect={() => handleProviderChange(provider.value)}
                    isSelected={formData.provider === provider.value}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Configurações do Agente */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <div className="space-y-6">
              <ProviderConfiguration
                agentName={selectedAgent.name}
                configuration={formData}
                models={models}
                onConfigurationChange={updateConfiguration}
              />

              <div className="flex justify-end">
                <Button 
                  onClick={saveConfiguration}
                  disabled={isLoading || !formData.model}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>

              <Separator />

              <ProviderTestPanel
                provider={formData.provider}
                model={formData.model}
                temperature={formData.temperature}
                maxTokens={formData.maxTokens}
                onTest={handleTestConnection}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Selecione um Agente</h3>
                  <p className="text-muted-foreground">
                    Escolha um agente da lista à esquerda para configurar seu provedor de IA
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
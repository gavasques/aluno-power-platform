import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Eye, ArrowRight, Layers, GitBranch } from "lucide-react";
import AgentStepsConfig from "@/components/agents/AgentStepsConfig";

export default function AgentStepsConfigPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // Fetch available agents with caching
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const selectedAgent = agents?.find((agent: any) => agent.id === selectedAgentId);

  // Fetch step configuration for selected agent with caching
  const { data: agentSteps } = useQuery({
    queryKey: ['/api/agent-steps', selectedAgentId],
    enabled: !!selectedAgentId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const getStepStatus = (agentId: string) => {
    // For now, return basic status - could be enhanced later
    return {
      agentId,
      isMultiStep: false,
      stepCount: 0
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração Multi-Etapas</h1>
          <p className="text-muted-foreground">
            Configure processamento sequencial com diferentes providers AI
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          <Layers className="h-4 w-4 mr-2" />
          Sistema Multi-Step
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Selection Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Agentes AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agentsLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              agents?.map((agent: any) => {
              const status = getStepStatus(agent.id);
              return (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAgentId === agent.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {status?.isMultiStep ? (
                        <Badge variant="secondary" className="text-xs">
                          {status.stepCount} etapas
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Simples
                        </Badge>
                      )}
                      <Badge 
                        variant={agent.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {agent.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </CardContent>
        </Card>

        {/* Configuration Area */}
        <div className="lg:col-span-3">
          {selectedAgentId ? (
            <AgentStepsConfig
              agentId={selectedAgentId}
              agentName={selectedAgent?.name || "Agente"}
              existingSteps={agentSteps}
            />
          ) : (
            <Card className="h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Selecione um Agente</h3>
                    <p className="text-muted-foreground">
                      Escolha um agente AI para configurar as etapas de processamento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Como Funciona o Sistema Multi-Etapas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold">Etapa 1: Análise</h4>
              <p className="text-sm text-muted-foreground">
                Claude analisa arquivos CSV com avaliações de concorrentes
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold">Etapa 2: Avaliação</h4>
              <p className="text-sm text-muted-foreground">
                GPT-4.1 avalia os resultados e gera títulos otimizados
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold">Etapa 3: Imagem</h4>
              <p className="text-sm text-muted-foreground">
                Image-1 gera imagens baseadas no conteúdo otimizado
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-900">Vantagens do Sistema Multi-Etapas</h5>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Cada etapa pode usar o provider AI mais adequado</li>
                  <li>• Processamento sequencial para melhor qualidade</li>
                  <li>• Flexibilidade para configurar até 5 etapas</li>
                  <li>• Compatibilidade total com agentes existentes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
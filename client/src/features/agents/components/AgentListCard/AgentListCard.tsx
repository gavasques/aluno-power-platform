/**
 * Componente de apresentação para lista de agentes
 * Exibe todos os agentes disponíveis com seleção
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Settings, DollarSign } from "lucide-react";
import { getProviderInfo, formatCost } from '../../types/agent.types';
import type { AgentListProps } from '../../types/agent.types';

export const AgentListCard = ({ 
  agents, 
  selectedAgent, 
  onAgentSelect, 
  onAgentUpdate,
  isLoading = false 
}: AgentListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agentes Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggleActive = async (agent: typeof agents[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedAgent = { ...agent, isActive: !agent.isActive };
    onAgentUpdate(updatedAgent);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Agentes Disponíveis
          <Badge variant="secondary">{agents.length}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agente encontrado
            </h3>
            <p className="text-gray-600 text-sm">
              Verifique a configuração dos agentes no sistema.
            </p>
          </div>
        ) : (
          agents.map((agent) => {
            const providerInfo = getProviderInfo(agent.provider);
            const isSelected = selectedAgent?.id === agent.id;
            
            return (
              <div
                key={agent.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onAgentSelect(agent)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {agent.name}
                      </h3>
                      <Badge 
                        variant={agent.isActive ? "secondary" : "outline"}
                        className={`text-xs ${
                          agent.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {agent.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {agent.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {providerInfo && (
                        <div className="flex items-center space-x-1">
                          <span>{providerInfo.icon}</span>
                          <span>{providerInfo.label}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Settings className="w-3 h-3" />
                        <span>{agent.model}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatCost(agent.costPer1kTokens)}/1k tokens</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleActive(agent, e)}
                      className="h-6 px-2 text-xs"
                    >
                      {agent.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    
                    {isSelected && (
                      <div className="text-xs text-blue-600 font-medium">
                        Selecionado
                      </div>
                    )}
                  </div>
                </div>

                {/* Configurações avançadas (preview) */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Temperatura:</span>
                        <span className="ml-1 font-medium">{agent.temperature}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Tokens:</span>
                        <span className="ml-1 font-medium">{agent.maxTokens}</span>
                      </div>
                      {agent.webSearch && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">
                            🌐 Web Search
                          </Badge>
                        </div>
                      )}
                      {agent.useRetrieval && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">
                            📚 Retrieval
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
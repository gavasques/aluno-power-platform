import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import type { Agent, ProviderStatus } from '@/types/agent';
import { PROVIDERS } from '@/types/agent';

interface AgentListCardProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  status: ProviderStatus;
  onAgentSelect: (agent: Agent) => void;
}

export const AgentListCard: React.FC<AgentListCardProps> = ({
  agents,
  selectedAgent,
  status,
  onAgentSelect
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Agentes Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onAgentSelect(agent)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAgent?.id === agent.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {PROVIDERS.find(p => p.value === agent.provider)?.label} • {agent.model}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">Temperatura: {agent.temperature}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    status[agent.provider as keyof ProviderStatus] 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {status[agent.provider as keyof ProviderStatus] ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
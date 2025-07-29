import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Search, Filter } from 'lucide-react';
import { PROVIDERS, AGENT_STATUS_OPTIONS } from '../types';
import type { AgentListCardProps } from '../types';

/**
 * AGENT LIST CARD - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para lista de agentes
 * Responsabilidade única: Exibir lista filtrada de agentes com seleção
 */
export function AgentListCard({
  agents,
  selectedAgent,
  filters,
  isLoading,
  onAgentSelect,
  onFiltersChange
}: AgentListCardProps) {

  // Filter agents based on current filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !filters.search || 
      agent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      agent.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesProvider = !filters.provider || agent.provider === filters.provider;
    
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && agent.isActive) ||
      (filters.status === 'inactive' && !agent.isActive);

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getProviderInfo = (providerValue: string) => {
    return PROVIDERS.find(p => p.value === providerValue) || {
      label: providerValue,
      icon: '🤖',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-3 bg-gray-100 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Agentes ({agents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar agentes..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.provider}
              onChange={(e) => onFiltersChange({ provider: e.target.value })}
            >
              <option value="">Todos provedores</option>
              {PROVIDERS.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as any })}
            >
              {AGENT_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {(filters.search || filters.provider || filters.status !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ search: '', provider: '', status: 'all' })}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Agent List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {agents.length === 0 ? 'Nenhum agente encontrado' : 'Nenhum agente corresponde aos filtros'}
              </h3>
              <p className="text-gray-600">
                {agents.length === 0 
                  ? 'Não há agentes cadastrados no sistema'
                  : 'Tente ajustar os filtros para encontrar agentes'}
              </p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const providerInfo = getProviderInfo(agent.provider);
              const isSelected = selectedAgent?.id === agent.id;
              
              return (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => onAgentSelect(agent)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {agent.name}
                        </h3>
                        {agent.isActive ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm truncate mb-2 ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={providerInfo.color} variant="outline">
                          <span className="mr-1">{providerInfo.icon}</span>
                          {providerInfo.label}
                        </Badge>
                        
                        <div className="text-xs text-gray-500">
                          {agent.model}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredAgents.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {filteredAgents.length}
                </div>
                <div className="text-xs text-gray-600">Mostrando</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {filteredAgents.filter(a => a.isActive).length}
                </div>
                <div className="text-xs text-gray-600">Ativos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {filteredAgents.filter(a => !a.isActive).length}
                </div>
                <div className="text-xs text-gray-600">Inativos</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
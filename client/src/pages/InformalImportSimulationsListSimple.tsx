import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Simplified version of InformalImportSimulationsList for debugging
 */
const InformalImportSimulationsListSimple: React.FC = () => {
  const [, setLocation] = useLocation();

  // Simple query without complex logic - FIXED
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['simulations-import-simple'],
    queryFn: async () => {
      const response = await apiRequest('/api/simulations/import');
      return response;
    },
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Extract simulations data
  const simulations = Array.isArray(data?.data) ? data.data : [];
  const simulationCount = simulations.length;

  // Check if we actually have finished loading
  const actuallyLoading = isLoading || isFetching;
  const hasFinishedLoading = !actuallyLoading && data;

  console.log('INFORMAL - Debug info:', {
    data, 
    isLoading, 
    isFetching,
    actuallyLoading,
    hasFinishedLoading,
    error, 
    simulations, 
    simulationCount,
    hasData: !!data,
    hasSimulations: simulations.length > 0
  });

  const handleNewSimulation = () => {
    setLocation('/simuladores/importacao-simplificada/nova');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulações de Importação Simplificada</h1>
          <p className="text-muted-foreground mt-2">
            Versão simplificada para diagnóstico - {simulationCount} simulações encontradas
          </p>
        </div>
        <Button onClick={handleNewSimulation} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Simulação
        </Button>
      </div>

      {/* Debug Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="text-sm">
            <div><strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}</div>
            <div><strong>Error:</strong> {error ? String(error) : 'Nenhum'}</div>
            <div><strong>Data:</strong> {data ? 'Recebida' : 'Null'}</div>
            <div><strong>Simulações:</strong> {simulationCount}</div>
          </div>
        </CardContent>
      </Card>



      {/* Content Area - Always Show */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Simulações Encontradas ({simulationCount})
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {actuallyLoading && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Carregando simulações...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !actuallyLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar</h3>
              <p className="text-red-600">{error?.message || 'Erro desconhecido'}</p>
            </CardContent>
          </Card>
        )}

        {/* Success State - Show Empty */}
        {hasFinishedLoading && simulationCount === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma simulação encontrada</h3>
              <p className="text-gray-600 mb-4">Comece criando sua primeira simulação de importação.</p>
              <Button onClick={handleNewSimulation}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Simulação
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success State - Show List */}
        {hasFinishedLoading && simulationCount > 0 && (
          <div className="space-y-4">
            {simulations.map((simulation: any, index: number) => (
              <Card key={simulation.id || index} className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-green-800">
                        {simulation?.nomeSimulacao || `Simulação ${simulation?.id || index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <strong>Fornecedor:</strong> {simulation?.nomeFornecedor || 'Não informado'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Criado:</strong> {formatDate(simulation.dataCreated)}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Código:</strong> {simulation.codigoSimulacao || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm text-gray-500">
                        <strong>ID:</strong> {simulation.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Produtos:</strong> {simulation.produtos?.length || 0}
                      </div>
                      <div className="text-xs text-green-600 font-semibold">
                        ✓ CARREGADO
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InformalImportSimulationsListSimple;
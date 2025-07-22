import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Calendar } from 'lucide-react';

export default function FormalImportSimulationsListSimple() {
  const [, setLocation] = useLocation();

  // Fetch simulations with detailed debugging
  const { data: simulations = [], isLoading, error, isError } = useQuery<any[]>({
    queryKey: ['/api/simulators/formal-import'],
    staleTime: 0, // No cache for testing
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log('🚀 QUERY: Starting API call to /api/simulators/formal-import');
      const token = localStorage.getItem('auth_token');
      console.log('🔑 TOKEN:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/simulators/formal-import', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      console.log('📡 RESPONSE Status:', response.status);
      console.log('📡 RESPONSE OK:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Success - Data received:', data?.length || 0, 'items');
      return data;
    },
    onError: (error: any) => {
      console.error('❌ Query Error:', error);
    },
    onSuccess: (data: any) => {
      console.log('✅ Query Success:', data?.length || 0, 'simulations loaded');
    }
  });

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch {
      return 'R$ 0,00';
    }
  };

  console.log('🔍 Component state:', { 
    isLoading, 
    isError,
    error: error?.message || null, 
    simulationsCount: simulations?.length,
    hasToken: !!localStorage.getItem('auth_token')
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando simulações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao Carregar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar as simulações.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Importação Formal Direta
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas simulações de importação formal
          </p>
        </div>
        <Button 
          onClick={() => setLocation('/simuladores/importacao-formal-direta/nova')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Simulação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Simulações</p>
                <p className="text-2xl font-bold text-gray-900">{simulations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {simulations.filter((s: any) => s.status === 'Concluída').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {simulations.filter((s: any) => s.status === 'Em andamento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulations List */}
      <Card>
        <CardHeader>
          <CardTitle>Simulações</CardTitle>
        </CardHeader>
        <CardContent>
          {simulations.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma simulação encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira simulação de importação formal.
              </p>
              <Button 
                onClick={() => setLocation('/simuladores/importacao-formal-direta/nova')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Simulação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((simulation: any) => (
                <div 
                  key={simulation.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setLocation(`/simuladores/importacao-formal-direta/nova?id=${simulation.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{simulation.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Fornecedor: {simulation.fornecedor || 'Não informado'}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span>Criada em: {formatDate(simulation.dataCriacao)}</span>
                        <span>Valor FOB: {formatCurrency(simulation.valorFobDolar || 0)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        simulation.status === 'Concluída' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {simulation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
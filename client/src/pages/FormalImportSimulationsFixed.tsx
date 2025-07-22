import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, DollarSignIcon, TruckIcon, UserIcon, FileTextIcon, PlusIcon, EditIcon } from 'lucide-react';

interface Simulation {
  id: number;
  nome: string;
  dataCriacao: string;
  dataModificacao: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  dados?: any;
}

export default function FormalImportSimulationsFixed() {
  const [, setLocation] = useLocation();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        console.log('🚀 FIXED: Starting fetch...');
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        console.log('🔑 FIXED: Token', token ? 'found' : 'missing');

        const response = await fetch('/api/simulators/formal-import', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        console.log('📡 FIXED: Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ FIXED: Data received:', data);
        console.log('✅ FIXED: Count:', data?.length || 0);

        setSimulations(data || []);
        setIsLoading(false);

        console.log('🎉 FIXED: State updated successfully!');
      } catch (err: any) {
        console.error('❌ FIXED: Error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  console.log('🔍 FIXED: Component render state:', {
    isLoading,
    error,
    simulationsCount: simulations.length,
    hasSimulations: simulations.length > 0
  });

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: any) => {
    if (!value || isNaN(Number(value))) return 'R$ 0,00';
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
    } catch {
      return 'R$ 0,00';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluído':
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando simulações...</p>
          <p className="text-sm text-gray-500 mt-2">FIXED VERSION - Debugging active</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulações de Importação</h1>
          <p className="text-gray-600 mt-2">Gestão das suas simulações de importação formal</p>
          <p className="text-xs text-green-600 mt-1">✅ FIXED VERSION - {simulations.length} simulações carregadas</p>
        </div>
        <Button 
          onClick={() => setLocation('/simuladores/importacao-formal-direta/nova')}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Nova Simulação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Simulações</p>
                <p className="text-2xl font-bold text-gray-900">{simulations.length}</p>
              </div>
              <FileTextIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {simulations.filter(s => s.status?.toLowerCase().includes('conclu')).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {simulations.filter(s => s.status?.toLowerCase().includes('andamento')).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulations List */}
      {simulations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma simulação encontrada</h3>
            <p className="text-gray-500 mb-6">Comece criando sua primeira simulação de importação formal.</p>
            <Button 
              onClick={() => setLocation('/simuladores/importacao-formal-direta/nova')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Primeira Simulação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {simulations.map((simulation) => (
            <Card key={simulation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{simulation.nome}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="outline" className={getStatusColor(simulation.status)}>
                        {simulation.status || 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/simuladores/importacao-formal-direta/editar/${simulation.id}`)}
                  >
                    <EditIcon className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Criado: {formatDate(simulation.dataCriacao)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>Fornecedor: {simulation.fornecedor || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TruckIcon className="h-4 w-4" />
                    <span>Despachante: {simulation.despachante || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSignIcon className="h-4 w-4" />
                    <span>Valor: {formatCurrency(simulation.dados?.valorTotal)}</span>
                  </div>
                </div>
                
                {simulation.dados?.observacoes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{simulation.dados.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
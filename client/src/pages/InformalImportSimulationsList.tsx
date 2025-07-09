import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Search, Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface InformalImportSimulation {
  id: number;
  nomeSimulacao: string;
  nomeFornecedor?: string;
  observacoes?: string;
  dataCriacao: string;
  dataModificacao: string;
  configuracoesGerais: {
    taxa_cambio_usd_brl: number;
    valor_fob_total_usd?: number;
  };
  produtos: Array<{
    descricao_produto: string;
    quantidade: number;
    valor_unitario_usd: number;
  }>;
}

const InformalImportSimulationsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch simulations
  const { data: simulations = [], isLoading, error } = useQuery<InformalImportSimulation[]>({
    queryKey: ['/api/simulations/import'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log results
  if (error) {
    console.error('❌ FRONTEND - Erro ao carregar simulações de importação simplificada:', error);
  }
  if (simulations.length > 0) {
    console.log('✅ FRONTEND - Simulações de importação simplificada carregadas:', simulations.length);
  }

  // Delete simulation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/simulations/import/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação excluída",
        description: "A simulação foi excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro ao excluir a simulação",
        variant: "destructive",
      });
    }
  });

  // Duplicate simulation mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/simulations/import/${id}/duplicate`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação duplicada",
        description: "A simulação foi duplicada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulations/import'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao duplicar",
        description: error.message || "Erro ao duplicar a simulação",
        variant: "destructive",
      });
    }
  });

  // Filter simulations based on search term
  const filteredSimulations = simulations.filter(sim => 
    sim.nomeSimulacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sim.nomeFornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ''
  );

  // Calculate total value for a simulation
  const calculateTotalValue = (simulation: InformalImportSimulation) => {
    const totalFobUsd = simulation.produtos?.reduce((sum, produto) => 
      sum + (produto.quantidade * produto.valor_unitario_usd), 0) || 0;
    return totalFobUsd * (simulation.configuracoesGerais?.taxa_cambio_usd_brl || 5.2);
  };

  const handleEdit = (simulation: InformalImportSimulation) => {
    // Navigate to simulator with simulation ID
    setLocation(`/simuladores/importacao-simplificada/nova?id=${simulation.id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta simulação?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id);
  };

  const handleNewSimulation = () => {
    setLocation('/simuladores/importacao-simplificada/nova');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar simulações</h2>
          <p className="text-gray-600">
            Ocorreu um erro ao carregar as simulações. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulações de Importação Simplificada</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas simulações de custo de importação simplificada
          </p>
        </div>
        <Button onClick={handleNewSimulation} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Simulação
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome da simulação ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="recent">Recentes</SelectItem>
            <SelectItem value="old">Antigas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Simulações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Simulado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                simulations.reduce((total, sim) => total + calculateTotalValue(sim), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Simulados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations.reduce((total, sim) => total + (sim.produtos?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando simulações...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSimulations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma simulação encontrada</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Nenhuma simulação corresponde aos seus critérios de busca.' : 'Comece criando sua primeira simulação de importação.'}
          </p>
          <Button onClick={handleNewSimulation} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Simulação
          </Button>
        </div>
      )}

      {/* Simulations List */}
      {!isLoading && filteredSimulations.length > 0 && (
        <div className="grid gap-4">
          {filteredSimulations.map((simulation) => (
            <Card key={simulation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{simulation.nomeSimulacao}</h3>
                      <Badge variant="secondary">ID: {simulation.id}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fornecedor:</span> {simulation.nomeFornecedor || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Produtos:</span> {simulation.produtos?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Valor Total:</span> {formatCurrency(calculateTotalValue(simulation))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Criado:</span> {formatDate(simulation.dataCriacao)}
                      </div>
                      <div>
                        <span className="font-medium">Modificado:</span> {formatDate(simulation.dataModificacao)}
                      </div>
                    </div>

                    {simulation.observacoes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Observações:</span> {simulation.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(simulation)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(simulation.id)}
                      disabled={duplicateMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(simulation.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InformalImportSimulationsList;
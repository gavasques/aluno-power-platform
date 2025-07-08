import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Copy, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

interface FormalImportSimulation {
  id: number;
  nome: string;
  codigoSimulacao: string;
  fornecedor: string;
  despachante: string;
  agenteCargas: string;
  status: string;
  taxaDolar: number;
  valorFobDolar: number;
  valorFreteDolar: number;
  percentualSeguro: number;
  impostos: any[];
  despesasAdicionais: any[];
  produtos: any[];
  resultados: any;
  dataCriacao: string;
  dataModificacao: string;
}

const FormalImportSimulationsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch simulations
  const { data: simulations = [], isLoading, error } = useQuery<FormalImportSimulation[]>({
    queryKey: ['/api/simulators/formal-import'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      console.error('❌ FRONTEND - Erro ao carregar simulações:', error);
    },
    onSuccess: (data) => {
      console.log('✅ FRONTEND - Simulações carregadas:', data?.length || 0);
    }
  });

  // Delete simulation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/simulators/formal-import/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação excluída",
        description: "A simulação foi excluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro ao excluir a simulação",
        variant: "destructive",
      });
    },
  });

  // Duplicate simulation mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/simulators/formal-import/${id}/duplicate`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulação duplicada",
        description: "A simulação foi duplicada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/simulators/formal-import'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao duplicar",
        description: error.message || "Erro ao duplicar a simulação",
        variant: "destructive",
      });
    },
  });

  // Filter simulations
  const filteredSimulations = simulations.filter(simulation => {
    const matchesSearch = simulation.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          simulation.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          simulation.codigoSimulacao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || simulation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pausado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Calculate total values
  const calculateTotalValue = (simulation: FormalImportSimulation) => {
    const fobReal = simulation.valorFobDolar * simulation.taxaDolar;
    const freteReal = simulation.valorFreteDolar * simulation.taxaDolar;
    const despesasTotal = simulation.despesasAdicionais?.reduce((sum, despesa) => sum + despesa.valorReal, 0) || 0;
    return fobReal + freteReal + despesasTotal;
  };

  const handleEdit = (simulation: FormalImportSimulation) => {
    // Navigate to simulator with simulation ID
    setLocation(`/simuladores/importacao-formal-direta/nova?id=${simulation.id}`);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate(id);
  };

  const handleNewSimulation = () => {
    setLocation('/simuladores/importacao-formal-direta/nova');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando simulações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar simulações. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Simulações de Importação Formal</h1>
          <p className="text-gray-600 mt-2">Gerencie suas simulações de importação formal</p>
        </div>
        <Button onClick={handleNewSimulation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Simulação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations.filter(s => s.status === 'Em andamento').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations.filter(s => s.status === 'Concluído').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {simulations.reduce((sum, s) => sum + calculateTotalValue(s), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, fornecedor ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'Em andamento' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('Em andamento')}
            size="sm"
          >
            Em Andamento
          </Button>
          <Button
            variant={statusFilter === 'Concluído' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('Concluído')}
            size="sm"
          >
            Concluído
          </Button>
        </div>
      </div>

      {/* Simulations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Simulações ({filteredSimulations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma simulação encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma simulação corresponde aos filtros aplicados.' 
                  : 'Você ainda não criou nenhuma simulação.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={handleNewSimulation} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Simulação
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor FOB</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Modificado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSimulations.map((simulation) => (
                  <TableRow key={simulation.id}>
                    <TableCell className="font-medium">{simulation.nome}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {simulation.codigoSimulacao}
                      </code>
                    </TableCell>
                    <TableCell>{simulation.fornecedor || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(simulation.status)}>
                        {simulation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      US$ {simulation.valorFobDolar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{simulation.produtos?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(simulation.dataModificacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(simulation)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(simulation.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 hover:text-red-700" 
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a simulação "{simulation.nome}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(simulation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormalImportSimulationsList;
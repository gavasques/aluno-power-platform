import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Receipt, Filter, Calendar } from 'lucide-react';

interface Lancamento {
  id: number;
  empresa: {
    id: number;
    razaoSocial: string;
  };
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  observacoes?: string;
  anexos?: string[];
  createdAt: string;
  updatedAt: string;
}

interface LancamentoFormData {
  empresaId: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  observacoes?: string;
}

interface Empresa {
  id: number;
  razaoSocial: string;
}

export default function LancamentosManager() {
  const { token } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [formData, setFormData] = useState<LancamentoFormData>({
    empresaId: 0,
    tipo: 'receita',
    descricao: '',
    valor: 0,
    dataVencimento: '',
    dataPagamento: '',
    status: 'pendente',
    categoria: '',
    observacoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch empresas for select options
  const { data: empresas = [] } = useQuery({
    queryKey: ['financas360-empresas'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }
      
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch lancamentos
  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ['financas360-lancamentos'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/lancamentos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar lançamentos');
      }
      
      const result = await response.json();
      return result.data;
    }
  });

  // Filter lancamentos
  const filteredLancamentos = lancamentos.filter((lancamento: Lancamento) => {
    const statusMatch = statusFilter === 'all' || lancamento.status === statusFilter;
    const tipoMatch = tipoFilter === 'all' || lancamento.tipo === tipoFilter;
    return statusMatch && tipoMatch;
  });

  // Create lancamento mutation
  const createMutation = useMutation({
    mutationFn: async (data: LancamentoFormData) => {
      const response = await fetch('/api/financas360/lancamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar lançamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Lançamento criado com sucesso!'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update lancamento mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LancamentoFormData> }) => {
      const response = await fetch(`/api/financas360/lancamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar lançamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      setIsDialogOpen(false);
      setEditingLancamento(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Lançamento atualizado com sucesso!'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete lancamento mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financas360/lancamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir lançamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-lancamentos'] });
      toast({
        title: 'Sucesso',
        description: 'Lançamento excluído com sucesso!'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      empresaId: 0,
      tipo: 'receita',
      descricao: '',
      valor: 0,
      dataVencimento: '',
      dataPagamento: '',
      status: 'pendente',
      categoria: '',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLancamento) {
      updateMutation.mutate({ id: editingLancamento.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento);
    setFormData({
      empresaId: lancamento.empresa.id,
      tipo: lancamento.tipo,
      descricao: lancamento.descricao,
      valor: lancamento.valor,
      dataVencimento: lancamento.dataVencimento.split('T')[0],
      dataPagamento: lancamento.dataPagamento ? lancamento.dataPagamento.split('T')[0] : '',
      status: lancamento.status,
      categoria: lancamento.categoria || '',
      observacoes: lancamento.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingLancamento(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      vencido: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      cancelado: 'Cancelado',
      vencido: 'Vencido'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTotalByType = (tipo: 'receita' | 'despesa') => {
    return filteredLancamentos
      .filter((l: Lancamento) => l.tipo === tipo && l.status === 'pago')
      .reduce((sum: number, l: Lancamento) => sum + l.valor, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lançamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresaId">Empresa *</Label>
                  <Select
                    value={formData.empresaId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      empresaId: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa: Empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'receita' | 'despesa') => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do lançamento"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valor: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="Categoria do lançamento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      dataVencimento: e.target.value 
                    }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dataPagamento">Data de Pagamento</Label>
                  <Input
                    id="dataPagamento"
                    type="date"
                    value={formData.dataPagamento}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      dataPagamento: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pendente' | 'pago' | 'cancelado' | 'vencido') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Receitas (Pagas)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalByType('receita'))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Despesas (Pagas)</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalByType('despesa'))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(getTotalByType('receita') - getTotalByType('despesa'))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Lançamentos */}
      <div className="space-y-4">
        {filteredLancamentos.map((lancamento: Lancamento) => (
          <Card key={lancamento.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      lancamento.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-semibold">{lancamento.descricao}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lancamento.status)}`}>
                      {getStatusLabel(lancamento.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Empresa:</span><br />
                      {lancamento.empresa.razaoSocial}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span><br />
                      <span className={`font-semibold ${
                        lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(lancamento.valor)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Vencimento:</span><br />
                      {formatDate(lancamento.dataVencimento)}
                    </div>
                    {lancamento.dataPagamento && (
                      <div>
                        <span className="font-medium">Pagamento:</span><br />
                        {formatDate(lancamento.dataPagamento)}
                      </div>
                    )}
                  </div>
                  
                  {lancamento.categoria && (
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {lancamento.categoria}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(lancamento)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(lancamento.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLancamentos.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {lancamentos.length === 0 ? 'Nenhum lançamento cadastrado' : 'Nenhum lançamento encontrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {lancamentos.length === 0 
              ? 'Comece criando seu primeiro lançamento financeiro.'
              : 'Tente ajustar os filtros para encontrar os lançamentos desejados.'
            }
          </p>
          {lancamentos.length === 0 && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
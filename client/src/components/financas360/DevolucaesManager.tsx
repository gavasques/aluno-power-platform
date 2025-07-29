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
import { Plus, Edit, Trash2, RefreshCw, Search, AlertCircle } from 'lucide-react';

interface Devolucao {
  id: number;
  notaFiscal: {
    id: number;
    serie: string;
    numero: string;
  };
  tipo: 'produto' | 'valor' | 'total';
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: 'pendente' | 'processada' | 'cancelada';
  observacoes?: string;
  itens?: {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface DevolucaoFormData {
  notaFiscalId: number;
  tipo: 'produto' | 'valor' | 'total';
  motivo: string;
  dataDevolucao: string;
  valorDevolvido: number;
  status: 'pendente' | 'processada' | 'cancelada';
  observacoes?: string;
  itens?: {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
}

interface NotaFiscal {
  id: number;
  serie: string;
  numero: string;
  valorTotal: number;
}

export default function DevolucaesManager() {
  const { token } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevolucao, setEditingDevolucao] = useState<Devolucao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<DevolucaoFormData>({
    notaFiscalId: 0,
    tipo: 'produto',
    motivo: '',
    dataDevolucao: '',
    valorDevolvido: 0,
    status: 'pendente',
    observacoes: '',
    itens: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notas fiscais (para dropdown)
  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['financas360-notas-fiscais'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/notas-fiscais', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar notas fiscais');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Fetch devoluções
  const { data: devolucoes = [], isLoading } = useQuery({
    queryKey: ['financas360-devolucoes'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/devolucoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar devoluções');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Filter devoluções
  const filteredDevolucoes = devolucoes.filter((devolucao: Devolucao) => {
    const searchMatch = devolucao.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       devolucao.notaFiscal.numero.includes(searchTerm) ||
                       devolucao.notaFiscal.serie.toLowerCase().includes(searchTerm.toLowerCase());
    
    const tipoMatch = tipoFilter === 'all' || devolucao.tipo === tipoFilter;
    const statusMatch = statusFilter === 'all' || devolucao.status === statusFilter;
    
    return searchMatch && tipoMatch && statusMatch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: DevolucaoFormData) => {
      const response = await fetch('/api/financas360/devolucoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar devolução');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-devolucoes'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Devolução criada com sucesso!'
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DevolucaoFormData> }) => {
      const response = await fetch(`/api/financas360/devolucoes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar devolução');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-devolucoes'] });
      setIsDialogOpen(false);
      setEditingDevolucao(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Devolução atualizada com sucesso!'
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financas360/devolucoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir devolução');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-devolucoes'] });
      toast({
        title: 'Sucesso',
        description: 'Devolução excluída com sucesso!'
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
      notaFiscalId: 0,
      tipo: 'produto',
      motivo: '',
      dataDevolucao: '',
      valorDevolvido: 0,
      status: 'pendente',
      observacoes: '',
      itens: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDevolucao) {
      updateMutation.mutate({ id: editingDevolucao.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (devolucao: Devolucao) => {
    setEditingDevolucao(devolucao);
    setFormData({
      notaFiscalId: devolucao.notaFiscal.id,
      tipo: devolucao.tipo,
      motivo: devolucao.motivo,
      dataDevolucao: devolucao.dataDevolucao.split('T')[0],
      valorDevolvido: devolucao.valorDevolvido,
      status: devolucao.status,
      observacoes: devolucao.observacoes || '',
      itens: devolucao.itens || []
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingDevolucao(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta devolução?')) {
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

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      produto: 'Produto',
      valor: 'Valor',
      total: 'Total'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      produto: 'bg-blue-100 text-blue-800',
      valor: 'bg-orange-100 text-orange-800',
      total: 'bg-red-100 text-red-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      processada: 'Processada',
      cancelada: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      processada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTotalByStatus = (status: string) => {
    return filteredDevolucoes
      .filter((devolucao: Devolucao) => devolucao.status === status)
      .reduce((sum: number, devolucao: Devolucao) => sum + devolucao.valorDevolvido, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando devoluções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Devoluções</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Devolução
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDevolucao ? 'Editar Devolução' : 'Nova Devolução'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notaFiscalId">Nota Fiscal *</Label>
                  <Select
                    value={formData.notaFiscalId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      notaFiscalId: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma nota fiscal" />
                    </SelectTrigger>
                    <SelectContent>
                      {notasFiscais.map((nota: NotaFiscal) => (
                        <SelectItem key={nota.id} value={nota.id.toString()}>
                          NF {nota.serie}/{nota.numero} - {formatCurrency(nota.valorTotal)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo de Devolução *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'produto' | 'valor' | 'total') => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo da Devolução *</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ex: Produto com defeito, cancelamento, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dataDevolucao">Data da Devolução *</Label>
                  <Input
                    id="dataDevolucao"
                    type="date"
                    value={formData.dataDevolucao}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      dataDevolucao: e.target.value 
                    }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valorDevolvido">Valor Devolvido *</Label>
                  <Input
                    id="valorDevolvido"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorDevolvido}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valorDevolvido: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="processada">Processada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre a devolução"
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
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(getTotalByStatus('pendente'))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Processadas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalByStatus('processada'))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalByStatus('cancelada'))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por motivo, nota fiscal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="produto">Produto</SelectItem>
            <SelectItem value="valor">Valor</SelectItem>
            <SelectItem value="total">Total</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="processada">Processada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Devoluções */}
      <div className="space-y-4">
        {filteredDevolucoes.map((devolucao: Devolucao) => (
          <Card key={devolucao.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(devolucao.tipo)}`}>
                      {getTipoLabel(devolucao.tipo)}
                    </span>
                    <h3 className="font-semibold">
                      NF {devolucao.notaFiscal.serie}/{devolucao.notaFiscal.numero}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(devolucao.status)}`}>
                      {getStatusLabel(devolucao.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Motivo:</span><br />
                      {devolucao.motivo}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span><br />
                      {formatDate(devolucao.dataDevolucao)}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span><br />
                      <span className="font-semibold text-red-600">
                        {formatCurrency(devolucao.valorDevolvido)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span><br />
                      <span className={`font-semibold ${
                        devolucao.status === 'processada' 
                          ? 'text-green-600' 
                          : devolucao.status === 'pendente'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {getStatusLabel(devolucao.status)}
                      </span>
                    </div>
                  </div>
                  
                  {devolucao.observacoes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Obs:</span> {devolucao.observacoes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(devolucao)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(devolucao.id)}
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

      {filteredDevolucoes.length === 0 && (searchTerm || tipoFilter !== 'all' || statusFilter !== 'all') && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma devolução encontrada</h3>
          <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
          <Button onClick={() => { setSearchTerm(''); setTipoFilter('all'); setStatusFilter('all'); }} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      )}

      {devolucoes.length === 0 && !searchTerm && tipoFilter === 'all' && statusFilter === 'all' && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma devolução cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira devolução.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Devolução
          </Button>
        </div>
      )}

      {filteredDevolucoes.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Importante</h3>
          </div>
          <p className="text-sm text-yellow-700">
            Devoluções processadas afetam automaticamente o fluxo de caixa e estoque. 
            Certifique-se de que todas as informações estão corretas antes de processar.
          </p>
        </div>
      )}
    </div>
  );
}
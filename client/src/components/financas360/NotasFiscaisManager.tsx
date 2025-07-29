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
import { Plus, Edit, Trash2, FileCheck, Search, Download, Upload } from 'lucide-react';

interface NotaFiscal {
  id: number;
  empresa: {
    id: number;
    razaoSocial: string;
  };
  parceiro: {
    id: number;
    nome: string;
  };
  tipo: 'entrada' | 'saida';
  serie: string;
  numero: string;
  dataEmissao: string;
  dataVencimento?: string;
  valorTotal: number;
  valorImposto: number;
  status: 'pendente' | 'processada' | 'cancelada' | 'rejeitada';
  observacoes?: string;
  anexos?: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotaFiscalFormData {
  empresaId: number;
  parceiroId: number;
  tipo: 'entrada' | 'saida';
  serie: string;
  numero: string;
  dataEmissao: string;
  dataVencimento?: string;
  valorTotal: number;
  valorImposto: number;
  status: 'pendente' | 'processada' | 'cancelada' | 'rejeitada';
  observacoes?: string;
}

interface Empresa {
  id: number;
  razaoSocial: string;
}

interface Parceiro {
  id: number;
  nome: string;
}

export default function NotasFiscaisManager() {
  const { token, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaFiscal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<NotaFiscalFormData>({
    empresaId: 0,
    parceiroId: 0,
    tipo: 'entrada',
    serie: '',
    numero: '',
    dataEmissao: '',
    dataVencimento: '',
    valorTotal: 0,
    valorImposto: 0,
    status: 'pendente',
    observacoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch empresas
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
    },
    enabled: !!token && !authLoading
  });

  // Fetch parceiros
  const { data: parceiros = [] } = useQuery({
    queryKey: ['financas360-parceiros'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/parceiros', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar parceiros');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Fetch notas fiscais
  const { data: notas = [], isLoading } = useQuery({
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
    enabled: !!token && !authLoading
  });

  // Filter notas
  const filteredNotas = notas.filter((nota: NotaFiscal) => {
    const searchMatch = nota.numero.includes(searchTerm) ||
                       nota.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nota.empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       nota.parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const tipoMatch = tipoFilter === 'all' || nota.tipo === tipoFilter;
    const statusMatch = statusFilter === 'all' || nota.status === statusFilter;
    
    return searchMatch && tipoMatch && statusMatch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: NotaFiscalFormData) => {
      const response = await fetch('/api/financas360/notas-fiscais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar nota fiscal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-notas-fiscais'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal criada com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<NotaFiscalFormData> }) => {
      const response = await fetch(`/api/financas360/notas-fiscais/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar nota fiscal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-notas-fiscais'] });
      setIsDialogOpen(false);
      setEditingNota(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal atualizada com sucesso!'
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
      const response = await fetch(`/api/financas360/notas-fiscais/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir nota fiscal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-notas-fiscais'] });
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal excluída com sucesso!'
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
      parceiroId: 0,
      tipo: 'entrada',
      serie: '',
      numero: '',
      dataEmissao: '',
      dataVencimento: '',
      valorTotal: 0,
      valorImposto: 0,
      status: 'pendente',
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNota) {
      updateMutation.mutate({ id: editingNota.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (nota: NotaFiscal) => {
    setEditingNota(nota);
    setFormData({
      empresaId: nota.empresa.id,
      parceiroId: nota.parceiro.id,
      tipo: nota.tipo,
      serie: nota.serie,
      numero: nota.numero,
      dataEmissao: nota.dataEmissao.split('T')[0],
      dataVencimento: nota.dataVencimento ? nota.dataVencimento.split('T')[0] : '',
      valorTotal: nota.valorTotal,
      valorImposto: nota.valorImposto,
      status: nota.status,
      observacoes: nota.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingNota(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
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
      entrada: 'Entrada',
      saida: 'Saída'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      entrada: 'bg-green-100 text-green-800',
      saida: 'bg-blue-100 text-blue-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      processada: 'Processada',
      cancelada: 'Cancelada',
      rejeitada: 'Rejeitada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      processada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      rejeitada: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTotalByStatus = (status: string) => {
    return filteredNotas
      .filter((nota: NotaFiscal) => nota.status === status)
      .reduce((sum: number, nota: NotaFiscal) => sum + nota.valorTotal, 0);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notas fiscais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar XML
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Nota
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNota ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
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
                    <Label htmlFor="parceiroId">Parceiro *</Label>
                    <Select
                      value={formData.parceiroId.toString()}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        parceiroId: parseInt(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {parceiros.map((parceiro: Parceiro) => (
                          <SelectItem key={parceiro.id} value={parceiro.id.toString()}>
                            {parceiro.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'entrada' | 'saida') => 
                        setFormData(prev => ({ ...prev, tipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="serie">Série *</Label>
                    <Input
                      id="serie"
                      value={formData.serie}
                      onChange={(e) => setFormData(prev => ({ ...prev, serie: e.target.value }))}
                      placeholder="001"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="123456"
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
                        <SelectItem value="rejeitada">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                    <Input
                      id="dataEmissao"
                      type="date"
                      value={formData.dataEmissao}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dataEmissao: e.target.value 
                      }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                    <Input
                      id="dataVencimento"
                      type="date"
                      value={formData.dataVencimento}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dataVencimento: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valorTotal">Valor Total *</Label>
                    <Input
                      id="valorTotal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorTotal}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        valorTotal: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valorImposto">Valor Imposto *</Label>
                    <Input
                      id="valorImposto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorImposto}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        valorImposto: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a nota fiscal"
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalByStatus('rejeitada'))}
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
            placeholder="Buscar por número, série, empresa ou parceiro..."
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
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
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
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Notas */}
      <div className="space-y-4">
        {filteredNotas.map((nota: NotaFiscal) => (
          <Card key={nota.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(nota.tipo)}`}>
                      {getTipoLabel(nota.tipo)}
                    </span>
                    <h3 className="font-semibold">
                      NF {nota.serie}/{nota.numero}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(nota.status)}`}>
                      {getStatusLabel(nota.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Empresa:</span><br />
                      {nota.empresa.razaoSocial}
                    </div>
                    <div>
                      <span className="font-medium">Parceiro:</span><br />
                      {nota.parceiro.nome}
                    </div>
                    <div>
                      <span className="font-medium">Emissão:</span><br />
                      {formatDate(nota.dataEmissao)}
                    </div>
                    <div>
                      <span className="font-medium">Valor Total:</span><br />
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(nota.valorTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Impostos:</span><br />
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(nota.valorImposto)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {}}
                    title="Download XML"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(nota)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(nota.id)}
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

      {filteredNotas.length === 0 && (searchTerm || tipoFilter !== 'all' || statusFilter !== 'all') && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota encontrada</h3>
          <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
          <Button onClick={() => { setSearchTerm(''); setTipoFilter('all'); setStatusFilter('all'); }} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      )}

      {notas.length === 0 && !searchTerm && tipoFilter === 'all' && statusFilter === 'all' && (
        <div className="text-center py-12">
          <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira nota fiscal ou importe um arquivo XML.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar XML
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
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
import { Plus, Edit, Trash2, CreditCard, Search, Eye, EyeOff } from 'lucide-react';

interface ContaBancaria {
  id: number;
  empresa: {
    id: number;
    razaoSocial: string;
  };
  banco: {
    id: number;
    nome: string;
    codigo: string;
  };
  tipo: 'corrente' | 'poupanca' | 'investimento';
  agencia: string;
  conta: string;
  digito?: string;
  saldoInicial: number;
  saldoAtual: number;
  ativa: boolean;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContaBancariaFormData {
  empresaId: number;
  bancoId: number;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  agencia: string;
  conta: string;
  digito?: string;
  saldoInicial: number;
  ativa: boolean;
  observacoes?: string;
}

interface Empresa {
  id: number;
  razaoSocial: string;
}

interface Banco {
  id: number;
  nome: string;
  codigo: string;
}

export default function ContasBancariasManager() {
  const { token } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaBancaria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaldos, setShowSaldos] = useState(false);
  const [formData, setFormData] = useState<ContaBancariaFormData>({
    empresaId: 0,
    bancoId: 0,
    tipo: 'corrente',
    agencia: '',
    conta: '',
    digito: '',
    saldoInicial: 0,
    ativa: true,
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
    }
  });

  // Fetch bancos
  const { data: bancos = [] } = useQuery({
    queryKey: ['financas360-bancos'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/bancos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar bancos');
      }
      
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch contas bancárias
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['financas360-contas-bancarias'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/contas-bancarias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar contas bancárias');
      }
      
      const result = await response.json();
      return result.data;
    }
  });

  // Filter contas
  const filteredContas = contas.filter((conta: ContaBancaria) =>
    conta.empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.banco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.agencia.includes(searchTerm) ||
    conta.conta.includes(searchTerm)
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContaBancariaFormData) => {
      const response = await fetch('/api/financas360/contas-bancarias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conta bancária');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Conta bancária criada com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContaBancariaFormData> }) => {
      const response = await fetch(`/api/financas360/contas-bancarias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar conta bancária');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      setIsDialogOpen(false);
      setEditingConta(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Conta bancária atualizada com sucesso!'
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
      const response = await fetch(`/api/financas360/contas-bancarias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir conta bancária');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-contas-bancarias'] });
      toast({
        title: 'Sucesso',
        description: 'Conta bancária excluída com sucesso!'
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
      bancoId: 0,
      tipo: 'corrente',
      agencia: '',
      conta: '',
      digito: '',
      saldoInicial: 0,
      ativa: true,
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConta) {
      updateMutation.mutate({ id: editingConta.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (conta: ContaBancaria) => {
    setEditingConta(conta);
    setFormData({
      empresaId: conta.empresa.id,
      bancoId: conta.banco.id,
      tipo: conta.tipo,
      agencia: conta.agencia,
      conta: conta.conta,
      digito: conta.digito || '',
      saldoInicial: conta.saldoInicial,
      ativa: conta.ativa,
      observacoes: conta.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingConta(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta bancária? Esta ação pode afetar lançamentos existentes.')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      investimento: 'Investimento'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTotalSaldo = () => {
    return filteredContas
      .filter((conta: ContaBancaria) => conta.ativa)
      .reduce((sum: number, conta: ContaBancaria) => sum + conta.saldoAtual, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando contas bancárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Contas Bancárias</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSaldos(!showSaldos)}
            className="flex items-center gap-2"
          >
            {showSaldos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSaldos ? 'Ocultar Saldos' : 'Mostrar Saldos'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingConta ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
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
                    <Label htmlFor="bancoId">Banco *</Label>
                    <Select
                      value={formData.bancoId.toString()}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        bancoId: parseInt(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {bancos.map((banco: Banco) => (
                          <SelectItem key={banco.id} value={banco.id.toString()}>
                            {banco.codigo} - {banco.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Conta *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'corrente' | 'poupanca' | 'investimento') => 
                        setFormData(prev => ({ ...prev, tipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="investimento">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="agencia">Agência *</Label>
                    <Input
                      id="agencia"
                      value={formData.agencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, agencia: e.target.value }))}
                      placeholder="0000"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="conta">Conta *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="conta"
                        value={formData.conta}
                        onChange={(e) => setFormData(prev => ({ ...prev, conta: e.target.value }))}
                        placeholder="00000000"
                        required
                        className="flex-1"
                      />
                      <Input
                        id="digito"
                        value={formData.digito}
                        onChange={(e) => setFormData(prev => ({ ...prev, digito: e.target.value }))}
                        placeholder="0"
                        maxLength={1}
                        className="w-16"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Conta e dígito verificador</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="saldoInicial">Saldo Inicial *</Label>
                  <Input
                    id="saldoInicial"
                    type="number"
                    step="0.01"
                    value={formData.saldoInicial}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      saldoInicial: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Saldo inicial da conta</p>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais sobre a conta"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={formData.ativa}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="ativa">Conta ativa</Label>
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

      {/* Summary Card */}
      {showSaldos && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">Saldo Total (Contas Ativas)</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatCurrency(getTotalSaldo())}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por empresa, banco, agência ou conta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContas.map((conta: ContaBancaria) => (
          <Card key={conta.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{conta.empresa.razaoSocial}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {conta.banco.codigo} - {conta.banco.nome}
                  </p>
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(conta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(conta.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tipo:</span>
                  <span>{getTipoLabel(conta.tipo)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ag./Conta:</span>
                  <span className="font-mono">
                    {conta.agencia}/{conta.conta}{conta.digito ? `-${conta.digito}` : ''}
                  </span>
                </div>
                
                {showSaldos && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Saldo Inicial:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(conta.saldoInicial)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Saldo Atual:</span>
                      <span className={`font-semibold ${
                        conta.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(conta.saldoAtual)}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    conta.ativa 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {conta.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContas.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
          <p className="text-gray-600 mb-6">Tente buscar com outros termos.</p>
          <Button onClick={() => setSearchTerm('')} variant="outline">
            Limpar Busca
          </Button>
        </div>
      )}

      {contas.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta bancária cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira conta bancária.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      )}
    </div>
  );
}
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
import { Plus, Edit, Trash2, Receipt, Search } from 'lucide-react';

interface FormaPagamento {
  id: number;
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto';
  taxaPercentual: string;
  taxaFixa: string;
  prazoRecebimento: number;
  contaBancariaId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormaPagamentoFormData {
  nome: string;
  tipo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia' | 'boleto';
  taxaPercentual: string;
  taxaFixa: string;
  prazoRecebimento: number;
  contaBancariaId: number | null;
}

export default function FormasPagamentoManager() {
  const { token, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForma, setEditingForma] = useState<FormaPagamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormaPagamentoFormData>({
    nome: '',
    tipo: 'dinheiro',
    taxaPercentual: '0.00',
    taxaFixa: '0.00',
    prazoRecebimento: 0,
    contaBancariaId: null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch formas de pagamento
  const { data: formas = [], isLoading, error } = useQuery({
    queryKey: ['financas360-formas-pagamento'],
    queryFn: async () => {

      
      const response = await fetch('/api/financas360/formas-pagamento', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      

      
      if (!response.ok) {
        throw new Error('Erro ao carregar formas de pagamento');
      }
      
      const result = await response.json();

      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Filter formas
  const filteredFormas = formas.filter((forma: FormaPagamento) =>
    forma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forma.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (forma.descricao && forma.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormaPagamentoFormData) => {
      const response = await fetch('/api/financas360/formas-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar forma de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-formas-pagamento'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Forma de pagamento criada com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormaPagamentoFormData> }) => {
      const response = await fetch(`/api/financas360/formas-pagamento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar forma de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-formas-pagamento'] });
      setIsDialogOpen(false);
      setEditingForma(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Forma de pagamento atualizada com sucesso!'
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
      const response = await fetch(`/api/financas360/formas-pagamento/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir forma de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-formas-pagamento'] });
      toast({
        title: 'Sucesso',
        description: 'Forma de pagamento excluída com sucesso!'
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
      nome: '',
      tipo: 'dinheiro',
      taxaPercentual: '0.00',
      taxaFixa: '0.00',
      prazoRecebimento: 0,
      contaBancariaId: null
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingForma) {
      updateMutation.mutate({ id: editingForma.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (forma: FormaPagamento) => {
    setEditingForma(forma);
    setFormData({
      nome: forma.nome,
      tipo: forma.tipo,
      taxaPercentual: forma.taxaPercentual,
      taxaFixa: forma.taxaFixa,
      prazoRecebimento: forma.prazoRecebimento,
      contaBancariaId: forma.contaBancariaId
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingForma(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência',
      boleto: 'Boleto',
      cheque: 'Cheque',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      dinheiro: 'bg-green-100 text-green-800',
      cartao_credito: 'bg-blue-100 text-blue-800',
      cartao_debito: 'bg-purple-100 text-purple-800',
      pix: 'bg-orange-100 text-orange-800',
      transferencia: 'bg-cyan-100 text-cyan-800',
      boleto: 'bg-yellow-100 text-yellow-800',
      cheque: 'bg-red-100 text-red-800',
      outros: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };



  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formas de pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600">Erro ao carregar formas de pagamento: {error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['financas360-formas-pagamento'] })}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Formas de Pagamento</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Forma
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingForma ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Dinheiro, Visa, Mastercard..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição adicional da forma de pagamento"
                />
              </div>

              {/* Configurações */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Configurações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prazoRecebimento">Prazo Recebimento (dias)</Label>
                    <Input
                      id="prazoRecebimento"
                      type="number"
                      min="0"
                      value={formData.prazoRecebimento || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        prazoRecebimento: parseInt(e.target.value) || 0
                      }))}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dias para recebimento do pagamento</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="taxa">Taxa (%)</Label>
                    <Input
                      id="taxa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.taxaPercentual || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        taxaPercentual: e.target.value
                      }))}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Taxa cobrada pela operadora</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="taxaFixa">Taxa Fixa (R$)</Label>
                  <Input
                    id="taxaFixa"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.taxaFixa || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      taxaFixa: e.target.value
                    }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativa"
                  checked={formData.ativa}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="ativa">Forma de pagamento ativa</Label>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, tipo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Formas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormas.map((forma: FormaPagamento) => (
          <Card key={forma.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {forma.nome}
                    <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(forma.tipo)}`}>
                      {getTipoLabel(forma.tipo)}
                    </span>
                  </CardTitle>
                  {forma.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{forma.descricao}</p>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(forma)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(forma.id)}
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
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    forma.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {forma.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                
                {forma.prazoRecebimento && forma.prazoRecebimento > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prazo:</span>
                    <span>{forma.prazoRecebimento} dias</span>
                  </div>
                )}
                
                {forma.taxaPercentual && parseFloat(forma.taxaPercentual) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Taxa %:</span>
                    <span>{forma.taxaPercentual}%</span>
                  </div>
                )}
                
                {forma.taxaFixa && parseFloat(forma.taxaFixa) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Taxa Fixa:</span>
                    <span>R$ {forma.taxaFixa}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFormas.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma forma encontrada</h3>
          <p className="text-gray-600 mb-6">Tente buscar com outros termos.</p>
          <Button onClick={() => setSearchTerm('')} variant="outline">
            Limpar Busca
          </Button>
        </div>
      )}

      {formas.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma forma de pagamento cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira forma de pagamento.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Forma
          </Button>
        </div>
      )}

      {filteredFormas.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Configure prazos e taxas para cada forma de pagamento para cálculos automáticos de fluxo de caixa.
          </p>
        </div>
      )}
    </div>
  );
}
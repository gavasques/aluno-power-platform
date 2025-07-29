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
import { Plus, Edit, Trash2, ArrowLeftRight, Search, Zap, CreditCard, Link } from 'lucide-react';

interface CanalPagamento {
  id: number;
  nome: string;
  tipo: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'gateway' | 'outros';
  provedor: string;
  configuracoes: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookUrl?: string;
    taxa?: number;
    prazoLiquidacao?: number;
    ativo?: boolean;
    ambiente?: 'sandbox' | 'producao';
    [key: string]: any;
  };
  ativo: boolean;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CanalPagamentoFormData {
  nome: string;
  tipo: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'gateway' | 'outros';
  provedor: string;
  configuracoes: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookUrl?: string;
    taxa?: number;
    prazoLiquidacao?: number;
    ativo?: boolean;
    ambiente?: 'sandbox' | 'producao';
    [key: string]: any;
  };
  ativo: boolean;
  observacoes?: string;
}

export default function CanaisPagamentoManager() {
  const { token, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCanal, setEditingCanal] = useState<CanalPagamento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [formData, setFormData] = useState<CanalPagamentoFormData>({
    nome: '',
    tipo: 'pix',
    provedor: '',
    configuracoes: {
      apiKey: '',
      secretKey: '',
      merchantId: '',
      webhookUrl: '',
      taxa: 0,
      prazoLiquidacao: 0,
      ativo: true,
      ambiente: 'sandbox'
    },
    ativo: true,
    observacoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch canais de pagamento
  const { data: canais = [], isLoading } = useQuery({
    queryKey: ['financas360-canais-pagamento'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/canais-pagamento', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar canais de pagamento');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !authLoading
  });

  // Filter canais
  const filteredCanais = canais.filter((canal: CanalPagamento) => {
    const searchMatch = canal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       canal.provedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       canal.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const tipoMatch = tipoFilter === 'all' || canal.tipo === tipoFilter;
    
    return searchMatch && tipoMatch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CanalPagamentoFormData) => {
      const response = await fetch('/api/financas360/canais-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar canal de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais-pagamento'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Canal de pagamento criado com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<CanalPagamentoFormData> }) => {
      const response = await fetch(`/api/financas360/canais-pagamento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar canal de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais-pagamento'] });
      setIsDialogOpen(false);
      setEditingCanal(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Canal de pagamento atualizado com sucesso!'
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
      const response = await fetch(`/api/financas360/canais-pagamento/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir canal de pagamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais-pagamento'] });
      toast({
        title: 'Sucesso',
        description: 'Canal de pagamento excluído com sucesso!'
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
      tipo: 'pix',
      provedor: '',
      configuracoes: {
        apiKey: '',
        secretKey: '',
        merchantId: '',
        webhookUrl: '',
        taxa: 0,
        prazoLiquidacao: 0,
        ativo: true,
        ambiente: 'sandbox'
      },
      ativo: true,
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCanal) {
      updateMutation.mutate({ id: editingCanal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (canal: CanalPagamento) => {
    setEditingCanal(canal);
    setFormData({
      nome: canal.nome,
      tipo: canal.tipo,
      provedor: canal.provedor,
      configuracoes: canal.configuracoes,
      ativo: canal.ativo,
      observacoes: canal.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCanal(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este canal de pagamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      pix: 'PIX',
      boleto: 'Boleto',
      cartao: 'Cartão',
      transferencia: 'Transferência',
      gateway: 'Gateway',
      outros: 'Outros'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      pix: 'bg-orange-100 text-orange-800',
      boleto: 'bg-yellow-100 text-yellow-800',
      cartao: 'bg-blue-100 text-blue-800',
      transferencia: 'bg-green-100 text-green-800',
      gateway: 'bg-purple-100 text-purple-800',
      outros: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      pix: Zap,
      boleto: CreditCard,
      cartao: CreditCard,
      transferencia: ArrowLeftRight,
      gateway: Link,
      outros: ArrowLeftRight
    };
    return icons[tipo as keyof typeof icons] || ArrowLeftRight;
  };

  const updateConfiguracao = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        [key]: value
      }
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando canais de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Canais de Pagamento</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Canal
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCanal ? 'Editar Canal de Pagamento' : 'Novo Canal de Pagamento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Canal *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Mercado Pago PIX, PagSeguro Cartão..."
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
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="gateway">Gateway</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="provedor">Provedor *</Label>
                  <Input
                    id="provedor"
                    value={formData.provedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, provedor: e.target.value }))}
                    placeholder="Ex: Mercado Pago, PagSeguro, Stripe..."
                    required
                  />
                </div>
              </div>

              {/* Configurações de API */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Configurações de API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ambiente">Ambiente</Label>
                    <Select
                      value={formData.configuracoes.ambiente}
                      onValueChange={(value: 'sandbox' | 'producao') => 
                        updateConfiguracao('ambiente', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                        <SelectItem value="producao">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input
                      id="merchantId"
                      value={formData.configuracoes.merchantId || ''}
                      onChange={(e) => updateConfiguracao('merchantId', e.target.value)}
                      placeholder="ID do comerciante"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.configuracoes.apiKey || ''}
                      onChange={(e) => updateConfiguracao('apiKey', e.target.value)}
                      placeholder="Chave pública da API"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      value={formData.configuracoes.secretKey || ''}
                      onChange={(e) => updateConfiguracao('secretKey', e.target.value)}
                      placeholder="Chave secreta da API"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={formData.configuracoes.webhookUrl || ''}
                    onChange={(e) => updateConfiguracao('webhookUrl', e.target.value)}
                    placeholder="https://seu-site.com/webhook/pagamento"
                  />
                </div>
              </div>

              {/* Configurações Financeiras */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Configurações Financeiras</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxa">Taxa (%)</Label>
                    <Input
                      id="taxa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.configuracoes.taxa || ''}
                      onChange={(e) => updateConfiguracao('taxa', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Taxa cobrada pelo provedor</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="prazoLiquidacao">Prazo Liquidação (dias)</Label>
                    <Input
                      id="prazoLiquidacao"
                      type="number"
                      min="0"
                      value={formData.configuracoes.prazoLiquidacao || ''}
                      onChange={(e) => updateConfiguracao('prazoLiquidacao', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dias para liquidação do pagamento</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre o canal de pagamento"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="ativo">Canal ativo</Label>
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, provedor ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
            <SelectItem value="gateway">Gateway</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Canais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCanais.map((canal: CanalPagamento) => {
          const IconComponent = getTipoIcon(canal.tipo);
          return (
            <Card key={canal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTipoColor(canal.tipo)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {canal.nome}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {canal.provedor} • {getTipoLabel(canal.tipo)}
                    </p>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(canal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(canal.id)}
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
                    <span className="font-medium">Ambiente:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      canal.configuracoes.ambiente === 'producao'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {canal.configuracoes.ambiente === 'producao' ? 'Produção' : 'Sandbox'}
                    </span>
                  </div>
                  
                  {canal.configuracoes.taxa && canal.configuracoes.taxa > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Taxa:</span>
                      <span>{canal.configuracoes.taxa}%</span>
                    </div>
                  )}
                  
                  {canal.configuracoes.prazoLiquidacao && canal.configuracoes.prazoLiquidacao > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Liquidação:</span>
                      <span>{canal.configuracoes.prazoLiquidacao} dias</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      canal.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {canal.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {canal.observacoes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium">Obs:</span> {canal.observacoes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCanais.length === 0 && (searchTerm || tipoFilter !== 'all') && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum canal encontrado</h3>
          <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
          <Button onClick={() => { setSearchTerm(''); setTipoFilter('all'); }} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      )}

      {canais.length === 0 && !searchTerm && tipoFilter === 'all' && (
        <div className="text-center py-12">
          <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum canal de pagamento cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro canal de pagamento para processar transações.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Canal
          </Button>
        </div>
      )}

      {filteredCanais.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica de Segurança:</strong> Mantenha suas chaves de API sempre seguras e use o ambiente de sandbox para testes antes de ativar em produção.
          </p>
        </div>
      )}
    </div>
  );
}
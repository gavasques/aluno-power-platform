import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Search, Phone, Mail, MapPin } from 'lucide-react';

interface Parceiro {
  id: number;
  tipo: 'cliente' | 'fornecedor' | 'ambos';
  nome: string;
  documento: string;
  tipoDocumento: 'cpf' | 'cnpj';
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  ativo: boolean;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ParceiroFormData {
  tipo: 'cliente' | 'fornecedor' | 'ambos';
  nome: string;
  documento: string;
  tipoDocumento: 'cpf' | 'cnpj';
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  ativo: boolean;
  observacoes?: string;
}

export default function ParceirosManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<Parceiro | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [formData, setFormData] = useState<ParceiroFormData>({
    tipo: 'cliente',
    nome: '',
    documento: '',
    tipoDocumento: 'cpf',
    email: '',
    telefone: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    ativo: true,
    observacoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch parceiros
  const { data: parceiros = [], isLoading } = useQuery({
    queryKey: ['financas360-parceiros'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/parceiros', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar parceiros');
      }
      
      const result = await response.json();
      return result.data;
    }
  });

  // Filter parceiros
  const filteredParceiros = parceiros.filter((parceiro: Parceiro) => {
    const searchMatch = parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       parceiro.documento.includes(searchTerm) ||
                       (parceiro.email && parceiro.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const tipoMatch = tipoFilter === 'all' || parceiro.tipo === tipoFilter;
    
    return searchMatch && tipoMatch;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ParceiroFormData) => {
      const response = await fetch('/api/financas360/parceiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar parceiro');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-parceiros'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Parceiro criado com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<ParceiroFormData> }) => {
      const response = await fetch(`/api/financas360/parceiros/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar parceiro');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-parceiros'] });
      setIsDialogOpen(false);
      setEditingParceiro(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Parceiro atualizado com sucesso!'
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
      const response = await fetch(`/api/financas360/parceiros/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir parceiro');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-parceiros'] });
      toast({
        title: 'Sucesso',
        description: 'Parceiro excluído com sucesso!'
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
      tipo: 'cliente',
      nome: '',
      documento: '',
      tipoDocumento: 'cpf',
      email: '',
      telefone: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      ativo: true,
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingParceiro) {
      updateMutation.mutate({ id: editingParceiro.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (parceiro: Parceiro) => {
    setEditingParceiro(parceiro);
    setFormData({
      tipo: parceiro.tipo,
      nome: parceiro.nome,
      documento: parceiro.documento,
      tipoDocumento: parceiro.tipoDocumento,
      email: parceiro.email || '',
      telefone: parceiro.telefone || '',
      endereco: parceiro.endereco || {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      ativo: parceiro.ativo,
      observacoes: parceiro.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingParceiro(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este parceiro? Esta ação pode afetar lançamentos existentes.')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      cliente: 'Cliente',
      fornecedor: 'Fornecedor',
      ambos: 'Cliente/Fornecedor'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      cliente: 'bg-blue-100 text-blue-800',
      fornecedor: 'bg-green-100 text-green-800',
      ambos: 'bg-purple-100 text-purple-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDocument = (documento: string, tipo: 'cpf' | 'cnpj') => {
    if (tipo === 'cpf') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const getCountByType = (tipo: 'cliente' | 'fornecedor' | 'ambos') => {
    return filteredParceiros.filter((p: Parceiro) => p.tipo === tipo && p.ativo).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando parceiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Parceiro
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingParceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'cliente' | 'fornecedor' | 'ambos') => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="fornecedor">Fornecedor</SelectItem>
                      <SelectItem value="ambos">Cliente/Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipoDocumento">Tipo Documento *</Label>
                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(value: 'cpf' | 'cnpj') => 
                      setFormData(prev => ({ ...prev, tipoDocumento: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="documento">
                    {formData.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} *
                  </Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                    placeholder={formData.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nome">Nome/Razão Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo ou razão social"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={formData.endereco?.logradouro || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, logradouro: e.target.value }
                      }))}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.endereco?.numero || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, numero: e.target.value }
                      }))}
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.endereco?.cep || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cep: e.target.value }
                      }))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.endereco?.complemento || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, complemento: e.target.value }
                      }))}
                      placeholder="Apto, sala, etc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.endereco?.bairro || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, bairro: e.target.value }
                      }))}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.endereco?.cidade || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cidade: e.target.value }
                      }))}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.endereco?.estado || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, estado: e.target.value }
                    }))}
                    placeholder="Ex: SP, RJ, MG..."
                    maxLength={2}
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre o parceiro"
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
                <Label htmlFor="ativo">Parceiro ativo</Label>
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
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-blue-600">
                {getCountByType('cliente')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Fornecedores Ativos</p>
              <p className="text-2xl font-bold text-green-600">
                {getCountByType('fornecedor')}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cliente/Fornecedor</p>
              <p className="text-2xl font-bold text-purple-600">
                {getCountByType('ambos')}
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
            placeholder="Buscar por nome, documento ou email..."
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
            <SelectItem value="cliente">Clientes</SelectItem>
            <SelectItem value="fornecedor">Fornecedores</SelectItem>
            <SelectItem value="ambos">Cliente/Fornecedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Parceiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParceiros.map((parceiro: Parceiro) => (
          <Card key={parceiro.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {parceiro.nome}
                    <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(parceiro.tipo)}`}>
                      {getTipoLabel(parceiro.tipo)}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 font-mono">
                    {formatDocument(parceiro.documento, parceiro.tipoDocumento)}
                  </p>
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(parceiro)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(parceiro.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                {parceiro.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{parceiro.email}</span>
                  </div>
                )}
                
                {parceiro.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{formatPhone(parceiro.telefone)}</span>
                  </div>
                )}
                
                {parceiro.endereco?.cidade && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">
                      {parceiro.endereco.cidade}{parceiro.endereco.estado && `, ${parceiro.endereco.estado}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    parceiro.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parceiro.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredParceiros.length === 0 && (searchTerm || tipoFilter !== 'all') && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro encontrado</h3>
          <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
          <Button onClick={() => { setSearchTerm(''); setTipoFilter('all'); }} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      )}

      {parceiros.length === 0 && !searchTerm && tipoFilter === 'all' && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro parceiro (cliente ou fornecedor).</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Parceiro
          </Button>
        </div>
      )}
    </div>
  );
}
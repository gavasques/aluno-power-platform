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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    logradouro: string;
    cidade: string;
    estado: string;
  };
  telefone?: string;
  email?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

interface EmpresaFormData {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco: {
    cep: string;
    logradouro: string;
    cidade: string;
    estado: string;
  };
  telefone?: string;
  email?: string;
}

export default function EmpresasManager() {
  const { token, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState<EmpresaFormData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    endereco: {
      cep: '',
      logradouro: '',
      cidade: '',
      estado: ''
    },
    telefone: '',
    email: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch empresas
  const { data: empresas = [], isLoading, error } = useQuery({
    queryKey: ['financas360-empresas'],
    queryFn: async () => {
      console.log('Fetching empresas...');
      console.log('Token from Auth Context:', token ? 'presente' : 'ausente');
      
      const response = await fetch('/api/financas360/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas');
      }
      
      const result = await response.json();
      console.log('Result data:', result.data);
      console.log('Empresas array length:', result.data?.length);
      return result.data;
    },
    enabled: !!token && !authLoading // Aguarda autenticação completa
  });

  // Create empresa mutation
  const createMutation = useMutation({
    mutationFn: async (data: EmpresaFormData) => {
      const response = await fetch('/api/financas360/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-empresas'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso!'
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

  // Update empresa mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmpresaFormData> }) => {
      const response = await fetch(`/api/financas360/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-empresas'] });
      setIsDialogOpen(false);
      setEditingEmpresa(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso!'
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

  // Delete empresa mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financas360/empresas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir empresa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-empresas'] });
      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso!'
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
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      endereco: {
        cep: '',
        logradouro: '',
        cidade: '',
        estado: ''
      },
      telefone: '',
      email: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmpresa) {
      updateMutation.mutate({ id: editingEmpresa.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia || '',
      cnpj: empresa.cnpj,
      inscricaoEstadual: empresa.inscricaoEstadual || '',
      inscricaoMunicipal: empresa.inscricaoMunicipal || '',
      endereco: empresa.endereco,
      telefone: empresa.telefone || '',
      email: empresa.email || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEmpresa(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  console.log('EmpresasManager render - authLoading:', authLoading, 'isLoading:', isLoading, 'error:', error, 'empresas:', empresas, 'empresas.length:', empresas?.length);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600">Erro ao carregar empresas: {error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['financas360-empresas'] })}
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
          <Building2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                    required
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
                
                <div>
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={(e) => setFormData(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.endereco.cep}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cep: e.target.value }
                      }))}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      value={formData.endereco.logradouro}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, logradouro: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cidade: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, estado: e.target.value }
                      }))}
                      maxLength={2}
                      placeholder="SP"
                      required
                    />
                  </div>
                </div>
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

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empresas.map((empresa: Empresa) => (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{empresa.razaoSocial}</CardTitle>
                  {empresa.nomeFantasia && (
                    <p className="text-sm text-gray-600 mt-1">{empresa.nomeFantasia}</p>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(empresa)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(empresa.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">CNPJ:</span> {formatCNPJ(empresa.cnpj)}
                </div>
                <div>
                  <span className="font-medium">Cidade:</span>{' '}
                  {empresa.endereco.cidade}/{empresa.endereco.estado}
                </div>
                {empresa.email && (
                  <div>
                    <span className="font-medium">Email:</span> {empresa.email}
                  </div>
                )}
                {empresa.telefone && (
                  <div>
                    <span className="font-medium">Telefone:</span> {empresa.telefone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {empresas.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira empresa.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      )}
    </div>
  );
}
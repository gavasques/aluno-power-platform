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
import { Plus, Edit, Trash2, Hash, Palette } from 'lucide-react';

interface Canal {
  id: number;
  nome: string;
  tipo: 'vendas' | 'compras' | 'ambos';
  descricao?: string;
  cor: string;
  ativo: boolean;
  configuracoes: {
    comissao?: number;
    prazoEntrega?: number;
    observacoes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CanalFormData {
  nome: string;
  tipo: 'vendas' | 'compras' | 'ambos';
  descricao?: string;
  cor: string;
  ativo: boolean;
  configuracoes: {
    comissao?: number;
    prazoEntrega?: number;
    observacoes?: string;
  };
}

const CORES_PREDEFINIDAS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export default function CanaisManager() {
  const { token } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCanal, setEditingCanal] = useState<Canal | null>(null);
  const [formData, setFormData] = useState<CanalFormData>({
    nome: '',
    tipo: 'vendas',
    descricao: '',
    cor: '#3b82f6',
    ativo: true,
    configuracoes: {
      comissao: 0,
      prazoEntrega: 0,
      observacoes: ''
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch canais
  const { data: canais = [], isLoading } = useQuery({
    queryKey: ['financas360-canais'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/canais', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar canais');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Create canal mutation
  const createMutation = useMutation({
    mutationFn: async (data: CanalFormData) => {
      const response = await fetch('/api/financas360/canais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar canal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Canal criado com sucesso!'
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

  // Update canal mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CanalFormData> }) => {
      const response = await fetch(`/api/financas360/canais/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar canal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais'] });
      setIsDialogOpen(false);
      setEditingCanal(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Canal atualizado com sucesso!'
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

  // Delete canal mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/financas360/canais/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir canal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-canais'] });
      toast({
        title: 'Sucesso',
        description: 'Canal excluído com sucesso!'
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
      tipo: 'vendas',
      descricao: '',
      cor: '#3b82f6',
      ativo: true,
      configuracoes: {
        comissao: 0,
        prazoEntrega: 0,
        observacoes: ''
      }
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

  const openEditDialog = (canal: Canal) => {
    setEditingCanal(canal);
    setFormData({
      nome: canal.nome,
      tipo: canal.tipo,
      descricao: canal.descricao || '',
      cor: canal.cor,
      ativo: canal.ativo,
      configuracoes: canal.configuracoes
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCanal(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este canal?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      vendas: 'Vendas',
      compras: 'Compras',
      ambos: 'Ambos'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando canais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Hash className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Canais</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Canal
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCanal ? 'Editar Canal' : 'Novo Canal'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Loja Online, Marketplace, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'vendas' | 'compras' | 'ambos') => 
                      setFormData(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
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
                  placeholder="Descrição opcional do canal"
                />
              </div>

              {/* Cor */}
              <div>
                <Label>Cor do Canal</Label>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: formData.cor }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {CORES_PREDEFINIDAS.map(cor => (
                      <button
                        key={cor}
                        type="button"
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          formData.cor === cor ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setFormData(prev => ({ ...prev, cor }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <Input
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                    className="w-20 h-10"
                  />
                </div>
              </div>

              {/* Configurações */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Configurações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comissao">Comissão (%)</Label>
                    <Input
                      id="comissao"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.configuracoes.comissao || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configuracoes: {
                          ...prev.configuracoes,
                          comissao: parseFloat(e.target.value) || 0
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prazoEntrega">Prazo de Entrega (dias)</Label>
                    <Input
                      id="prazoEntrega"
                      type="number"
                      min="0"
                      value={formData.configuracoes.prazoEntrega || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        configuracoes: {
                          ...prev.configuracoes,
                          prazoEntrega: parseInt(e.target.value) || 0
                        }
                      }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.configuracoes.observacoes || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      configuracoes: {
                        ...prev.configuracoes,
                        observacoes: e.target.value
                      }
                    }))}
                    placeholder="Observações adicionais sobre o canal"
                  />
                </div>
              </div>

              {/* Status */}
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

      {/* Lista de Canais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canais.map((canal: Canal) => (
          <Card key={canal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: canal.cor }}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{canal.nome}</CardTitle>
                    {canal.descricao && (
                      <p className="text-sm text-gray-600 mt-1">{canal.descricao}</p>
                    )}
                  </div>
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
                  <span className="font-medium">Tipo:</span>
                  <span className="capitalize">{getTipoLabel(canal.tipo)}</span>
                </div>
                
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
                
                {canal.configuracoes.comissao && canal.configuracoes.comissao > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Comissão:</span>
                    <span>{canal.configuracoes.comissao}%</span>
                  </div>
                )}
                
                {canal.configuracoes.prazoEntrega && canal.configuracoes.prazoEntrega > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prazo:</span>
                    <span>{canal.configuracoes.prazoEntrega} dias</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canais.length === 0 && (
        <div className="text-center py-12">
          <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum canal cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro canal.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Canal
          </Button>
        </div>
      )}
    </div>
  );
}
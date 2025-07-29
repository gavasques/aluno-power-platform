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
import { Plus, Edit, Trash2, Hash, Search, ChevronRight, ChevronDown } from 'lucide-react';

interface EstruturaDRE {
  id: number;
  codigo: string;
  nome: string;
  tipo: 'receita' | 'custo' | 'despesa' | 'resultado';
  nivel: number;
  contaPai?: {
    id: number;
    nome: string;
  };
  formula?: string;
  ordem: number;
  ativa: boolean;
  observacoes?: string;
  subContas: EstruturaDRE[];
  createdAt: string;
  updatedAt: string;
}

interface EstruturaDREFormData {
  codigo: string;
  nome: string;
  tipo: 'receita' | 'custo' | 'despesa' | 'resultado';
  nivel: number;
  contaPaiId?: number;
  formula?: string;
  ordem: number;
  ativa: boolean;
  observacoes?: string;
}

export default function EstruturaDREManager() {
  const { token } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstrutura, setEditingEstrutura] = useState<EstruturaDRE | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<EstruturaDREFormData>({
    codigo: '',
    nome: '',
    tipo: 'receita',
    nivel: 1,
    contaPaiId: undefined,
    formula: '',
    ordem: 1,
    ativa: true,
    observacoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch estrutura DRE
  const { data: estruturas = [], isLoading } = useQuery({
    queryKey: ['financas360-estrutura-dre'],
    queryFn: async () => {
      const response = await fetch('/api/financas360/estrutura-dre', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estrutura DRE');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!token
  });

  // Organizar estruturas em árvore
  const organizarEstrutura = (estruturas: EstruturaDRE[]): EstruturaDRE[] => {
    const estruturasMap = new Map<number, EstruturaDRE>();
    const raizes: EstruturaDRE[] = [];

    // Criar map de todas as estruturas
    estruturas.forEach(estrutura => {
      estruturasMap.set(estrutura.id, { ...estrutura, subContas: [] });
    });

    // Organizar hierarquia
    estruturas.forEach(estrutura => {
      const estruturaCompleta = estruturasMap.get(estrutura.id)!;
      
      if (estrutura.contaPai) {
        const pai = estruturasMap.get(estrutura.contaPai.id);
        if (pai) {
          pai.subContas.push(estruturaCompleta);
        }
      } else {
        raizes.push(estruturaCompleta);
      }
    });

    // Ordenar por ordem
    const ordernar = (estruturas: EstruturaDRE[]) => {
      estruturas.sort((a, b) => a.ordem - b.ordem);
      estruturas.forEach(estrutura => {
        if (estrutura.subContas.length > 0) {
          ordernar(estrutura.subContas);
        }
      });
    };

    ordernar(raizes);
    return raizes;
  };

  const estruturasOrganizadas = organizarEstrutura(estruturas);

  // Filter estruturas
  const filtrarEstrutura = (estruturas: EstruturaDRE[], searchTerm: string, tipoFilter: string): EstruturaDRE[] => {
    return estruturas.filter(estrutura => {
      const searchMatch = estrutura.nome?.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
                         estrutura.codigo?.toLowerCase().includes(searchTerm?.toLowerCase() || '');
      
      const tipoMatch = tipoFilter === 'all' || estrutura.tipo === tipoFilter;
      
      // Se a estrutura principal não passa no filtro, verifica as subcontas
      if (!searchMatch || !tipoMatch) {
        const subContasFiltradas = filtrarEstrutura(estrutura.subContas, searchTerm, tipoFilter);
        return subContasFiltradas.length > 0;
      }
      
      return true;
    }).map(estrutura => ({
      ...estrutura,
      subContas: filtrarEstrutura(estrutura.subContas, searchTerm, tipoFilter)
    }));
  };

  const estruturasFiltradas = filtrarEstrutura(estruturasOrganizadas, searchTerm, tipoFilter);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: EstruturaDREFormData) => {
      const response = await fetch('/api/financas360/estrutura-dre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar estrutura DRE');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-estrutura-dre'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Estrutura DRE criada com sucesso!'
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<EstruturaDREFormData> }) => {
      const response = await fetch(`/api/financas360/estrutura-dre/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar estrutura DRE');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-estrutura-dre'] });
      setIsDialogOpen(false);
      setEditingEstrutura(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Estrutura DRE atualizada com sucesso!'
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
      const response = await fetch(`/api/financas360/estrutura-dre/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir estrutura DRE');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financas360-estrutura-dre'] });
      toast({
        title: 'Sucesso',
        description: 'Estrutura DRE excluída com sucesso!'
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
      codigo: '',
      nome: '',
      tipo: 'receita',
      nivel: 1,
      contaPaiId: undefined,
      formula: '',
      ordem: 1,
      ativa: true,
      observacoes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEstrutura) {
      updateMutation.mutate({ id: editingEstrutura.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (estrutura: EstruturaDRE) => {
    setEditingEstrutura(estrutura);
    setFormData({
      codigo: estrutura.codigo,
      nome: estrutura.nome,
      tipo: estrutura.tipo,
      nivel: estrutura.nivel,
      contaPaiId: estrutura.contaPai?.id,
      formula: estrutura.formula || '',
      ordem: estrutura.ordem,
      ativa: estrutura.ativa,
      observacoes: estrutura.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEstrutura(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta estrutura DRE? Subcontas também serão removidas.')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      receita: 'Receita',
      custo: 'Custo',
      despesa: 'Despesa',
      resultado: 'Resultado'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      receita: 'bg-green-100 text-green-800',
      custo: 'bg-red-100 text-red-800',
      despesa: 'bg-orange-100 text-orange-800',
      resultado: 'bg-blue-100 text-blue-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderEstrutura = (estruturas: EstruturaDRE[], parentLevel: number = 0) => {
    return estruturas.map(estrutura => (
      <div key={estrutura.id}>
        <Card className="mb-2 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div style={{ marginLeft: `${parentLevel * 20}px` }}>
                  {estrutura.subContas.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(estrutura.id)}
                      className="p-1 h-6 w-6"
                    >
                      {expandedItems.has(estrutura.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {estrutura.subContas.length === 0 && (
                    <div className="w-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {estrutura.codigo}
                    </span>
                    <h3 className="font-semibold">{estrutura.nome}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTipoColor(estrutura.tipo)}`}>
                      {getTipoLabel(estrutura.tipo)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Nível {estrutura.nivel}
                    </span>
                  </div>
                  
                  {estrutura.formula && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Fórmula:</span> {estrutura.formula}
                    </div>
                  )}
                  
                  {estrutura.observacoes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Obs:</span> {estrutura.observacoes}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  estrutura.ativa 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {estrutura.ativa ? 'Ativa' : 'Inativa'}
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(estrutura)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(estrutura.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {expandedItems.has(estrutura.id) && estrutura.subContas.length > 0 && (
          <div className="ml-4">
            {renderEstrutura(estrutura.subContas, parentLevel + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Obter contas pai possíveis (exclui a própria conta sendo editada)
  const getContasPai = (estruturas: EstruturaDRE[], excludeId?: number): EstruturaDRE[] => {
    const contas: EstruturaDRE[] = [];
    
    const processar = (estruts: EstruturaDRE[]) => {
      estruts.forEach(estrut => {
        if (!excludeId || estrut.id !== excludeId) {
          contas.push(estrut);
          processar(estrut.subContas);
        }
      });
    };
    
    processar(estruturas);
    return contas;
  };

  const contasPai = getContasPai(estruturasOrganizadas, editingEstrutura?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estrutura DRE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Hash className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Estrutura DRE</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setExpandedItems(new Set(estruturas.map(e => e.id)))}
          >
            Expandir Tudo
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpandedItems(new Set())}
          >
            Recolher Tudo
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEstrutura ? 'Editar Estrutura DRE' : 'Nova Estrutura DRE'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                      placeholder="Ex: 1.1.01"
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
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="custo">Custo</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="resultado">Resultado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="nivel">Nível *</Label>
                    <Input
                      id="nivel"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.nivel}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        nivel: parseInt(e.target.value) || 1 
                      }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nome">Nome da Conta *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Receita Bruta de Vendas"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contaPaiId">Conta Pai</Label>
                    <Select
                      value={formData.contaPaiId?.toString() || ''}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        contaPaiId: value ? parseInt(value) : undefined 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione conta pai (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (conta raiz)</SelectItem>
                        {contasPai.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id.toString()}>
                            {conta.codigo} - {conta.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ordem">Ordem *</Label>
                    <Input
                      id="ordem"
                      type="number"
                      min="1"
                      value={formData.ordem}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        ordem: parseInt(e.target.value) || 1 
                      }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="formula">Fórmula de Cálculo</Label>
                  <Input
                    id="formula"
                    value={formData.formula}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                    placeholder="Ex: 1.1.01 + 1.1.02 - 1.2.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use códigos de outras contas para fórmulas automáticas
                  </p>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações sobre a conta"
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por código ou nome..."
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
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="custo">Custo</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
            <SelectItem value="resultado">Resultado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estrutura DRE em árvore */}
      <div className="space-y-2">
        {renderEstrutura(estruturasFiltradas)}
      </div>

      {estruturasFiltradas.length === 0 && (searchTerm || tipoFilter !== 'all') && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma estrutura encontrada</h3>
          <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
          <Button onClick={() => { setSearchTerm(''); setTipoFilter('all'); }} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      )}

      {estruturas.length === 0 && !searchTerm && tipoFilter === 'all' && (
        <div className="text-center py-12">
          <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma estrutura DRE cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando a estrutura base do seu DRE.</p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      )}

      {estruturasFiltradas.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Organize sua estrutura DRE em níveis hierárquicos para facilitar a análise. 
            Use fórmulas para cálculos automáticos entre contas.
          </p>
        </div>
      )}
    </div>
  );
}
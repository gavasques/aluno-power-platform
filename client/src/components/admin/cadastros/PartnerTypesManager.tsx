import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Category, InsertCategory } from '@shared/schema';

const PartnerTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPartnerType, setNewPartnerType] = useState({ 
    name: "", 
    description: "",
    icon: "Users"
  });
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: partnerTypes = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest<Category[]>('/api/categories?type=partner'),
  });

  const createMutation = useMutation({
    mutationFn: (partnerType: InsertCategory) => 
      apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          ...partnerType,
          type: 'partner'
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de parceiro criado com sucesso!",
      });
      setNewPartnerType({ name: "", description: "", icon: "Users" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de parceiro.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de parceiro removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de parceiro.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedPartnerTypes = partnerTypes
    .filter((partnerType) => 
      partnerType.type === 'partner' && 
      partnerType.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
        case "alphabetical":
          return a.name.localeCompare(b.name, 'pt-BR');
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name, 'pt-BR');
      }
    });

  function handleAddPartnerType(e: React.FormEvent) {
    e.preventDefault();
    if (newPartnerType.name.trim()) {
      createMutation.mutate({
        name: newPartnerType.name.trim(),
        description: newPartnerType.description.trim() || null,
        icon: newPartnerType.icon,
        type: 'partner',
      });
    }
  }

  function handleDeletePartnerType(partnerType: Category) {
    if (confirm(`Tem certeza que deseja excluir o tipo "${partnerType.name}"?`)) {
      deleteMutation.mutate(partnerType.id);
    }
  }

  const iconOptions = [
    { value: "Users", label: "Usuários" },
    { value: "Building", label: "Empresa" },
    { value: "Briefcase", label: "Negócios" },
    { value: "HandHeart", label: "Parceria" },
    { value: "Award", label: "Premiação" },
    { value: "Target", label: "Objetivo" },
    { value: "Zap", label: "Energia" },
    { value: "Shield", label: "Proteção" },
    { value: "Globe", label: "Global" },
    { value: "Rocket", label: "Crescimento" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Tipos de Parceiro</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Tipo de Parceiro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPartnerType} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newPartnerType.name}
                  onChange={(e) => setNewPartnerType({ ...newPartnerType, name: e.target.value })}
                  placeholder="Ex: Contadores, Advogados, Fotógrafos..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <Select 
                  value={newPartnerType.icon} 
                  onValueChange={(value) => setNewPartnerType({ ...newPartnerType, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newPartnerType.description}
                  onChange={(e) => setNewPartnerType({ ...newPartnerType, description: e.target.value })}
                  placeholder="Descreva o tipo de parceiro..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Criar Tipo'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Tipos de Parceiro</CardTitle>
          <CardDescription>
            Configure os tipos de parceiros para organizar e categorizar seus parceiros de negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tipos de parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-white border border-input">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-input">
                <SelectItem value="alphabetical">Ordem Alfabética</SelectItem>
                <SelectItem value="created">Mais Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isLoading && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedPartnerTypes.length} tipo{filteredAndSortedPartnerTypes.length !== 1 ? 's' : ''} de parceiro{filteredAndSortedPartnerTypes.length !== 1 ? 's' : ''}
                {searchTerm && ` encontrado${filteredAndSortedPartnerTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de parceiros...
              </div>
            )}
            
            {!isLoading && filteredAndSortedPartnerTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                {searchTerm ? 'Nenhum tipo de parceiro encontrado para sua busca.' : 'Nenhum tipo de parceiro cadastrado ainda.'}
                <div className="text-sm mt-1">
                  {!searchTerm && 'Clique em "Novo Tipo" para criar o primeiro tipo de parceiro.'}
                </div>
              </div>
            )}
            
            {filteredAndSortedPartnerTypes.map((partnerType) => (
              <div key={partnerType.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{partnerType.name}</h3>
                    {partnerType.description && (
                      <p className="text-sm text-muted-foreground">{partnerType.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {new Date(partnerType.createdAt).toLocaleDateString('pt-BR')}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePartnerType(partnerType)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerTypesManager;
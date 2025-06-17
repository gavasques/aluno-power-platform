
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, InsertCategory } from "@shared/schema";

const SupplierTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newType, setNewType] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: supplierTypes = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories', { type: 'supplier' }],
    queryFn: () => apiRequest('/api/categories?type=supplier'),
  });

  const createMutation = useMutation({
    mutationFn: (category: InsertCategory) => 
      apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de fornecedor criado com sucesso!",
      });
      setNewType("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de fornecedor.",
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
        description: "Tipo de fornecedor removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de fornecedor.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedSupplierTypes = supplierTypes
    .filter((type) => type.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newType.trim()) {
      createMutation.mutate({
        name: newType.trim(),
        icon: "Package",
        description: null,
        type: "supplier",
      });
    }
  }
  
  function handleDelete(category: Category) {
    deleteMutation.mutate(category.id);
  }

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground">Tipos de Fornecedor</CardTitle>
          <Button 
            onClick={() => document.getElementById('new-type-input')?.focus()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              id="new-type-input"
              placeholder="Novo tipo de fornecedor..."
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createMutation.isPending}
            >
              Adicionar
            </Button>
          </form>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar tipos de fornecedor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground flex-1"
            />
            <Select value={sortBy} onValueChange={(value: "name" | "created" | "alphabetical") => setSortBy(value)}>
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
                {filteredAndSortedSupplierTypes.length} tipo{filteredAndSortedSupplierTypes.length !== 1 ? 's' : ''} de fornecedor{filteredAndSortedSupplierTypes.length !== 1 ? 'es' : ''}
                {searchTerm && ` encontrado${filteredAndSortedSupplierTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de fornecedor...
              </div>
            )}
            {!isLoading && filteredAndSortedSupplierTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo encontrado.
              </div>
            )}
            {!isLoading && filteredAndSortedSupplierTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{type.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Criado em {new Date(type.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(type)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierTypesManager;

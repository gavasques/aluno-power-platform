
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, InsertCategory } from "@shared/schema";

const SupplierTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newType, setNewType] = useState("");
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

  const filtered = supplierTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de fornecedor...
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo encontrado.
              </div>
            )}
            {!isLoading && filtered.map(type => (
              <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-foreground">{type.name}</span>
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

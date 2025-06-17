
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TemplateCategory, InsertTemplateCategory } from "@shared/schema";

const TemplateTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplateType, setNewTemplateType] = useState({ name: "", description: "" });
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templateTypes = [], isLoading } = useQuery<TemplateCategory[]>({
    queryKey: ['/api/template-categories'],
  });

  const createMutation = useMutation({
    mutationFn: (templateType: InsertTemplateCategory) => 
      apiRequest('/api/template-categories', {
        method: 'POST',
        body: JSON.stringify(templateType),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de template criado com sucesso!",
      });
      setNewTemplateType({ name: "", description: "" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de template.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/template-categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/template-categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de template removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de template.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedTemplateTypes = templateTypes
    .filter((templateType) => templateType.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  function handleAddTemplateType(e: React.FormEvent) {
    e.preventDefault();
    if (newTemplateType.name.trim()) {
      createMutation.mutate({
        name: newTemplateType.name.trim(),
        description: newTemplateType.description.trim() || null,
      });
    }
  }

  function handleDeleteTemplateType(templateType: TemplateCategory) {
    deleteMutation.mutate(templateType.id);
  }

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-foreground">Tipos de Templates</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Novo Tipo de Template</DialogTitle>
                <DialogDescription>Informe o nome e descrição do novo tipo de template.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTemplateType} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome do Tipo"
                  value={newTemplateType.name}
                  onChange={(e) => setNewTemplateType(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newTemplateType.description}
                  onChange={(e) => setNewTemplateType(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="mr-2">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createMutation.isPending}
                  >
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar tipos de template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredAndSortedTemplateTypes.length} tipo{filteredAndSortedTemplateTypes.length !== 1 ? 's' : ''} de template{filteredAndSortedTemplateTypes.length !== 1 ? 's' : ''}
                {searchTerm && ` encontrado${filteredAndSortedTemplateTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de templates...
              </div>
            )}
            {!isLoading && filteredAndSortedTemplateTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo de template encontrado.
              </div>
            )}
            {!isLoading && filteredAndSortedTemplateTypes.map((templateType) => (
              <div
                key={templateType.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{templateType.name}</div>
                  {templateType.description && (
                    <div className="text-sm text-muted-foreground mt-1">{templateType.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Criado em {new Date(templateType.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteTemplateType(templateType)}
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
export default TemplateTypesManager;

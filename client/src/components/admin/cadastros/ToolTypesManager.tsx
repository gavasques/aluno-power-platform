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
import type { ToolType, InsertToolType } from "@shared/schema";

const ToolTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newToolType, setNewToolType] = useState({ name: "", description: "" });
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: toolTypes = [], isLoading } = useQuery<ToolType[]>({
    queryKey: ['/api/tool-types'],
  });

  const createMutation = useMutation({
    mutationFn: (toolType: InsertToolType) => 
      apiRequest('/api/tool-types', {
        method: 'POST',
        body: JSON.stringify(toolType),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tool-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de ferramenta criado com sucesso!",
      });
      setNewToolType({ name: "", description: "" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de ferramenta.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/tool-types/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tool-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de ferramenta removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de ferramenta.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedToolTypes = toolTypes
    .filter((toolType) => toolType.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  function handleAddToolType(e: React.FormEvent) {
    e.preventDefault();
    if (newToolType.name.trim()) {
      createMutation.mutate({
        name: newToolType.name.trim(),
        description: newToolType.description.trim() || null,
      });
    }
  }

  function handleDeleteToolType(toolType: ToolType) {
    deleteMutation.mutate(toolType.id);
  }

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-foreground">Gerenciar Tipos de Ferramentas</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Novo Tipo de Ferramenta</DialogTitle>
                <DialogDescription>Informe o nome e descrição do novo tipo de ferramenta.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddToolType} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome do Tipo"
                  value={newToolType.name}
                  onChange={(e) => setNewToolType(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newToolType.description}
                  onChange={(e) => setNewToolType(prev => ({ ...prev, description: e.target.value }))}
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
              placeholder="Buscar tipos de ferramentas..."
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
                {filteredAndSortedToolTypes.length} tipo{filteredAndSortedToolTypes.length !== 1 ? 's' : ''} de ferramenta{filteredAndSortedToolTypes.length !== 1 ? 's' : ''}
                {searchTerm && ` encontrado${filteredAndSortedToolTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de ferramentas...
              </div>
            )}
            {!isLoading && filteredAndSortedToolTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo de ferramenta encontrado.
              </div>
            )}
            {!isLoading && filteredAndSortedToolTypes.map((toolType) => (
              <div
                key={toolType.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{toolType.name}</div>
                  {toolType.description && (
                    <div className="text-sm text-muted-foreground mt-1">{toolType.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Criado em {new Date(toolType.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteToolType(toolType)}
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

export default ToolTypesManager;
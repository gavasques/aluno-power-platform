
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
import type { PromptCategory, InsertPromptCategory } from "@shared/schema";

const PromptTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPromptType, setNewPromptType] = useState({ name: "", description: "" });
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: promptTypes = [], isLoading } = useQuery<PromptCategory[]>({
    queryKey: ['/api/prompt-categories'],
  });

  const createMutation = useMutation({
    mutationFn: (promptType: InsertPromptCategory) => 
      apiRequest('/api/prompt-categories', {
        method: 'POST',
        body: JSON.stringify(promptType),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de prompt de IA criado com sucesso!",
      });
      setNewPromptType({ name: "", description: "" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de prompt de IA.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/prompt-categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompt-categories'] });
      toast({
        title: "Sucesso",
        description: "Tipo de prompt de IA removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de prompt de IA.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedPromptTypes = promptTypes
    .filter((promptType) => promptType.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  function handleAddPromptType(e: React.FormEvent) {
    e.preventDefault();
    if (newPromptType.name.trim()) {
      createMutation.mutate({
        name: newPromptType.name.trim(),
        description: newPromptType.description.trim() || null,
      });
    }
  }

  function handleDeletePromptType(promptType: PromptCategory) {
    deleteMutation.mutate(promptType.id);
  }

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-foreground">Tipos de Prompt de IA</CardTitle>
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
                <DialogTitle>Novo Tipo de Prompt de IA</DialogTitle>
                <DialogDescription>Informe o nome e descrição do novo tipo de prompt de IA.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPromptType} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome do Tipo"
                  value={newPromptType.name}
                  onChange={(e) => setNewPromptType(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newPromptType.description}
                  onChange={(e) => setNewPromptType(prev => ({ ...prev, description: e.target.value }))}
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
              placeholder="Buscar tipos de prompts de IA..."
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
                {filteredAndSortedPromptTypes.length} tipo{filteredAndSortedPromptTypes.length !== 1 ? 's' : ''} de prompt{filteredAndSortedPromptTypes.length !== 1 ? 's' : ''} de IA
                {searchTerm && ` encontrado${filteredAndSortedPromptTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de prompts de IA...
              </div>
            )}
            {!isLoading && filteredAndSortedPromptTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo de prompt de IA encontrado.
              </div>
            )}
            {!isLoading && filteredAndSortedPromptTypes.map((promptType) => (
              <div
                key={promptType.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{promptType.name}</div>
                  {promptType.description && (
                    <div className="text-sm text-muted-foreground mt-1">{promptType.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Criado em {new Date(promptType.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeletePromptType(promptType)}
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
export default PromptTypesManager;

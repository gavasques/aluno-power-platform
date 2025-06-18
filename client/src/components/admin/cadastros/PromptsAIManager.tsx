
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, BrainCircuit, Search, Copy, Image } from "lucide-react";
import { usePrompts } from "@/contexts/PromptsContext";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const PromptsAIManager = () => {
  const { prompts, categories, searchPrompts, deletePrompt } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const filteredPrompts = React.useMemo(() => {
    let result = searchQuery ? searchPrompts(searchQuery) : prompts;
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(prompt => prompt.category.id === selectedCategory);
    }
    return result;
  }, [prompts, searchQuery, selectedCategory, searchPrompts]);

  const handleDelete = async (id: string, title: string) => {
    try {
      await deletePrompt(id);
      toast({
        title: "Prompt excluído",
        description: "O prompt foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o prompt.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Prompt copiado!",
        description: `O prompt "${title}" foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Gestão de Prompts IA</CardTitle>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation('/admin/conteudo/prompts-ia/novo')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Prompts */}
          {filteredPrompts.length === 0 && (
            <div className="text-muted-foreground py-6 text-center">
              Nenhum prompt encontrado.
            </div>
          )}
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{prompt.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      {prompt.category.name}
                    </Badge>
                    {prompt.images && prompt.images.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Image className="h-3 w-3 mr-1" />
                        {prompt.images.length} {prompt.images.length === 1 ? 'imagem' : 'imagens'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-foreground border-border hover:bg-gray-100"
                    onClick={() => copyToClipboard(prompt.content, prompt.title)}
                    title="Copiar conteúdo"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-foreground border-border hover:bg-gray-100"
                    onClick={() => setLocation(`/admin/conteudo/prompts-ia/${prompt.id}/edit`)}
                    title="Editar prompt"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        title="Excluir prompt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o prompt "{prompt.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(prompt.id, prompt.title)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {prompt.description && (
                <p className="text-sm text-muted-foreground mb-2">{prompt.description}</p>
              )}
              <div className="bg-white p-3 rounded border text-sm text-gray-600 mb-2">
                <p className="line-clamp-2">{prompt.content}</p>
              </div>
              {prompt.usageExamples && (
                <div className="bg-blue-50 p-3 rounded border text-sm text-blue-800 mb-2">
                  <strong>Exemplos de uso:</strong> {prompt.usageExamples}
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Criado em {prompt.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {prompt.updatedAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptsAIManager;

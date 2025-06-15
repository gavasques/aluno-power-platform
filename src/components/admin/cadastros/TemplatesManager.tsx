import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, FileText, Search, Copy } from "lucide-react";
import { useTemplates } from "@/contexts/TemplatesContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TemplatesManager = () => {
  const { templates, categories, searchTemplates, deleteTemplate } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const filteredTemplates = React.useMemo(() => {
    let result = searchQuery ? searchTemplates(searchQuery) : templates;
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(template => template.category.id === selectedCategory);
    }
    return result;
  }, [templates, searchQuery, selectedCategory, searchTemplates]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o template "${title}"?`)) {
      try {
        await deleteTemplate(id);
        toast({
          title: "Template excluído",
          description: "O template foi excluído com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o template.",
          variant: "destructive",
        });
      }
    }
  };

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Template copiado!",
        description: `O template "${title}" foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Templates</CardTitle>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
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
                placeholder="Buscar templates..."
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

          {/* Lista de Templates */}
          {filteredTemplates.length === 0 && (
            <div className="text-muted-foreground py-6 text-center">
              Nenhum template encontrado.
            </div>
          )}
          {filteredTemplates.map((template) => (
            <div key={template.id} className="p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{template.title}</h3>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 mt-1">
                    {template.category.name}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-foreground border-border hover:bg-gray-100"
                    onClick={() => copyToClipboard(template.content, template.title)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-foreground border-border hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(template.id, template.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
              )}
              <div className="bg-white p-3 rounded border text-sm text-gray-600 mb-2">
                <p className="line-clamp-2">{template.content}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Criado em {template.createdAt.toLocaleDateString('pt-BR')}</span>
                <span>Atualizado em {template.updatedAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatesManager;

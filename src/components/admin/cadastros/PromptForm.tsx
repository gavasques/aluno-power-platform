
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, BrainCircuit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrompts } from "@/contexts/PromptsContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PromptForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { prompts, categories, createPrompt, updatePrompt, getPromptById } = usePrompts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isEditing = id && id !== 'novo';
  const currentPrompt = isEditing ? getPromptById(id) : null;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    description: '',
    usageExamples: '',
  });

  useEffect(() => {
    if (currentPrompt) {
      setFormData({
        title: currentPrompt.title,
        content: currentPrompt.content,
        categoryId: currentPrompt.category.id,
        description: currentPrompt.description || '',
        usageExamples: currentPrompt.usageExamples || '',
      });
    }
  }, [currentPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && currentPrompt) {
        await updatePrompt({
          id: currentPrompt.id,
          ...formData,
        });
        toast({
          title: "Prompt atualizado",
          description: "O prompt foi atualizado com sucesso.",
        });
      } else {
        await createPrompt(formData);
        toast({
          title: "Prompt criado",
          description: "O prompt foi criado com sucesso.",
        });
      }
      navigate('/admin/conteudo/prompts-ia');
    } catch (error) {
      toast({
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o prompt." : "Não foi possível criar o prompt.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/conteudo/prompts-ia')}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              {isEditing ? 'Editar Prompt IA' : 'Novo Prompt IA'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o título do prompt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Breve descrição do prompt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Prompt *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Digite o conteúdo do prompt..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageExamples">Exemplos de Uso</Label>
            <Textarea
              id="usageExamples"
              value={formData.usageExamples}
              onChange={(e) => handleInputChange('usageExamples', e.target.value)}
              placeholder="Descreva exemplos de como usar este prompt..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/conteudo/prompts-ia')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Prompt')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromptForm;

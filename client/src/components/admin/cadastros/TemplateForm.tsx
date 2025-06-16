
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTemplates } from "@/contexts/TemplatesContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TemplateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { templates, categories, createTemplate, updateTemplate, getTemplateById } = useTemplates();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isEditing = id && id !== 'novo';
  const currentTemplate = isEditing ? getTemplateById(id) : null;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    description: '',
    whenToUse: '',
    customization: '',
  });

  useEffect(() => {
    if (currentTemplate) {
      setFormData({
        title: currentTemplate.title,
        content: currentTemplate.content,
        categoryId: currentTemplate.category.id,
        description: currentTemplate.description || '',
        whenToUse: currentTemplate.whenToUse || '',
        customization: currentTemplate.customization || '',
      });
    }
  }, [currentTemplate]);

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
      if (isEditing && currentTemplate) {
        await updateTemplate({
          id: currentTemplate.id,
          ...formData,
        });
        toast({
          title: "Template atualizado",
          description: "O template foi atualizado com sucesso.",
        });
      } else {
        await createTemplate(formData);
        toast({
          title: "Template criado",
          description: "O template foi criado com sucesso.",
        });
      }
      navigate('/admin/conteudo/templates');
    } catch (error) {
      toast({
        title: "Erro",
        description: isEditing ? "Não foi possível atualizar o template." : "Não foi possível criar o template.",
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
            onClick={() => navigate('/admin/conteudo/templates')}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle className="text-foreground">
            {isEditing ? 'Editar Template' : 'Novo Template'}
          </CardTitle>
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
                placeholder="Digite o título do template"
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
              placeholder="Breve descrição do template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Template *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Digite o conteúdo do template..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whenToUse">Quando Usar</Label>
            <Textarea
              id="whenToUse"
              value={formData.whenToUse}
              onChange={(e) => handleInputChange('whenToUse', e.target.value)}
              placeholder="Descreva quando este template deve ser usado..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customization">Instruções de Personalização</Label>
            <Textarea
              id="customization"
              value={formData.customization}
              onChange={(e) => handleInputChange('customization', e.target.value)}
              placeholder="Instruções sobre como personalizar este template..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/conteudo/templates')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Template')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TemplateForm;

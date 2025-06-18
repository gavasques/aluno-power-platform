
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, BrainCircuit, Eye, Plus, Trash2, Copy } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { usePrompts } from "@/contexts/PromptsContext";
import { useToast } from "@/hooks/use-toast";
import { PromptImage, PromptFile, PromptStep } from "@/types/prompt";
import { PromptImageUpload } from "@/components/admin/prompts/PromptImageUpload";
import { PromptFileUpload } from "@/components/admin/prompts/PromptFileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PromptForm = () => {
  const [, setLocation] = useLocation();
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
    stepCount: 1,
    steps: [] as PromptStep[],
    images: [] as PromptImage[],
    files: [] as PromptFile[],
  });

  useEffect(() => {
    if (currentPrompt) {
      const steps = currentPrompt.steps?.length > 0 
        ? currentPrompt.steps 
        : [{
            id: '1',
            title: 'Passo 1',
            content: currentPrompt.content,
            explanation: 'Execute este prompt para obter o resultado desejado.',
            order: 1
          }];

      setFormData({
        title: currentPrompt.title,
        content: currentPrompt.content,
        categoryId: currentPrompt.category.id,
        description: currentPrompt.description || '',
        usageExamples: currentPrompt.usageExamples || '',
        stepCount: currentPrompt.stepCount || 1,
        steps: steps,
        images: currentPrompt.images || [],
        files: currentPrompt.files || [],
      });
    }
  }, [currentPrompt]);

  const initializeSteps = (count: number) => {
    const newSteps: PromptStep[] = [];
    for (let i = 1; i <= count; i++) {
      const existingStep = formData.steps.find(s => s.order === i);
      newSteps.push(existingStep || {
        id: Date.now().toString() + i,
        title: `Passo ${i}`,
        content: i === 1 ? formData.content : '',
        explanation: i === 1 
          ? 'Execute este prompt para obter o resultado desejado.' 
          : `Agora execute este segundo passo com base no resultado anterior.`,
        order: i
      });
    }
    return newSteps;
  };

  const handleStepCountChange = (count: number) => {
    const newSteps = initializeSteps(count);
    setFormData(prev => ({
      ...prev,
      stepCount: count,
      steps: newSteps,
      content: newSteps[0]?.content || prev.content
    }));
  };

  const handleStepChange = (stepId: string, field: keyof PromptStep, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      ),
      // Sincronizar o primeiro passo com o campo content principal
      content: field === 'content' && prev.steps.find(s => s.id === stepId)?.order === 1 
        ? value 
        : prev.content
    }));
  };

  const copyStepContent = async (content: string, stepTitle: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Conteúdo copiado!",
        description: `O conteúdo do ${stepTitle} foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar se todos os passos têm conteúdo
    const hasEmptySteps = formData.steps.some(step => !step.content.trim());
    if (hasEmptySteps) {
      toast({
        title: "Erro",
        description: "Todos os passos devem ter conteúdo.",
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
      setLocation('/admin/conteudo/prompts-ia');
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

  const handleInputChange = (field: string, value: string | number | PromptImage[] | PromptFile[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para destacar conteúdo dentro de {} e []
  const highlightPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]*\]|\{[^}]*\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\[[^\]]*\]$/) || part.match(/^\{[^}]*\}$/)) {
        return (
          <span 
            key={index} 
            className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Inicializar passos se necessário
  useEffect(() => {
    if (formData.stepCount > 0 && formData.steps.length === 0) {
      handleStepCountChange(formData.stepCount);
    }
  }, [formData.stepCount]);

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
            <Label htmlFor="stepCount">Quantidade de Passos</Label>
            <Select
              value={formData.stepCount.toString()}
              onValueChange={(value) => handleStepCountChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Passo' : 'Passos'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passos do Prompt */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Passos do Prompt</h3>
            {formData.steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <Card key={step.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{step.title}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyStepContent(step.content, step.title)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Explicação do Passo</Label>
                      <Textarea
                        value={step.explanation}
                        onChange={(e) => handleStepChange(step.id, 'explanation', e.target.value)}
                        placeholder="Explique como usar este passo..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo do Prompt *</Label>
                      <Textarea
                        value={step.content}
                        onChange={(e) => handleStepChange(step.id, 'content', e.target.value)}
                        placeholder="Digite o conteúdo do prompt..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    {/* Preview do conteúdo */}
                    {step.content && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Preview do Conteúdo
                        </Label>
                        <div className="bg-gray-50 border rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                            {highlightPlaceholders(step.content)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
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

          <PromptImageUpload
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
          />

          <PromptFileUpload
            files={formData.files}
            onFilesChange={(files) => handleInputChange('files', files)}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin/conteudo/prompts-ia')}
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

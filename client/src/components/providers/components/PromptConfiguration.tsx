// Prompt Configuration Component - Configurable prompts with placeholders

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Code, Eye, EyeOff } from "lucide-react";
import { ProviderConfiguration, PromptPlaceholder } from '../types';
import { PROMPT_TEMPLATES, COMMON_PLACEHOLDERS } from '../constants';

interface PromptConfigurationProps {
  configuration: ProviderConfiguration;
  onConfigurationChange: (updates: Partial<ProviderConfiguration>) => void;
  showPreview?: boolean;
}

export function PromptConfiguration({ 
  configuration, 
  onConfigurationChange,
  showPreview = true 
}: PromptConfigurationProps) {
  const [showPlaceholderPreview, setShowPlaceholderPreview] = useState(false);
  const [newPlaceholder, setNewPlaceholder] = useState<Partial<PromptPlaceholder>>({
    type: 'text',
    required: false
  });

  // Add placeholder to configuration
  const addPlaceholder = () => {
    if (!newPlaceholder.key || !newPlaceholder.label) return;
    
    const placeholder: PromptPlaceholder = {
      key: newPlaceholder.key,
      label: newPlaceholder.label,
      description: newPlaceholder.description || '',
      type: newPlaceholder.type || 'text',
      required: newPlaceholder.required || false,
      defaultValue: newPlaceholder.defaultValue || '',
      options: newPlaceholder.options || []
    };

    const updatedPlaceholders = [...(configuration.placeholders || []), placeholder];
    onConfigurationChange({ placeholders: updatedPlaceholders });
    
    // Reset form
    setNewPlaceholder({ type: 'text', required: false });
  };

  // Remove placeholder
  const removePlaceholder = (index: number) => {
    const updatedPlaceholders = configuration.placeholders?.filter((_, i) => i !== index) || [];
    onConfigurationChange({ placeholders: updatedPlaceholders });
  };

  // Update placeholder
  const updatePlaceholder = (index: number, updates: Partial<PromptPlaceholder>) => {
    const updatedPlaceholders = configuration.placeholders?.map((placeholder, i) => 
      i === index ? { ...placeholder, ...updates } : placeholder
    ) || [];
    onConfigurationChange({ placeholders: updatedPlaceholders });
  };

  // Load template
  const loadTemplate = (templateKey: string) => {
    const template = PROMPT_TEMPLATES[templateKey as keyof typeof PROMPT_TEMPLATES];
    if (template) {
      onConfigurationChange({ 
        promptTemplate: template,
        placeholders: [...COMMON_PLACEHOLDERS]
      });
    }
  };

  // Add common placeholder
  const addCommonPlaceholder = (placeholder: PromptPlaceholder) => {
    const existing = configuration.placeholders?.find(p => p.key === placeholder.key);
    if (!existing) {
      const updatedPlaceholders = [...(configuration.placeholders || []), placeholder];
      onConfigurationChange({ placeholders: updatedPlaceholders });
    }
  };

  // Generate preview with placeholders replaced
  const generatePreview = () => {
    let preview = configuration.promptTemplate || '';
    
    configuration.placeholders?.forEach(placeholder => {
      const value = placeholder.defaultValue || `[${placeholder.label}]`;
      preview = preview.replace(new RegExp(`{{${placeholder.key}}}`, 'g'), value);
    });
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* System Prompt */}
      <div className="space-y-2">
        <Label htmlFor="systemPrompt" className="text-sm font-medium">
          Prompt do Sistema
        </Label>
        <Textarea
          id="systemPrompt"
          placeholder="Instruções gerais para o modelo de IA..."
          value={configuration.systemPrompt || ''}
          onChange={(e) => onConfigurationChange({ systemPrompt: e.target.value })}
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          Define o comportamento geral e personalidade do modelo de IA.
        </p>
      </div>

      {/* Prompt Template */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Template do Prompt</Label>
          <div className="flex items-center gap-2">
            <Select onValueChange={loadTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Carregar template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon_listing">Amazon Listing</SelectItem>
                <SelectItem value="content_generation">Geração de Conteúdo</SelectItem>
                <SelectItem value="product_analysis">Análise de Produto</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlaceholderPreview(!showPlaceholderPreview)}
            >
              {showPlaceholderPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Template do prompt com placeholders (ex: Analise o produto {{product_name}} considerando {{target_audience}}...)"
          value={configuration.promptTemplate || ''}
          onChange={(e) => onConfigurationChange({ promptTemplate: e.target.value })}
          className="min-h-[150px] font-mono text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Use <code className="bg-muted px-1 rounded">{"{{placeholder_name}}"}</code> para criar campos dinâmicos.
        </p>

        {/* Preview */}
        {showPreview && showPlaceholderPreview && configuration.promptTemplate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview com Valores Padrão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                {generatePreview()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Placeholders Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Placeholders Configurados</Label>
          <Badge variant="secondary">
            {configuration.placeholders?.length || 0} placeholders
          </Badge>
        </div>

        {/* Common Placeholders */}
        <div>
          <Label className="text-xs text-muted-foreground">Placeholders Comuns:</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {COMMON_PLACEHOLDERS.map((placeholder) => (
              <Button
                key={placeholder.key}
                variant="outline"
                size="sm"
                onClick={() => addCommonPlaceholder(placeholder)}
                disabled={configuration.placeholders?.some(p => p.key === placeholder.key)}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {placeholder.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Existing Placeholders */}
        {configuration.placeholders?.map((placeholder, index) => (
          <Card key={placeholder.key} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Chave</Label>
                <Input
                  value={placeholder.key}
                  onChange={(e) => updatePlaceholder(index, { key: e.target.value })}
                  placeholder="nome_do_campo"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Rótulo</Label>
                <Input
                  value={placeholder.label}
                  onChange={(e) => updatePlaceholder(index, { label: e.target.value })}
                  placeholder="Nome do Campo"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={placeholder.type}
                  onValueChange={(value) => updatePlaceholder(index, { type: value as any })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="textarea">Texto Longo</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={placeholder.description}
                  onChange={(e) => updatePlaceholder(index, { description: e.target.value })}
                  placeholder="Descrição do campo"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Valor Padrão</Label>
                <Input
                  value={placeholder.defaultValue}
                  onChange={(e) => updatePlaceholder(index, { defaultValue: e.target.value })}
                  placeholder="Valor padrão"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={placeholder.required}
                    onCheckedChange={(checked) => updatePlaceholder(index, { required: checked })}
                  />
                  <Label className="text-xs">Obrigatório</Label>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePlaceholder(index)}
                  className="h-7"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add New Placeholder */}
        <Card className="p-4 border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nova Chave</Label>
              <Input
                value={newPlaceholder.key || ''}
                onChange={(e) => setNewPlaceholder({ ...newPlaceholder, key: e.target.value })}
                placeholder="nova_chave"
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Rótulo</Label>
              <Input
                value={newPlaceholder.label || ''}
                onChange={(e) => setNewPlaceholder({ ...newPlaceholder, label: e.target.value })}
                placeholder="Novo Campo"
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={newPlaceholder.type}
                onValueChange={(value) => setNewPlaceholder({ ...newPlaceholder, type: value as any })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="textarea">Texto Longo</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                  <SelectItem value="file">Arquivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={addPlaceholder}
              disabled={!newPlaceholder.key || !newPlaceholder.label}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Placeholder
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
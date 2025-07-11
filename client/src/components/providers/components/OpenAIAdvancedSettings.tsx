// OpenAI Advanced Settings Component - All OpenAI-specific features

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Code, Search, FileJson, Settings, Wrench } from "lucide-react";
import { ProviderConfiguration } from '../types';
import { REASONING_MODELS } from '../constants';

interface OpenAIAdvancedSettingsProps {
  configuration: ProviderConfiguration;
  onConfigurationChange: (updates: Partial<ProviderConfiguration>) => void;
  collections?: Array<{ id: number; name: string; description: string }>;
}

export function OpenAIAdvancedSettings({ 
  configuration, 
  onConfigurationChange, 
  collections = [] 
}: OpenAIAdvancedSettingsProps) {
  const isReasoningModel = REASONING_MODELS.includes(configuration.model);
  const supportsAdvancedParams = !isReasoningModel;

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-green-800">
            <Settings className="w-4 h-4" />
            Configurações Avançadas OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Reasoning Mode (for reasoning models) */}
          {isReasoningModel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Modo de Raciocínio
                </Label>
                <Badge className="bg-purple-100 text-purple-800">
                  Modelo de Raciocínio
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Nível de Esforço</Label>
                <Select
                  value={configuration.reasoning_effort || 'medium'}
                  onValueChange={(value) => onConfigurationChange({ reasoning_effort: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixo - Raciocínio rápido</SelectItem>
                    <SelectItem value="medium">Médio - Raciocínio equilibrado</SelectItem>
                    <SelectItem value="high">Alto - Raciocínio profundo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Controla a profundidade do raciocínio do modelo. Maior esforço = maior precisão + custo.
                </p>
              </div>
            </div>
          )}

          {/* Response Format */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Formato de Resposta
            </Label>
            
            <Select
              value={configuration.responseFormat || 'text'}
              onValueChange={(value) => onConfigurationChange({ responseFormat: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Normal</SelectItem>
                <SelectItem value="json_object">JSON Object</SelectItem>
                <SelectItem value="json_schema">JSON Schema</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Texto:</strong> Resposta em linguagem natural</p>
              <p><strong>JSON Object:</strong> Resposta estruturada em JSON</p>
              <p><strong>JSON Schema:</strong> JSON com validação de esquema</p>
            </div>
          </div>

          {/* Tools/Functions (only for non-reasoning models) */}
          {supportsAdvancedParams && (
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Ferramentas
              </Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      Code Interpreter
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permite execução de código Python
                    </p>
                  </div>
                  <Switch
                    checked={configuration.enableCodeInterpreter || false}
                    onCheckedChange={(checked) => onConfigurationChange({ enableCodeInterpreter: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center gap-2">
                      <Search className="w-3 h-3" />
                      Retrieval (Base de Conhecimento)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Busca em documentos da base de conhecimento
                    </p>
                  </div>
                  <Switch
                    checked={configuration.enableRetrieval || false}
                    onCheckedChange={(checked) => onConfigurationChange({ enableRetrieval: checked })}
                  />
                </div>
                
                {/* Knowledge Base Collections */}
                {configuration.enableRetrieval && collections.length > 0 && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-xs">Coleções Selecionadas</Label>
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <div key={collection.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`collection-${collection.id}`}
                            checked={configuration.selectedCollections?.includes(collection.id) || false}
                            onChange={(e) => {
                              const current = configuration.selectedCollections || [];
                              const updated = e.target.checked
                                ? [...current, collection.id]
                                : current.filter(id => id !== collection.id);
                              onConfigurationChange({ selectedCollections: updated });
                            }}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`collection-${collection.id}`} className="text-xs">
                            {collection.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Parameters (only for non-reasoning models) */}
          {supportsAdvancedParams && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Parâmetros Avançados</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seed */}
                <div className="space-y-2">
                  <Label className="text-xs">Seed (Determinístico)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 42"
                    value={configuration.seed || ''}
                    onChange={(e) => onConfigurationChange({ seed: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mesmo seed = mesma resposta
                  </p>
                </div>
                
                {/* Top P */}
                <div className="space-y-2">
                  <Label className="text-xs">Top P (Criatividade)</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[configuration.top_p || 1]}
                      onValueChange={(value) => onConfigurationChange({ top_p: value[0] })}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{(configuration.top_p || 1).toFixed(2)}</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>
                
                {/* Frequency Penalty */}
                <div className="space-y-2">
                  <Label className="text-xs">Frequency Penalty</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[configuration.frequency_penalty || 0]}
                      onValueChange={(value) => onConfigurationChange({ frequency_penalty: value[0] })}
                      min={-2}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-2</span>
                      <span>{(configuration.frequency_penalty || 0).toFixed(1)}</span>
                      <span>2</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reduz repetições de palavras
                  </p>
                </div>
                
                {/* Presence Penalty */}
                <div className="space-y-2">
                  <Label className="text-xs">Presence Penalty</Label>
                  <div className="space-y-1">
                    <Slider
                      value={[configuration.presence_penalty || 0]}
                      onValueChange={(value) => onConfigurationChange({ presence_penalty: value[0] })}
                      min={-2}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-2</span>
                      <span>{(configuration.presence_penalty || 0).toFixed(1)}</span>
                      <span>2</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Encoraja novos tópicos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fine-tuned Models */}
          <div className="space-y-2">
            <Label className="text-xs">Modelo Fine-tuned (Opcional)</Label>
            <Input
              placeholder="ft:gpt-3.5-turbo:company:model:id"
              value={configuration.fineTuneModel || ''}
              onChange={(e) => onConfigurationChange({ fineTuneModel: e.target.value })}
              className="h-8 text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              ID do modelo personalizado treinado específicamente para sua aplicação
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
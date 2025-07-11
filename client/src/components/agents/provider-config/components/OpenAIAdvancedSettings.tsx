// OpenAI Advanced Settings Component - Single responsibility for OpenAI-specific features

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Brain } from "lucide-react";
import { BaseFormData } from '../types';
import { REASONING_MODELS } from '../constants';

interface OpenAIAdvancedSettingsProps {
  formData: BaseFormData;
  onAdvancedSettingsChange: (settings: any) => void;
  collections: any[];
}

export function OpenAIAdvancedSettings({ formData, onAdvancedSettingsChange, collections }: OpenAIAdvancedSettingsProps) {
  const isReasoningModel = REASONING_MODELS.includes(formData.model);

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-green-50 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🤖</span>
        <h3 className="text-lg font-semibold text-green-800">Funcionalidades Avançadas OpenAI</h3>
      </div>

      {/* Reasoning Mode (for o3/o4-mini models) */}
      {isReasoningModel && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-green-600" />
            <Label className="text-green-800 font-medium">Modo de Raciocínio</Label>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              {formData.model} - Reasoning Model
            </Badge>
          </div>
          <p className="text-sm text-green-600">
            Este modelo usa raciocínio avançado step-by-step. O reasoning_effort controla a profundidade do raciocínio.
          </p>
          <Select 
            value={formData.reasoning_effort || 'medium'} 
            onValueChange={(value) => onAdvancedSettingsChange({ reasoning_effort: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o esforço de raciocínio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low - Raciocínio básico</SelectItem>
              <SelectItem value="medium">🟡 Medium - Raciocínio balanceado</SelectItem>
              <SelectItem value="high">🔴 High - Raciocínio profundo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Response Format */}
      <div className="space-y-3">
        <Label className="text-green-800 font-medium">Formato de Resposta</Label>
        <p className="text-sm text-green-600">
          Controla o formato de saída da resposta. JSON Object força respostas estruturadas.
        </p>
        <Select 
          value={formData.responseFormat || 'text'} 
          onValueChange={(value) => onAdvancedSettingsChange({ responseFormat: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto Normal</SelectItem>
            <SelectItem value="json_object">JSON Object</SelectItem>
            <SelectItem value="json_schema">JSON Schema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tools/Functions - Hidden for reasoning models */}
      {!isReasoningModel && (
        <div className="space-y-3">
          <Label className="text-green-800 font-medium">Tools & Functions</Label>
          <p className="text-sm text-green-600">
            Habilita ferramentas especiais para o modelo executar tarefas específicas.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="enableCodeInterpreter"
                checked={formData.enableCodeInterpreter}
                onCheckedChange={(checked) => onAdvancedSettingsChange({ enableCodeInterpreter: checked })}
              />
              <Label htmlFor="enableCodeInterpreter" className="text-sm">
                Code Interpreter (execução de Python)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableRetrieval"
                checked={formData.enableRetrieval}
                onCheckedChange={(checked) => onAdvancedSettingsChange({ enableRetrieval: checked })}
              />
              <Label htmlFor="enableRetrieval" className="text-sm">
                Retrieval (busca em documentos)
              </Label>
            </div>
          </div>

          {/* Collection selector when retrieval is enabled */}
          {formData.enableRetrieval && collections.length > 0 && (
            <div>
              <Label htmlFor="collections" className="text-sm text-green-700">
                Coleções da Base de Conhecimento
              </Label>
              <Select
                value={formData.selectedCollections?.[0]?.toString() || "none"}
                onValueChange={(value) => {
                  onAdvancedSettingsChange({
                    selectedCollections: value === "none" ? [] : [parseInt(value)]
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma coleção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma coleção selecionada</SelectItem>
                  {collections.map((collection: any) => (
                    <SelectItem key={collection.id} value={collection.id.toString()}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
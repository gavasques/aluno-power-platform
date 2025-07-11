// Grok Advanced Settings Component - Single responsibility for Grok-specific features

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Brain, Search, Eye } from "lucide-react";
import { BaseFormData } from '../types';

interface GrokAdvancedSettingsProps {
  formData: BaseFormData;
  onAdvancedSettingsChange: (settings: any) => void;
}

export function GrokAdvancedSettings({ formData, onAdvancedSettingsChange }: GrokAdvancedSettingsProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-indigo-50 border-indigo-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧪</span>
        <h3 className="text-lg font-semibold text-indigo-800">Funcionalidades Especiais do Grok</h3>
      </div>

      {/* Reasoning Level */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <Label className="text-indigo-800 font-medium">
            Nível de Raciocínio (Think Level)
          </Label>
        </div>
        <p className="text-sm text-indigo-600">
          Controla a profundidade do raciocínio do modelo. "High" gera respostas mais detalhadas e reflexivas.
        </p>
        <Select 
          value={formData.reasoningLevel} 
          onValueChange={(value) => onAdvancedSettingsChange({ reasoningLevel: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disabled">⚪ Desabilitado</SelectItem>
            <SelectItem value="low">🔸 Low (Rápido)</SelectItem>
            <SelectItem value="high">🔹 High (Profundo)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Live Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-600" />
          <Label className="text-indigo-800 font-medium">
            Busca em Tempo Real
          </Label>
        </div>
        <p className="text-sm text-indigo-600">
          Permite que o modelo busque informações atuais na web durante a geração de respostas.
        </p>
        <div className="flex items-center space-x-2">
          <Switch
            id="enableSearch"
            checked={formData.enableSearch}
            onCheckedChange={(checked) => onAdvancedSettingsChange({ enableSearch: checked })}
          />
          <Label htmlFor="enableSearch" className="text-sm">
            Habilitar busca ao vivo
          </Label>
        </div>
      </div>

      {/* Image Understanding */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-indigo-600" />
          <Label className="text-indigo-800 font-medium">
            Compreensão de Imagens
          </Label>
        </div>
        <p className="text-sm text-indigo-600">
          Habilita análise e descrição detalhada de imagens enviadas para o modelo.
        </p>
        <div className="flex items-center space-x-2">
          <Switch
            id="enableImageUnderstanding"
            checked={formData.enableImageUnderstanding}
            onCheckedChange={(checked) => onAdvancedSettingsChange({ enableImageUnderstanding: checked })}
          />
          <Label htmlFor="enableImageUnderstanding" className="text-sm">
            Habilitar compreensão de imagens
          </Label>
        </div>
      </div>
    </div>
  );
}
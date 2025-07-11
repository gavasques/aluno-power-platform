// Model Selector Component - Single responsibility for model selection

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ModelInfo } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  availableModels: ModelInfo[];
  compact?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, availableModels, compact = false }: ModelSelectorProps) {
  return (
    <div>
      <Label htmlFor="model">Modelo</Label>
      <Select
        value={selectedModel}
        onValueChange={onModelChange}
        disabled={availableModels.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um modelo" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model: ModelInfo) => (
            <SelectItem key={model.model} value={model.model}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{model.model}</span>
                  {model.recommended && (
                    <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      Recomendado
                    </Badge>
                  )}
                </div>
                {!compact && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-gray-500">
                      {model.maxTokens.toLocaleString()} tokens
                    </span>
                    <span className="text-xs text-green-600">
                      ${((model.inputCostPer1M + model.outputCostPer1M) / 1000).toFixed(3)}/1K
                    </span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
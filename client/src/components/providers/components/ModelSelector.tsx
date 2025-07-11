// Model Selector Component - Enhanced with cost information and capabilities

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Zap, Eye, Brain, Image } from "lucide-react";
import { ModelInfo } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  availableModels: ModelInfo[];
  compact?: boolean;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  availableModels,
  compact = false 
}: ModelSelectorProps) {
  const selectedModelInfo = availableModels.find(m => m.model === selectedModel);

  const formatCost = (cost: number) => {
    if (cost >= 1) return `$${cost.toFixed(2)}`;
    return `$${cost.toFixed(4)}`;
  };

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'vision': return <Eye className="w-3 h-3" />;
      case 'reasoning': return <Brain className="w-3 h-3" />;
      case 'image_generation': return <Image className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="model" className="text-sm font-medium">
          Modelo de IA
        </Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um modelo" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {availableModels.map((model: ModelInfo) => (
              <SelectItem key={model.model} value={model.model} className="flex-col items-start p-3">
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.model}</span>
                      {model.recommended && (
                        <Badge className="bg-blue-100 text-blue-800">Recomendado</Badge>
                      )}
                    </div>
                    {!compact && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          In: {formatCost(model.inputCostPer1M)}/1M
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Out: {formatCost(model.outputCostPer1M)}/1M
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {model.maxTokens.toLocaleString()} tokens
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!compact && model.capabilities && model.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs flex items-center gap-1">
                        {getCapabilityIcon(capability)}
                        {capability}
                      </Badge>
                    ))}
                  </div>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Details Card */}
      {selectedModelInfo && !compact && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Custo de Entrada</p>
                <p className="font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCost(selectedModelInfo.inputCostPer1M)} / 1M tokens
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Custo de Saída</p>
                <p className="font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatCost(selectedModelInfo.outputCostPer1M)} / 1M tokens
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Limite de Tokens</p>
                <p className="font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {selectedModelInfo.maxTokens.toLocaleString()}
                </p>
              </div>
            </div>
            
            {selectedModelInfo.capabilities && selectedModelInfo.capabilities.length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm mb-2">Capacidades:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModelInfo.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs flex items-center gap-1">
                      {getCapabilityIcon(capability)}
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Zap } from "lucide-react";

interface ModelConfig {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
}

interface ModelSelectorProps {
  provider: string;
  selectedModel: string;
  models: ModelConfig[];
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  provider,
  selectedModel,
  models,
  onModelChange
}: ModelSelectorProps) {
  const providerModels = models.filter(m => m.provider === provider);

  const formatCurrency = (cost: number) => {
    return cost < 1 ? `$${cost.toFixed(3)}` : `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  return (
    <div>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um modelo" />
        </SelectTrigger>
        <SelectContent>
          {providerModels.map((model) => (
            <SelectItem key={model.model} value={model.model}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{model.model}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className="text-xs px-1">
                    <Zap className="w-3 h-3 mr-1" />
                    {formatTokens(model.maxTokens)}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formatCurrency(model.inputCostPer1M)}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedModel && (
        <div className="mt-2 text-sm text-muted-foreground">
          {(() => {
            const model = providerModels.find(m => m.model === selectedModel);
            if (!model) return null;
            return (
              <div className="flex items-center gap-4">
                <span>{formatTokens(model.maxTokens)} tokens</span>
                <span>{formatCurrency(model.inputCostPer1M)}/{formatCurrency(model.outputCostPer1M)} por 1M</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
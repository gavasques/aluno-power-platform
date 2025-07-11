// Token Control Component - Input with validation and cost estimation

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertTriangle, DollarSign } from "lucide-react";

interface TokenControlProps {
  maxTokens: number;
  onMaxTokensChange: (maxTokens: number) => void;
  modelMaxTokens?: number;
  inputCostPer1M?: number;
  outputCostPer1M?: number;
}

export function TokenControl({ 
  maxTokens, 
  onMaxTokensChange, 
  modelMaxTokens = 4096,
  inputCostPer1M = 0,
  outputCostPer1M = 0
}: TokenControlProps) {
  const isExceedingLimit = maxTokens > modelMaxTokens;
  const estimatedCost = ((maxTokens * outputCostPer1M) / 1000000);

  const getTokenLevel = (tokens: number, maxAllowed: number) => {
    const percentage = (tokens / maxAllowed) * 100;
    if (percentage <= 25) return { label: 'Baixo', color: 'bg-green-100 text-green-800' };
    if (percentage <= 50) return { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage <= 75) return { label: 'Alto', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Máximo', color: 'bg-red-100 text-red-800' };
  };

  const tokenLevel = getTokenLevel(maxTokens, modelMaxTokens);

  const formatCost = (cost: number) => {
    if (cost >= 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(6)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Máximo de Tokens
        </Label>
        <div className="flex items-center gap-2">
          <Badge className={tokenLevel.color}>
            {tokenLevel.label}
          </Badge>
          {estimatedCost > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCost(estimatedCost)}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Input
          type="number"
          value={maxTokens}
          onChange={(e) => onMaxTokensChange(Number(e.target.value))}
          min={1}
          max={modelMaxTokens}
          step={1}
          className={isExceedingLimit ? 'border-red-500 focus:border-red-500' : ''}
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Mínimo: 1</span>
          <span>Máximo: {modelMaxTokens.toLocaleString()}</span>
        </div>
      </div>
      
      {isExceedingLimit && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            O valor excede o limite máximo de {modelMaxTokens.toLocaleString()} tokens para este modelo.
          </AlertDescription>
        </Alert>
      )}
      
      {estimatedCost > 0 && (
        <div className="text-xs text-muted-foreground">
          <p><strong>Custo estimado:</strong> {formatCost(estimatedCost)} para {maxTokens.toLocaleString()} tokens de saída</p>
          <p>Baseado no preço de saída de {formatCost(outputCostPer1M)} por 1M tokens</p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Tokens:</strong> Unidades de texto processadas pelo modelo</p>
        <p><strong>1 token:</strong> Aproximadamente 4 caracteres em português</p>
        <p><strong>Custo:</strong> Cobrado pelos tokens de entrada + tokens de saída</p>
      </div>
    </div>
  );
}
// Token Control Component - Single responsibility for token limit setting

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ModelInfo } from '../types';

interface TokenControlProps {
  maxTokens: number;
  onMaxTokensChange: (maxTokens: number) => void;
  selectedModel?: ModelInfo;
}

export function TokenControl({ maxTokens, onMaxTokensChange, selectedModel }: TokenControlProps) {
  return (
    <div>
      <Label htmlFor="maxTokens">Máximo de Tokens</Label>
      <div className="text-sm text-gray-500 mb-2">
        Limite de tokens para resposta
        {selectedModel && (
          <span className="text-xs ml-2">
            (máximo: {selectedModel.maxTokens.toLocaleString()})
          </span>
        )}
      </div>
      <Input
        id="maxTokens"
        type="number"
        min="1"
        max={selectedModel?.maxTokens || 256000}
        value={maxTokens}
        onChange={(e) => onMaxTokensChange(parseInt(e.target.value) || 1000)}
        className="w-full"
      />
    </div>
  );
}
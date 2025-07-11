// Claude Advanced Settings Component - Single responsibility for Claude-specific features

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, AlertTriangle } from "lucide-react";
import { BaseFormData } from '../types';
import { CLAUDE_EXTENDED_THINKING_MODELS } from '../constants';

interface ClaudeAdvancedSettingsProps {
  formData: BaseFormData;
  onAdvancedSettingsChange: (settings: any) => void;
}

export function ClaudeAdvancedSettings({ formData, onAdvancedSettingsChange }: ClaudeAdvancedSettingsProps) {
  const supportsExtendedThinking = CLAUDE_EXTENDED_THINKING_MODELS.includes(formData.model);

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-purple-50 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h3 className="text-lg font-semibold text-purple-800">Funcionalidades Avançadas Claude</h3>
      </div>

      {/* Extended Thinking */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" />
          <Label className="text-purple-800 font-medium">
            Extended Thinking
          </Label>
        </div>
        <p className="text-sm text-purple-600">
          Permite que o Claude use raciocínio estendido para problemas complexos. Consome tokens adicionais.
        </p>
        
        {supportsExtendedThinking ? (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableExtendedThinking"
                checked={formData.enableExtendedThinking}
                onCheckedChange={(checked) => onAdvancedSettingsChange({ enableExtendedThinking: checked })}
              />
              <Label htmlFor="enableExtendedThinking" className="text-sm">
                Habilitar Extended Thinking
              </Label>
            </div>

            {formData.enableExtendedThinking && (
              <div>
                <Label htmlFor="thinkingBudgetTokens" className="text-sm">
                  Budget de Tokens para Raciocínio
                </Label>
                <div className="px-4">
                  <Slider
                    id="thinkingBudgetTokens"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={[formData.thinkingBudgetTokens || 10000]}
                    onValueChange={(value) => 
                      onAdvancedSettingsChange({ thinkingBudgetTokens: value[0] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{(formData.thinkingBudgetTokens || 10000).toLocaleString()} tokens</span>
                    <span>Recomendado: 10K-20K para problemas complexos</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert className="bg-purple-100 border-purple-200">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm text-purple-700">
              Extended Thinking está disponível apenas para:
              <ul className="list-disc list-inside mt-1">
                <li>claude-opus-4-20250514</li>
                <li>claude-sonnet-4-20250514</li>
                <li>claude-3-7-sonnet-20250219</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
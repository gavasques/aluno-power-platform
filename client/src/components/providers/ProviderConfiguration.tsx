import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import ModelSelector from "./ModelSelector";

interface ModelConfig {
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxTokens: number;
}

interface ConfigurationData {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface ProviderConfigurationProps {
  agentName: string;
  configuration: ConfigurationData;
  models: ModelConfig[];
  onConfigurationChange: (config: Partial<ConfigurationData>) => void;
}

export default function ProviderConfiguration({
  agentName,
  configuration,
  models,
  onConfigurationChange
}: ProviderConfigurationProps) {
  const selectedModelConfig = models.find(m => 
    m.provider === configuration.provider && m.model === configuration.model
  );

  const maxAllowedTokens = selectedModelConfig?.maxTokens || 4000;
  const effectiveMaxTokens = Math.min(configuration.maxTokens, maxAllowedTokens);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações - {agentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="model">Modelo</Label>
          <ModelSelector
            provider={configuration.provider}
            selectedModel={configuration.model}
            models={models}
            onModelChange={(model) => onConfigurationChange({ model })}
          />
        </div>

        <div>
          <Label htmlFor="temperature">
            Temperatura ({typeof configuration.temperature === 'number' ? configuration.temperature.toFixed(2) : '0.70'})
          </Label>
          <div className="mt-2">
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[configuration.temperature || 0.7]}
              onValueChange={([value]) => onConfigurationChange({ temperature: value })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>0 = mais conservador, 2 = mais criativo</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="maxTokens">Máximo de Tokens</Label>
          <div className="mt-2">
            <Input
              id="maxTokens"
              type="number"
              min={100}
              max={maxAllowedTokens}
              value={configuration.maxTokens}
              onChange={(e) => onConfigurationChange({ 
                maxTokens: Math.min(parseInt(e.target.value) || 0, maxAllowedTokens)
              })}
              placeholder="Limite de tokens para resposta"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Limite de tokens para resposta (máximo: {maxAllowedTokens.toLocaleString()})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
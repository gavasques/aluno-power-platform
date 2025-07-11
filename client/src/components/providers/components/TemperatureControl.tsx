// Temperature Control Component - Slider with visual feedback

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Thermometer } from "lucide-react";

interface TemperatureControlProps {
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function TemperatureControl({ 
  temperature, 
  onTemperatureChange, 
  disabled = false,
  min = 0,
  max = 2,
  step = 0.1
}: TemperatureControlProps) {
  const getTemperatureLevel = (temp: number) => {
    if (temp <= 0.3) return { label: 'Muito Conservador', color: 'bg-blue-100 text-blue-800' };
    if (temp <= 0.6) return { label: 'Conservador', color: 'bg-green-100 text-green-800' };
    if (temp <= 1.0) return { label: 'Equilibrado', color: 'bg-yellow-100 text-yellow-800' };
    if (temp <= 1.5) return { label: 'Criativo', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Muito Criativo', color: 'bg-red-100 text-red-800' };
  };

  const temperatureLevel = getTemperatureLevel(temperature);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Thermometer className="w-4 h-4" />
          Temperatura
        </Label>
        <Badge className={temperatureLevel.color}>
          {temperatureLevel.label}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="px-3">
          <Slider
            value={[temperature]}
            onValueChange={(value) => onTemperatureChange(value[0])}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Preciso</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={temperature}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              className="w-16 h-6 text-xs text-center"
            />
          </div>
          <span>Criativo</span>
        </div>
      </div>
      
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Este modelo não suporta controle de temperatura
        </p>
      )}
      
      {!disabled && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>0.0-0.3:</strong> Respostas muito precisas e determinísticas</p>
          <p><strong>0.4-0.7:</strong> Equilibrio entre precisão e criatividade</p>
          <p><strong>0.8-1.0:</strong> Respostas mais variadas e criativas</p>
          <p><strong>1.1-2.0:</strong> Muito criativo, pode ser impreciso</p>
        </div>
      )}
    </div>
  );
}
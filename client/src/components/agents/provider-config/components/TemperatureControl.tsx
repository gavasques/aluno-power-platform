// Temperature Control Component - Single responsibility for temperature setting

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TemperatureControlProps {
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  disabled?: boolean;
}

export function TemperatureControl({ temperature, onTemperatureChange, disabled = false }: TemperatureControlProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="temperature" className={disabled ? "text-muted-foreground" : ""}>
        Temperatura ({typeof temperature === 'number' ? temperature.toFixed(2) : temperature})
        {disabled && <span className="text-xs ml-2">(Não disponível para este modelo)</span>}
      </Label>
      <div className="px-4">
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[temperature]}
          onValueChange={(value) => onTemperatureChange(value[0])}
          className={`w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 = mais conservador, 2 = mais criativo</span>
        </div>
      </div>
    </div>
  );
}
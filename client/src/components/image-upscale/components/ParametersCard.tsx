/**
 * Parameters configuration card component
 */

import { Sparkles } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SCALE_OPTIONS, FORMAT_OPTIONS } from '../constants';
import type { ImageUpscaleParams } from '../types';

interface ParametersCardProps {
  parameters: ImageUpscaleParams;
  onParameterChange: (key: keyof ImageUpscaleParams, value: string) => void;
}

export const ParametersCard = ({
  parameters,
  onParameterChange
}: ParametersCardProps) => {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Configurações
        </CardTitle>
        <CardDescription>
          Configure os parâmetros para o upscale da imagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scale Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fator de Aumento</label>
          <Select 
            value={parameters.scale} 
            onValueChange={(value) => onParameterChange('scale', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Escolha o fator de aumento da resolução
          </p>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Formato de Saída</label>
          <Select 
            value={parameters.format} 
            onValueChange={(value) => onParameterChange('format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
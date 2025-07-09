import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { ConfiguracaoSimulacao } from '../types';
import { formatCurrency, sanitizeNumericInput } from '../utils';

interface ConfigurationPanelProps {
  config: ConfiguracaoSimulacao;
  onConfigChange: (config: ConfiguracaoSimulacao) => void;
}

export function ConfigurationPanel({ config, onConfigChange }: ConfigurationPanelProps) {
  const handleFieldChange = (field: keyof ConfiguracaoSimulacao, value: any) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const handleNumericInputChange = (field: keyof ConfiguracaoSimulacao, value: string) => {
    const numericValue = sanitizeNumericInput(value);
    handleFieldChange(field, numericValue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Configuração da Simulação
        </CardTitle>
        <CardDescription>
          Configure os parâmetros básicos do seu investimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Investimento Inicial */}
          <div className="space-y-2">
            <Label htmlFor="investimento-inicial">Investimento Inicial</Label>
            <Input
              id="investimento-inicial"
              type="text"
              value={config.investimentoInicial.toString()}
              onChange={(e) => handleNumericInputChange('investimentoInicial', e.target.value)}
              placeholder="Ex: 10000"
            />
            <p className="text-sm text-muted-foreground">
              {formatCurrency(config.investimentoInicial)}
            </p>
          </div>

          {/* Duração do Giro */}
          <div className="space-y-2">
            <Label htmlFor="duracao-giro">Duração do Giro</Label>
            <div className="flex gap-2">
              <Input
                id="duracao-giro"
                type="number"
                value={config.duracaoGiro}
                onChange={(e) => handleFieldChange('duracaoGiro', parseInt(e.target.value) || 0)}
                placeholder="Ex: 45"
                className="flex-1"
              />
              <Select
                value={config.unidadeTempo}
                onValueChange={(value: 'Dias' | 'Semanas' | 'Meses') => 
                  handleFieldChange('unidadeTempo', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dias">Dias</SelectItem>
                  <SelectItem value="Semanas">Semanas</SelectItem>
                  <SelectItem value="Meses">Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Número de Giros */}
          <div className="space-y-2">
            <Label htmlFor="numero-giros">Número de Giros</Label>
            <Input
              id="numero-giros"
              type="number"
              value={config.numeroGiros}
              onChange={(e) => handleFieldChange('numeroGiros', parseInt(e.target.value) || 0)}
              placeholder="Ex: 12"
              min="1"
              max="100"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
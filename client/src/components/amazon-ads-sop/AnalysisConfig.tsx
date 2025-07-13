import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, TrendingUp, Shield, Zap } from 'lucide-react';
import { AnalysisConfig as AnalysisConfigType } from './types';

interface AnalysisConfigProps {
  config: AnalysisConfigType;
  onConfigChange: (config: AnalysisConfigType) => void;
  estimatedPrice: number;
}

export const AnalysisConfig: React.FC<AnalysisConfigProps> = ({
  config,
  onConfigChange,
  estimatedPrice
}) => {
  const priceRanges = [
    { value: 'auto', label: 'Detectar Automaticamente', price: estimatedPrice },
    { value: '50', label: 'Até $50', price: 50 },
    { value: '100', label: '$50 - $100', price: 100 },
    { value: '200', label: '$100 - $200', price: 200 },
    { value: '200+', label: 'Acima de $200', price: 300 }
  ];

  const analysisMode = [
    { 
      value: 'conservative', 
      label: 'Conservador',
      description: 'Mudanças graduais, menor risco',
      icon: Shield,
      color: 'text-green-600 bg-green-50'
    },
    { 
      value: 'aggressive', 
      label: 'Agressivo',
      description: 'Otimizações mais drásticas, maior impacto',
      icon: Zap,
      color: 'text-red-600 bg-red-50'
    }
  ];

  const getTolerances = (priceRange: string, mode: string) => {
    const baseTolerances = {
      '50': { low: 10, medium: 15, high: 20 },
      '100': { low: 20, medium: 30, high: 40 },
      '200': { low: 30, medium: 45, high: 60 },
      '200+': { low: 40, medium: 60, high: 80 },
      'auto': estimatedPrice <= 50 * 5.5 ? { low: 10, medium: 15, high: 20 } :
              estimatedPrice <= 100 * 5.5 ? { low: 20, medium: 30, high: 40 } :
              estimatedPrice <= 200 * 5.5 ? { low: 30, medium: 45, high: 60 } :
              { low: 40, medium: 60, high: 80 }
    };

    const base = baseTolerances[priceRange as keyof typeof baseTolerances] || baseTolerances['100'];
    
    if (mode === 'aggressive') {
      return {
        low: Math.round(base.low * 0.7),
        medium: Math.round(base.medium * 0.7),
        high: Math.round(base.high * 0.7)
      };
    }
    
    return base;
  };

  const currentTolerances = config.customTolerances || getTolerances(config.priceRange, config.analysisMode);

  const updateConfig = (updates: Partial<AnalysisConfigType>) => {
    const newConfig = { ...config, ...updates };
    
    // Sempre recalcular tolerâncias quando mudar o modo ou faixa de preço
    if ('analysisMode' in updates || 'priceRange' in updates) {
      newConfig.customTolerances = undefined; // Limpar customizações para forçar recálculo
    }
    
    onConfigChange(newConfig);
  };

  const updateCustomTolerance = (type: 'low' | 'medium' | 'high', value: number) => {
    const newTolerances = {
      ...currentTolerances,
      [type]: value
    };
    
    updateConfig({ customTolerances: newTolerances });
  };

  const resetToDefault = () => {
    const defaultTolerances = getTolerances(config.priceRange, config.analysisMode);
    updateConfig({ customTolerances: defaultTolerances });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações da Análise SOP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Faixa de Preço */}
        <div className="space-y-3">
          <h4 className="font-medium">Faixa de Preço do Produto</h4>
          <Select value={config.priceRange} onValueChange={(value) => updateConfig({ priceRange: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{range.label}</span>
                    {range.value === 'auto' && estimatedPrice > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        ~R$ {estimatedPrice.toFixed(0)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            A faixa de preço determina as tolerâncias para cliques sem conversão
          </p>
        </div>

        {/* Modo de Análise */}
        <div className="space-y-3">
          <h4 className="font-medium">Modo de Análise</h4>
          <div className="grid grid-cols-2 gap-3">
            {analysisMode.map(mode => {
              const Icon = mode.icon;
              const isSelected = config.analysisMode === mode.value;
              
              return (
                <div
                  key={mode.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig({ analysisMode: mode.value as any })}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${mode.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h5 className="font-medium">{mode.label}</h5>
                  <p className="text-xs text-gray-600 mt-1">{mode.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tolerâncias Personalizadas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Tolerâncias de Cliques (Avançado)</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetToDefault}
            >
              Resetar Padrão
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Baixa</label>
                <span className="text-sm text-gray-500">{currentTolerances.low} cliques</span>
              </div>
              <Slider
                value={[currentTolerances.low]}
                onValueChange={([value]) => updateCustomTolerance('low', value)}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Redução de 10% no lance</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Média</label>
                <span className="text-sm text-gray-500">{currentTolerances.medium} cliques</span>
              </div>
              <Slider
                value={[currentTolerances.medium]}
                onValueChange={([value]) => updateCustomTolerance('medium', value)}
                max={80}
                min={10}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Redução de 20% no lance</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Alta</label>
                <span className="text-sm text-gray-500">{currentTolerances.high} cliques</span>
              </div>
              <Slider
                value={[currentTolerances.high]}
                onValueChange={([value]) => updateCustomTolerance('high', value)}
                max={120}
                min={15}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Desativar keyword</p>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Dica:</strong> Valores menores resultam em ações mais agressivas. 
              Ajuste conforme sua tolerância ao risco e metas de performance.
            </p>
          </div>
        </div>

        {/* Resumo da Configuração */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Resumo da Configuração</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Faixa de preço:</span>
              <span className="ml-2 font-medium">
                {priceRanges.find(r => r.value === config.priceRange)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Modo:</span>
              <span className="ml-2 font-medium">
                {analysisMode.find(m => m.value === config.analysisMode)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Redução de lance:</span>
              <span className="ml-2 font-medium">{currentTolerances.low}-{currentTolerances.medium} cliques</span>
            </div>
            <div>
              <span className="text-gray-600">Desativação:</span>
              <span className="ml-2 font-medium">≥{currentTolerances.high} cliques</span>
            </div>
          </div>
          
          {/* Indicador visual do modo agressivo */}
          {config.analysisMode === 'aggressive' && (
            <div className="mt-3 p-2 bg-orange-100 text-orange-800 rounded-md text-xs">
              <strong>Modo Agressivo Ativo:</strong> As tolerâncias foram reduzidas em 30% para otimizações mais rápidas e drásticas
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
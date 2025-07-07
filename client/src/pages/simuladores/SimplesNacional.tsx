import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Brazilian number formatting utilities
const formatBrazilianNumber = (value: number, decimals: number = 2): string => {
  if (value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const parseBrazilianNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  const cleanValue = value
    .replace(/\./g, '')  // Remove dots
    .replace(',', '.');  // Replace comma with dot
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Custom Brazilian number input component
interface BrazilianNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  placeholder?: string;
}

const BrazilianNumberInput = ({ 
  value, 
  onChange, 
  decimals = 2, 
  min, 
  max, 
  className, 
  id, 
  placeholder 
}: BrazilianNumberInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseBrazilianNumber(inputValue);
    
    let constrainedValue = numericValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    onChange(constrainedValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value !== 0) {
      setDisplayValue(formatBrazilianNumber(value, decimals));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <Input
      id={id}
      className={className}
      value={isFocused ? displayValue : (value === 0 ? '' : formatBrazilianNumber(value, decimals))}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};

interface SimplesNacionalData {
  receitaBrutaAnual: number;
  anexo: 'I' | 'II' | 'III' | 'IV' | 'V';
  receita12Meses: number;
}

export default function SimplesNacional() {
  const [data, setData] = useState<SimplesNacionalData>({
    receitaBrutaAnual: 0,
    anexo: 'I',
    receita12Meses: 0
  });

  // Simples Nacional tax tables (2024)
  const anexoIRanges = [
    { min: 0, max: 180000, aliquota: 4.0, deducao: 0 },
    { min: 180000.01, max: 360000, aliquota: 7.3, deducao: 5940 },
    { min: 360000.01, max: 720000, aliquota: 9.5, deducao: 13860 },
    { min: 720000.01, max: 1800000, aliquota: 10.7, deducao: 22500 },
    { min: 1800000.01, max: 3600000, aliquota: 14.3, deducao: 87300 },
    { min: 3600000.01, max: 4800000, aliquota: 19.0, deducao: 378000 }
  ];

  const calculateTax = () => {
    const receita = data.receita12Meses || data.receitaBrutaAnual;
    
    if (receita === 0) return { aliquotaEfetiva: 0, impostoMensal: 0, impostoAnual: 0 };
    
    // Find the appropriate tax range
    const range = anexoIRanges.find(r => receita >= r.min && receita <= r.max);
    
    if (!range) {
      return { aliquotaEfetiva: 0, impostoMensal: 0, impostoAnual: 0, error: "Receita acima do limite do Simples Nacional" };
    }
    
    // Calculate effective rate
    const aliquotaEfetiva = ((receita * range.aliquota / 100) - range.deducao) / receita * 100;
    const impostoAnual = receita * aliquotaEfetiva / 100;
    const impostoMensal = impostoAnual / 12;
    
    return { aliquotaEfetiva, impostoMensal, impostoAnual };
  };

  const results = calculateTax();
  const isValidReceita = data.receita12Meses > 0 || data.receitaBrutaAnual > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="w-8 h-8" />
          Simulador Simples Nacional
        </h1>
        <p className="text-muted-foreground">
          Calcule a carga tributária do seu negócio no regime do Simples Nacional
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="receita_anual">Receita Bruta Anual Projetada (R$)</Label>
              <BrazilianNumberInput
                id="receita_anual"
                value={data.receitaBrutaAnual}
                onChange={(value) => setData(prev => ({ ...prev, receitaBrutaAnual: value }))}
                placeholder="Ex: 500.000,00"
                min={0}
              />
            </div>

            <div>
              <Label htmlFor="receita_12m">Receita Bruta Últimos 12 Meses (R$)</Label>
              <BrazilianNumberInput
                id="receita_12m"
                value={data.receita12Meses}
                onChange={(value) => setData(prev => ({ ...prev, receita12Meses: value }))}
                placeholder="Ex: 450.000,00"
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se preenchido, será usado para o cálculo ao invés da receita anual projetada
              </p>
            </div>

            <div>
              <Label>Anexo do Simples Nacional</Label>
              <div className="flex gap-2 mt-2">
                {['I', 'II', 'III', 'IV', 'V'].map((anexo) => (
                  <Button
                    key={anexo}
                    variant={data.anexo === anexo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setData(prev => ({ ...prev, anexo: anexo as any }))}
                  >
                    Anexo {anexo}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Anexo I: Comércio | Anexo II: Indústria | Anexo III: Serviços
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Atualmente simulando apenas Anexo I (Comércio). Os cálculos são baseados na tabela 2024.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            {!isValidReceita ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Informe a receita para calcular os impostos</p>
              </div>
            ) : results.error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{results.error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.aliquotaEfetiva.toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Alíquota Efetiva</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {formatBrazilianNumber(results.impostoMensal)}
                    </div>
                    <div className="text-sm text-muted-foreground">Imposto Mensal</div>
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    R$ {formatBrazilianNumber(results.impostoAnual)}
                  </div>
                  <div className="text-sm text-muted-foreground">Imposto Anual Total</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receita Base:</span>
                    <span>R$ {formatBrazilianNumber(data.receita12Meses || data.receitaBrutaAnual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anexo:</span>
                    <span>{data.anexo} - Comércio</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regime:</span>
                    <span>Simples Nacional</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Limite do Simples Nacional (2024)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Receita bruta até R$ 4.800.000,00 por ano</li>
                <li>• Cálculo baseado nos últimos 12 meses</li>
                <li>• Regime pode ser obrigatório ou optativo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Anexos do Simples Nacional</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Anexo I:</strong> Comércio</li>
                <li>• <strong>Anexo II:</strong> Indústria</li>
                <li>• <strong>Anexo III:</strong> Serviços (exceto especificados)</li>
                <li>• <strong>Anexo IV/V:</strong> Serviços específicos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
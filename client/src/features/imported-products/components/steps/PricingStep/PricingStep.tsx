/**
 * COMPONENTE: PricingStep - Etapa de precificação
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicInfoStepProps } from '../../../types';

export const PricingStep = ({ formData, errors, onChange, onValidate }: BasicInfoStepProps) => {
  const margin = formData.sellingPrice && formData.cost 
    ? ((formData.sellingPrice - formData.cost) / formData.sellingPrice * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Custos e Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Custo do Produto *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => onChange('cost', parseFloat(e.target.value) || 0)}
                onBlur={() => onValidate('cost')}
                placeholder="0,00"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-sm text-red-600">{errors.cost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Preço de Venda *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => onChange('sellingPrice', parseFloat(e.target.value) || 0)}
                onBlur={() => onValidate('sellingPrice')}
                placeholder="0,00"
                className={errors.sellingPrice ? 'border-red-500' : ''}
              />
              {errors.sellingPrice && <p className="text-sm text-red-600">{errors.sellingPrice}</p>}
            </div>
          </div>

          {formData.cost > 0 && formData.sellingPrice > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Análise de Margem</span>
              </div>
              <div className="text-sm text-blue-800">
                <div>Margem de Lucro: <strong>{margin.toFixed(1)}%</strong></div>
                <div>Lucro: <strong>R$ {(formData.sellingPrice - formData.cost).toFixed(2)}</strong></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
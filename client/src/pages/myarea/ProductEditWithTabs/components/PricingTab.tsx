import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { ProductFormData } from '../types';

interface PricingTabProps {
  formData: ProductFormData;
  onFieldChange: (field: keyof ProductFormData, value: any) => void;
}

export const PricingTab = memo<PricingTabProps>(({
  formData,
  onFieldChange
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMarginColor = (margin: number) => {
    if (margin < 20) return 'text-red-600';
    if (margin < 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Preços e Margens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => onFieldChange('costPrice', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
              <p className="text-sm text-muted-foreground">
                {formatCurrency(formData.costPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Preço de Venda *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => onFieldChange('sellingPrice', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
              <p className="text-sm text-muted-foreground">
                {formatCurrency(formData.sellingPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Preço Promocional</Label>
              <Input
                id="discountPrice"
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => onFieldChange('discountPrice', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
              <p className="text-sm text-muted-foreground">
                {formatCurrency(formData.discountPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                step="0.01"
                value={formData.profitMargin}
                onChange={(e) => onFieldChange('profitMargin', parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                readOnly
              />
              <p className={`text-sm font-medium ${getMarginColor(formData.profitMargin)}`}>
                {formData.profitMargin.toFixed(2)}% de margem
              </p>
            </div>
          </div>

          {/* Profit Analysis */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Análise de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Lucro por Unidade</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(formData.sellingPrice - formData.costPrice)}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Desconto Máximo</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(formData.sellingPrice - formData.costPrice)}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Preço Mínimo</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(formData.costPrice)}
                  </p>
                </div>
              </div>

              {formData.discountPrice > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Economia na Promoção</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(formData.sellingPrice - formData.discountPrice)}
                    <span className="text-sm ml-2">
                      ({(((formData.sellingPrice - formData.discountPrice) / formData.sellingPrice) * 100).toFixed(1)}% off)
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
});
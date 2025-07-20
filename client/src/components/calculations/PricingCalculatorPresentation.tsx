/**
 * Presentation Component para PricingCalculator
 * Componente puro que apenas renderiza a UI sem lógica de negócio
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PricingCalculatorContainerRenderProps } from './PricingCalculatorContainer';

/**
 * Componente de apresentação puro
 * Recebe props do container e apenas renderiza a UI
 */
export const PricingCalculatorPresentation: React.FC<PricingCalculatorContainerRenderProps> = ({
  state,
  calculation,
  onCostPriceChange,
  onMarginChange,
  onTaxRateChange,
  onShippingCostChange,
  onPlatformFeesChange,
  onCalculate,
  onSave,
  onAddCompetitorPrice,
  onCompetitorPriceChange,
  onRemoveCompetitorPrice,
  onCompetitorNameChange,
  isCalculating,
  hasError,
  errorMessage,
  canCalculate,
  canSave
}) => {
  // Renderização com tipos específicos
  const renderInputField = useCallback(({
    label,
    name,
    type = 'number',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = ''
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean;
    className?: string;
  }) => (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  ), []);

  const renderButton = useCallback(({
    children,
    onClick,
    type = 'button',
    variant = 'default',
    size = 'default',
    disabled = false,
    loading = false,
    className = ''
  }: {
    children: React.ReactNode;
    onClick: () => void;
    type?: 'button' | 'submit';
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
  }) => (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
    >
      {loading ? 'Carregando...' : children}
    </Button>
  ), []);

  const renderCard = useCallback(({
    title,
    children,
    className = ''
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  ), []);

  const renderBadge = useCallback(({
    children,
    variant = 'default',
    className = ''
  }: {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
  }) => (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  ), []);

  // Renderização do componente com tipos específicos
  return (
    <div className="space-y-6">
      {renderCard({
        title: 'Calculadora de Precificação',
        children: (
          <div className="space-y-4">
            {/* Campos de entrada com tipos específicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField({
                label: 'Preço de Custo (R$)',
                name: 'costPrice',
                type: 'number',
                value: state.costPrice.toString(),
                onChange: onCostPriceChange,
                placeholder: '0.00',
                required: true
              })}

              {renderInputField({
                label: 'Margem de Lucro (%)',
                name: 'marginPercentage',
                type: 'number',
                value: state.marginPercentage.toString(),
                onChange: onMarginChange,
                placeholder: '30',
                required: true
              })}

              {renderInputField({
                label: 'Taxa de Imposto (%)',
                name: 'taxRate',
                type: 'number',
                value: state.taxRate.toString(),
                onChange: onTaxRateChange,
                placeholder: '18',
                required: true
              })}

              {renderInputField({
                label: 'Custo de Frete (R$)',
                name: 'shippingCost',
                type: 'number',
                value: state.shippingCost.toString(),
                onChange: onShippingCostChange,
                placeholder: '0.00'
              })}

              {renderInputField({
                label: 'Taxas da Plataforma (R$)',
                name: 'platformFees',
                type: 'number',
                value: state.platformFees.toString(),
                onChange: onPlatformFeesChange,
                placeholder: '0.00'
              })}
            </div>

            {/* Preços dos concorrentes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preços dos Concorrentes</Label>
                {renderButton({
                  children: 'Adicionar Concorrente',
                  onClick: onAddCompetitorPrice,
                  variant: 'outline',
                  size: 'sm'
                })}
              </div>

              {state.competitorPrices.map((competitor, index) => (
                <div key={competitor.id} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={competitor.name}
                    onChange={(e) => onCompetitorNameChange(index, e.target.value)}
                    placeholder="Nome do concorrente"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={competitor.price.toString()}
                    onChange={(e) => onCompetitorPriceChange(index, e.target.value)}
                    placeholder="0.00"
                    className="w-32"
                  />
                  {renderButton({
                    children: 'Remover',
                    onClick: () => onRemoveCompetitorPrice(index),
                    variant: 'destructive',
                    size: 'sm'
                  })}
                </div>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-3">
              {renderButton({
                children: 'Calcular Preço',
                onClick: onCalculate,
                disabled: !canCalculate || isCalculating,
                loading: isCalculating
              })}

              {calculation && renderButton({
                children: 'Salvar Cálculo',
                onClick: onSave,
                variant: 'secondary',
                disabled: !canSave
              })}
            </div>

            {/* Exibição de erro */}
            {hasError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Resultado do cálculo */}
      {calculation && (
        <div className="space-y-4">
          {renderCard({
            title: 'Resultado do Cálculo',
            children: (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Preço de Venda Sugerido</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {calculation.suggestedPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Margem de Lucro</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {calculation.margin?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="text-xl font-semibold text-green-600">
                      {calculation.roi?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Detalhamento dos Custos</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Custo Base:</span>
                      <span>R$ {calculation.baseCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo Total:</span>
                      <span>R$ {calculation.totalCost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Markup:</span>
                      <span>{calculation.markup?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço de Equilíbrio:</span>
                      <span>R$ {calculation.breakEvenPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {calculation.competitorAnalysis && calculation.competitorAnalysis.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Análise da Concorrência</h4>
                      <div className="space-y-1">
                        {calculation.competitorAnalysis.map((competitor, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{competitor.competitor}:</span>
                            <div className="flex items-center space-x-2">
                              <span>R$ {competitor.price.toFixed(2)}</span>
                              {renderBadge({
                                children: `${competitor.percentage > 0 ? '+' : ''}${competitor.percentage.toFixed(1)}%`,
                                variant: competitor.percentage > 0 ? 'destructive' : 'default'
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}; 
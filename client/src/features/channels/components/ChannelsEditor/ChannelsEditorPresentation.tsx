/**
 * CHANNELS EDITOR PRESENTATION
 * Componente de apresentação para o editor de canais
 * Extraído de ChannelsEditor.tsx (735 linhas) para modularização
 * UI pura sem lógica de negócio
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Store, Check, X, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { CurrencyInput } from '@/components/ui/currency-input';
import { PercentInput } from '@/components/ui/percent-input';
import {
  ChannelsEditorPresentationProps,
  ChannelType,
  CHANNEL_CONFIGS
} from '../../types/channels';
import { formatUnifiedCurrency, formatUnifiedPercentage } from '@/shared/utils/unifiedChannelCalculations';

const ChannelsEditorPresentation: React.FC<ChannelsEditorPresentationProps> = ({
  state,
  actions,
  utils,
  readOnly = false,
  className,
  style
}) => {
  const {
    isLoading,
    isSaving,
    error,
    product,
    formData,
    expandedChannels,
    calculations,
    hasUnsavedChanges
  } = state;

  const {
    updateChannelData,
    toggleChannel,
    toggleChannelExpansion,
    saveChannels,
    closeEditor
  } = actions;

  const {
    formatCurrency,
    formatPercent,
    isChannelActive,
    isChannelExpanded
  } = utils;

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={closeEditor}>
        <DialogContent className="max-w-6xl">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Carregando canais...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={true} onOpenChange={closeEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <X className="mr-2 h-5 w-5" />
              Erro
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={closeEditor}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      await saveChannels();
    }
  };

  const renderChannelField = (channelType: ChannelType, field: any) => {
    const channelData = formData[channelType];
    const fieldValue = channelData?.[field.key as keyof typeof channelData] || '';

    const handleFieldChange = (value: any) => {
      updateChannelData(channelType, field.key, value);
    };

    switch (field.type) {
      case 'currency':
        return (
          <CurrencyInput
            value={fieldValue as number}
            onValueChange={handleFieldChange}
            placeholder={field.placeholder || `Digite o ${field.label.toLowerCase()}`}
            disabled={readOnly}
          />
        );

      case 'percent':
        return (
          <PercentInput
            value={fieldValue as number}
            onValueChange={handleFieldChange}
            placeholder={field.placeholder || `Digite a ${field.label.toLowerCase()}`}
            min={field.min}
            max={field.max}
            disabled={readOnly}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue as number || ''}
            onChange={(e) => handleFieldChange(Number(e.target.value) || 0)}
            placeholder={field.placeholder || `Digite o ${field.label.toLowerCase()}`}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            disabled={readOnly}
          />
        );

      default: // text
        return (
          <Input
            type="text"
            value={fieldValue as string || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={field.placeholder || `Digite o ${field.label.toLowerCase()}`}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={closeEditor}>
      <DialogContent className={`max-w-6xl max-h-[90vh] overflow-y-auto ${className || ''}`} style={style}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Editor de Canais de Venda
            {product && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                - {product.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...{}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info Summary */}
            {product && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Package className="mr-2 h-4 w-4" />
                    Informações do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Produto:</span>
                      <br />
                      <span className="font-medium">{product.name}</span>
                    </div>
                    {product.sku && (
                      <div>
                        <span className="text-muted-foreground">SKU:</span>
                        <br />
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                    {product.costPrice && (
                      <div>
                        <span className="text-muted-foreground">Custo:</span>
                        <br />
                        <span className="font-medium">{formatCurrency(product.costPrice)}</span>
                      </div>
                    )}
                    {product.weightKg && (
                      <div>
                        <span className="text-muted-foreground">Peso:</span>
                        <br />
                        <span className="font-medium">{product.weightKg} kg</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Channels Configuration */}
            <div className="space-y-4">
              {(Object.keys(CHANNEL_CONFIGS) as ChannelType[]).map((channelType) => {
                const config = CHANNEL_CONFIGS[channelType];
                const isActive = isChannelActive(channelType);
                const isExpanded = isChannelExpanded(channelType);
                const channelCalculation = calculations[channelType];

                return (
                  <Card key={channelType} className={isActive ? 'border-primary' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{config.name}</span>
                              {!readOnly && (
                                <Switch
                                  checked={isActive}
                                  onCheckedChange={(checked) => toggleChannel(channelType, checked)}
                                />
                              )}
                            </div>
                            {config.description && (
                              <p className="text-sm text-muted-foreground">
                                {config.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {isActive && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleChannelExpansion(channelType)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>

                    {isActive && (
                      <CardContent>
                        {isExpanded ? (
                          // Expanded view with all fields
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {config.fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                  <Label htmlFor={`${channelType}_${field.key}`}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  {renderChannelField(channelType, field)}
                                </div>
                              ))}
                            </div>

                            {/* Calculations Display */}
                            {channelCalculation && (
                              <div className="mt-6 p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center">
                                  {channelCalculation.isProfit ? (
                                    <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                                  ) : (
                                    <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
                                  )}
                                  Análise de Rentabilidade
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Receita Bruta:</span>
                                    <br />
                                    <span className="font-medium">
                                      {formatCurrency(channelCalculation.calculations.grossRevenue)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Custos Totais:</span>
                                    <br />
                                    <span className="font-medium">
                                      {formatCurrency(channelCalculation.totalCosts)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Lucro Líquido:</span>
                                    <br />
                                    <span className={`font-medium ${channelCalculation.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(channelCalculation.netProfit)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Margem:</span>
                                    <br />
                                    <span className={`font-medium ${channelCalculation.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatPercent(channelCalculation.marginPercent)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">ROI:</span>
                                    <br />
                                    <span className={`font-medium ${channelCalculation.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatPercent(channelCalculation.roi)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Collapsed view with summary
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {config.fields.slice(0, 4).map((field) => {
                                const channelData = formData[channelType];
                                const fieldValue = channelData?.[field.key as keyof typeof channelData];
                                
                                if (!fieldValue) return null;

                                return (
                                  <div key={field.key}>
                                    <span className="text-muted-foreground">{field.label}:</span>
                                    <br />
                                    <span className="font-medium">
                                      {field.type === 'currency' ? formatCurrency(fieldValue as number) :
                                       field.type === 'percent' ? formatPercent(fieldValue as number) :
                                       fieldValue}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {channelCalculation && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-3 bg-muted rounded">
                                <div>
                                  <span className="text-muted-foreground">Receita:</span>
                                  <br />
                                  <span className="font-medium">
                                    {formatCurrency(channelCalculation.calculations.grossRevenue)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Custos:</span>
                                  <br />
                                  <span className="font-medium">
                                    {formatCurrency(channelCalculation.totalCosts)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Lucro:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculation.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(channelCalculation.netProfit)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Margem:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculation.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(channelCalculation.marginPercent)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {hasUnsavedChanges && (
                  <span className="text-amber-600">● Alterações não salvas</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  {hasUnsavedChanges ? 'Cancelar' : 'Fechar'}
                </Button>
                {!readOnly && (
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <ButtonLoader />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Salvar Canais
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelsEditorPresentation;

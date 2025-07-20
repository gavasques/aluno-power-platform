import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Store, Check, X, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CurrencyInput } from '@/components/ui/currency-input';
import { PercentInput } from '@/components/ui/percent-input';
import { formatCurrency, formatPercent } from '@/utils/channelCalculations';
import { ChannelsEditorPresentationProps } from './types';

export const ChannelsEditorPresentation = ({
  product,
  loadingProduct,
  error,
  isSaving,
  isOpen,
  form,
  expandedChannels,
  channelCalculations,
  CHANNEL_FIELDS,
  onSubmit,
  onClose,
  toggleChannelExpansion
}: ChannelsEditorPresentationProps) => {
  if (loadingProduct) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2">Carregando dados do produto...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    console.error('🔥 [ERROR] Query error:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8 text-red-600">
            <span>Erro ao carregar produto: {(error as any)?.message || 'Erro desconhecido'}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Store className="h-6 w-6" />
            Editar Canais de Venda
          </DialogTitle>
          <p className="text-muted-foreground">
            Configure os canais de venda onde o produto será comercializado
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(CHANNEL_FIELDS).map(([channelType, channelConfig], index) => {
                const isActive = form.watch(`channels.${index}.isActive`);
                const isExpanded = expandedChannels.has(channelType);
                
                return (
                  <Card key={channelType} className={isActive ? 'border-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-2 cursor-pointer flex-1 justify-start p-0 h-auto hover:bg-transparent"
                          onClick={() => toggleChannelExpansion(channelType)}
                        >
                          <span className="text-2xl">{channelConfig.icon}</span>
                          <CardTitle className="text-lg">{channelConfig.name}</CardTitle>
                          {isActive && (
                            <div className="ml-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </Button>
                        <FormField
                          control={form.control}
                          name={`channels.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardHeader>
                    
                    {isActive && isExpanded && (
                      <CardContent className="space-y-3 pt-0">
                        <div className="text-sm text-muted-foreground mb-3">
                          Custo do produto: R$ {(product as any)?.data?.costItem || '0,00'} | 
                          Impostos: {(product as any)?.data?.taxPercent || '0,00'}%
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {channelConfig.fields.map((fieldConfig) => (
                            <FormField
                              key={fieldConfig.key}
                              control={form.control}
                              name={`channels.${index}.data.${fieldConfig.key}`}
                              render={({ field }) => (
                                <FormItem className={fieldConfig.key === 'price' ? 'col-span-2' : ''}>
                                  <FormLabel className={fieldConfig.key === 'price' ? 'font-semibold' : ''}>
                                    {fieldConfig.label}
                                  </FormLabel>
                                  <FormControl>
                                    {fieldConfig.type === 'currency' ? (
                                      <CurrencyInput
                                        value={parseFloat(field.value?.toString() || '0') || 0}
                                        onChange={field.onChange}
                                        placeholder="R$ 0,00"
                                      />
                                    ) : fieldConfig.type === 'percent' ? (
                                      <PercentInput
                                        value={parseFloat(field.value?.toString() || '0') || 0}
                                        onChange={field.onChange}
                                        placeholder="0,00%"
                                      />
                                    ) : (
                                      <Input
                                        value={field.value?.toString() || ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder={fieldConfig.label}
                                      />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        
                        {/* Financial Summary */}
                        {channelCalculations[channelType] && (
                          <div className="border-t pt-3 mt-3">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                {channelCalculations[channelType].isProfit ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium text-sm">Resumo Financeiro</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Custos Totais:</span>
                                  <br />
                                  <span className="font-medium">
                                    {formatCurrency(channelCalculations[channelType].totalCosts)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Lucro Líquido:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(channelCalculations[channelType].netProfit)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Margem:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(channelCalculations[channelType].marginPercent)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ROI:</span>
                                  <br />
                                  <span className={`font-medium ${channelCalculations[channelType].isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercent(channelCalculations[channelType].roi)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Salvar Canais
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 
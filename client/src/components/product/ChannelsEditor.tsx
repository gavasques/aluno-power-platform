import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, Store, Check, X } from 'lucide-react';
import { CurrencyInput } from '@/components/ui/currency-input';
import { PercentInput } from '@/components/ui/percent-input';

// Define channel types with their specific fields
const CHANNEL_FIELDS = {
  SITE_PROPRIO: {
    name: 'Site Próprio',
    icon: '🌐',
    fields: [
      { key: 'packagingCostValue', label: 'Custo de Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'marketingCostPercent', label: 'Custos Marketing %', type: 'percent' },
      { key: 'financialCostPercent', label: 'Custos Financeiro %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda Site', type: 'currency' },
    ]
  },
  AMAZON_FBM: {
    name: 'Amazon FBM',
    icon: '📮',
    fields: [
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBM', type: 'currency' },
    ]
  },
  AMAZON_FBA_ONSITE: {
    name: 'Amazon FBA On Site',
    icon: '🏭',
    fields: [
      { key: 'shippingCost', label: 'Custo do Frete FBA ON Site', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'price', label: 'Preço de Venda FBA On Site', type: 'currency' },
    ]
  },
  AMAZON_DBA: {
    name: 'Amazon DBA',
    icon: '🚛',
    fields: [
      { key: 'shippingCost', label: 'Custo do Frete DBA', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda DBA', type: 'currency' },
    ]
  },
  AMAZON_FBA: {
    name: 'Amazon FBA',
    icon: '🏭',
    fields: [
      { key: 'productCostFBA', label: 'Custo do Produto no FBA', type: 'currency' },
      { key: 'shippingCost', label: 'Custo do Frete FBA', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'installmentPercent', label: '% Parc. Sem Juros', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'prepCenterCost', label: 'Custo Prep. Center', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda FBA', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_ME1: {
    name: 'Mercado Livre ME1',
    icon: '🛒',
    fields: [
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML ME1', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_FLEX: {
    name: 'Mercado Livre Flex',
    icon: '📦',
    fields: [
      { key: 'shippingCost', label: 'Custo do Frete ML Flex', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'revenueMLFlex', label: 'Receita ML Flex R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_ENVIOS: {
    name: 'Mercado Livre Envios',
    icon: '🚚',
    fields: [
      { key: 'shippingCost', label: 'Custo do Frete ML Envios', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML', type: 'currency' },
    ]
  },
  MERCADO_LIVRE_FULL: {
    name: 'Mercado Livre FULL',
    icon: '🏪',
    fields: [
      { key: 'productCostMLFull', label: 'Custo do Produto no ML FULL', type: 'currency' },
      { key: 'shippingCost', label: 'Custo Frete ML FULL', type: 'currency' },
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'prepCenterCost', label: 'Custo Prep. Center', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda ML FULL', type: 'currency' },
    ]
  },
  SHOPEE: {
    name: 'Shopee',
    icon: '🛍️',
    fields: [
      { key: 'commissionPercent', label: 'Custo Comissão %', type: 'percent' },
      { key: 'fixedCostPercent', label: 'Custo Fixo %', type: 'percent' },
      { key: 'packagingCostValue', label: 'Custo Embalagem R$', type: 'currency' },
      { key: 'otherCostPercent', label: 'Outro Custo %', type: 'percent' },
      { key: 'otherCostValue', label: 'Outro Custo R$', type: 'currency' },
      { key: 'tacosCostPercent', label: 'Custos TaCos %', type: 'percent' },
      { key: 'rebatePercent', label: 'Rebate %', type: 'percent' },
      { key: 'rebateValue', label: 'Rebate R$', type: 'currency' },
      { key: 'price', label: 'Preço de Venda Shopee', type: 'currency' },
    ]
  },
} as const;

// Channel schema - dynamic based on channel fields
const channelSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    data: z.record(z.string()).optional(),
  })),
});

type ChannelFormData = z.infer<typeof channelSchema>;

interface ChannelsEditorProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelsEditor: React.FC<ChannelsEditorProps> = ({ productId, isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  // Load product data
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: isOpen,
  });

  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      channels: Object.keys(CHANNEL_FIELDS).map(channelType => ({
        type: channelType,
        isActive: false,
        data: {},
      })),
    },
  });

  // Update form when product loads
  React.useEffect(() => {
    if (product && isOpen) {
      const productChannels = (product as any).channels || [];
      
      // Create a map of existing channels
      const channelMap = new Map(productChannels.map((ch: any) => [ch.type, ch]));
      
      // Update form with product data
      const formChannels = Object.keys(CHANNEL_FIELDS).map(channelType => {
        const existingChannel = channelMap.get(channelType) as any;
        return {
          type: channelType,
          isActive: existingChannel?.isActive || false,
          data: existingChannel?.data || {},
        };
      });
      
      form.reset({ channels: formChannels });
    }
  }, [product, isOpen, form]);

  const onSubmit = async (data: ChannelFormData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      console.log("🔍 [CHANNELS_FORM] Form data being submitted:", data);

      // Filter only active channels
      const activeChannels = data.channels.filter(ch => ch.isActive);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          channels: activeChannels,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update channels');
      }

      toast({
        title: "Canais atualizados",
        description: "Os canais de venda foram atualizados com sucesso!",
      });

      // Invalidate and refresh product data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });

      onClose();
    } catch (error) {
      console.error('Error updating channels:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os canais de venda.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
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
                
                return (
                  <Card key={channelType} className={isActive ? 'border-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{channelConfig.icon}</span>
                          {channelConfig.name}
                        </CardTitle>
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
                    {isActive && (
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground mb-3">
                          Custo do produto: R$ {(product as any)?.costItem || '0,00'} | 
                          Impostos: {(product as any)?.taxPercent || '0,00'}%
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
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="R$ 0,00"
                                      />
                                    ) : (
                                      <PercentInput
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="0,00%"
                                      />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
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
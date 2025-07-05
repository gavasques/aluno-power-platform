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

const CHANNEL_TYPES = [
  { id: 'SITE_PROPRIO', name: 'Site Próprio', icon: '🌐' },
  { id: 'MERCADO_LIVRE_ME1', name: 'Mercado Livre ME1', icon: '🛒' },
  { id: 'MERCADO_LIVRE_FLEX', name: 'Mercado Livre Flex', icon: '📦' },
  { id: 'MERCADO_LIVRE_ENVIOS', name: 'Mercado Livre Envios', icon: '🚚' },
  { id: 'MERCADO_LIVRE_FULL', name: 'Mercado Livre FULL', icon: '🏪' },
  { id: 'AMAZON_FBM', name: 'Amazon FBM', icon: '📮' },
  { id: 'AMAZON_FBA', name: 'Amazon FBA', icon: '🏭' },
  { id: 'AMAZON_DBA', name: 'Amazon DBA', icon: '🚛' },
  { id: 'SHOPEE', name: 'Shopee', icon: '🛍️' },
  { id: 'ALIEXPRESS', name: 'AliExpress', icon: '🌏' },
  { id: 'MAGAZINE_LUIZA', name: 'Magazine Luiza', icon: '🏬' },
];

// Channel schema
const channelSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    isActive: z.boolean(),
    price: z.string().optional(),
    shippingCost: z.string().optional(),
    commissionPercent: z.string().optional(),
    marketingCostPercent: z.string().optional(),
    otherCostPercent: z.string().optional(),
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
      channels: CHANNEL_TYPES.map(channel => ({
        type: channel.id,
        isActive: false,
        price: '',
        shippingCost: '',
        commissionPercent: '',
        marketingCostPercent: '',
        otherCostPercent: '',
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
      const formChannels = CHANNEL_TYPES.map(channelType => {
        const existingChannel = channelMap.get(channelType.id) as any;
        return {
          type: channelType.id,
          isActive: existingChannel?.isActive || false,
          price: existingChannel?.price || '',
          shippingCost: existingChannel?.shippingCost || '',
          commissionPercent: existingChannel?.commissionPercent || '',
          marketingCostPercent: existingChannel?.marketingCostPercent || '',
          otherCostPercent: existingChannel?.otherCostPercent || '',
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNEL_TYPES.map((channel, index) => {
                const isActive = form.watch(`channels.${index}.isActive`);
                
                return (
                  <Card key={channel.id} className={isActive ? 'border-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{channel.icon}</span>
                          {channel.name}
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
                        <FormField
                          control={form.control}
                          name={`channels.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço de Venda</FormLabel>
                              <FormControl>
                                <CurrencyInput
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  placeholder="R$ 0,00"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`channels.${index}.shippingCost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custo de Frete</FormLabel>
                              <FormControl>
                                <CurrencyInput
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  placeholder="R$ 0,00"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <FormField
                            control={form.control}
                            name={`channels.${index}.commissionPercent`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Comissão</FormLabel>
                                <FormControl>
                                  <PercentInput
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="0,00%"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`channels.${index}.marketingCostPercent`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Marketing</FormLabel>
                                <FormControl>
                                  <PercentInput
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="0,00%"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`channels.${index}.otherCostPercent`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Outros</FormLabel>
                                <FormControl>
                                  <PercentInput
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="0,00%"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
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
                  'Salvar Canais'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
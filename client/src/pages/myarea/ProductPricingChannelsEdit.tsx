import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/utils/pricingCalculations";
import { calculateChannelProfitability } from "@/utils/channelCalculations";

const pricingSchema = z.object({
  channels: z.array(z.object({
    id: z.string().optional(),
    type: z.string(),
    name: z.string(),
    isActive: z.boolean(),
    data: z.object({
      price: z.number().min(0, "Preço deve ser positivo"),
      commission: z.number().min(0).max(100).optional(),
      shippingFee: z.number().min(0).optional(),
      processingFee: z.number().min(0).optional(),
      advertisingFee: z.number().min(0).optional(),
    }),
  })),
});

type PricingForm = z.infer<typeof pricingSchema>;

const CHANNEL_TYPES = [
  { value: 'SITE_PROPRIO', label: 'Site Próprio' },
  { value: 'AMAZON_FBM', label: 'Amazon FBM' },
  { value: 'AMAZON_FBA', label: 'Amazon FBA' },
  { value: 'AMAZON_DBA', label: 'Amazon DBA' },
  { value: 'ML_ME1', label: 'Mercado Livre ME1' },
  { value: 'ML_FLEX', label: 'Mercado Livre Flex' },
  { value: 'ML_FULL', label: 'Mercado Livre Full' },
  { value: 'MAGALU_FULL', label: 'Magalu Full' },
  { value: 'TIKTOKSHOP_NORMAL', label: 'TikTok Shop' },
  { value: 'SHOPEE', label: 'Shopee' },
];

export default function ProductPricingChannelsEdit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get product ID from URL
  const productId = window.location.pathname.split('/')[3];

  const form = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      channels: [],
    },
  });

  const { watch } = form;
  const watchedChannels = watch("channels");

  // Get product data
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      let channels = [];
      
      try {
        if (product.channels) {
          channels = typeof product.channels === 'string' 
            ? JSON.parse(product.channels) 
            : product.channels;
        }
      } catch (error) {
        console.error('Error parsing channels:', error);
        channels = [];
      }

      form.reset({
        channels: Array.isArray(channels) ? channels : [],
      });
    }
  }, [product, form]);

  const addChannel = () => {
    const newChannel = {
      id: `new-${Date.now()}`,
      type: 'SITE_PROPRIO',
      name: 'Novo Canal',
      isActive: true,
      data: {
        price: 0,
        commission: 0,
        shippingFee: 0,
        processingFee: 0,
        advertisingFee: 0,
      },
    };

    form.setValue("channels", [...watchedChannels, newChannel]);
  };

  const removeChannel = (index: number) => {
    const newChannels = watchedChannels.filter((_, i) => i !== index);
    form.setValue("channels", newChannels);
  };

  const calculateChannelMetrics = (channel: any) => {
    if (!channel || !channel.data) return null;

    try {
      return calculateChannelProfitability(
        channel.type,
        channel.data,
        {
          costItem: product?.costItem || 0,
          taxPercent: product?.taxPercent || 0,
        }
      );
    } catch (error) {
      return null;
    }
  };

  const onSubmit = async (data: PricingForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          channels: JSON.stringify(data.channels),
        }),
      });

      toast({
        title: "Preços atualizados",
        description: "Os preços e canais do produto foram atualizados com sucesso.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      // Go back to product list
      setLocation("/minha-area/produtos");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os preços do produto.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Carregando produto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/minha-area/produtos")}
              className="hover:bg-white/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Canais de Venda</h1>
              <p className="text-muted-foreground">
                Configure os canais de venda e preços do produto
              </p>
              {product && (
                <p className="text-sm text-gray-600 mt-1">
                  Produto: <span className="font-medium">{product.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Canais de Venda</CardTitle>
                      <CardDescription>
                        Configure os preços para cada canal de venda
                      </CardDescription>
                    </div>
                    <Button type="button" onClick={addChannel} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Canal
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {watchedChannels.map((channel, index) => {
                      const metrics = calculateChannelMetrics(channel);
                      
                      return (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <FormField
                                control={form.control}
                                name={`channels.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo do Canal</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="w-[200px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {CHANNEL_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`channels.${index}.isActive`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Ativo</FormLabel>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />

                              {metrics && (
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={metrics.marginPercent >= 20 ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {metrics.marginPercent.toFixed(1)}% margem
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Lucro: {formatBRL(metrics.netProfit)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChannel(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`channels.${index}.data.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preço de Venda *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`channels.${index}.data.commission`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Comissão (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      max="100"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      placeholder="0.0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`channels.${index}.data.shippingFee`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Taxa de Frete</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`channels.${index}.data.processingFee`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Taxa de Processamento</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`channels.${index}.data.advertisingFee`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Taxa de Publicidade</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {watchedChannels.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Nenhum canal configurado</p>
                        <p className="text-sm mb-4">Adicione canais de venda para começar a configurar preços</p>
                        <Button type="button" onClick={addChannel} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Primeiro Canal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/minha-area/produtos")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Canais
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
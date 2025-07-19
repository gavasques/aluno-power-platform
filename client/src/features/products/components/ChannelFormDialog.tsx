import React from 'react';
import { z } from 'zod';
import { FormDialog } from '@/components/common/FormDialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ALL_CHANNEL_TYPES, CHANNEL_METADATA } from '../constants/channels';
import type { ProductChannel } from '../types/productChannels';

/**
 * ChannelFormDialog - Formulário para configuração de canais
 */

const channelFormSchema = z.object({
  type: z.string().min(1, "Tipo de canal é obrigatório"),
  isActive: z.boolean().default(true),
  price: z.number().min(0.01, "Preço deve ser maior que zero"),
  commissionPercent: z.number().min(0).max(100, "Comissão deve estar entre 0 e 100%").optional(),
  packagingCostValue: z.number().min(0).optional(),
  shippingCostValue: z.number().min(0).optional(),
  fixedCostPercent: z.number().min(0).max(100).optional(),
  marketingCostPercent: z.number().min(0).max(100).optional(),
  financialCostPercent: z.number().min(0).max(100).optional(),
  // Códigos específicos por canal
  fnsku: z.string().optional(),
  asin: z.string().optional(),
  mlb: z.string().optional(),
  skuMgl: z.string().optional(),
  idProduto: z.string().optional(),
});

type ChannelFormData = z.infer<typeof channelFormSchema>;

interface ChannelFormDialogProps {
  data?: ProductChannel;
  onSubmit: (data: ChannelFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ChannelFormDialog({ 
  data, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ChannelFormDialogProps) {
  const defaultValues: ChannelFormData = {
    type: data?.type || '',
    isActive: data?.enabled ?? true,
    price: data?.salePrice || 0,
    commissionPercent: data?.commission || 0,
    packagingCostValue: data?.config?.packagingCostValue || 0,
    shippingCostValue: data?.config?.shippingCostValue || 0,
    fixedCostPercent: data?.config?.fixedCostPercent || 0,
    marketingCostPercent: data?.config?.marketingCostPercent || 0,
    financialCostPercent: data?.config?.financialCostPercent || 0,
    fnsku: data?.productCodes?.fnsku || '',
    asin: data?.productCodes?.asin || '',
    mlb: data?.productCodes?.mlb || '',
    skuMgl: data?.productCodes?.skuMgl || '',
    idProduto: data?.productCodes?.idProduto || '',
  };

  // Determina quais campos de código mostrar baseado no tipo de canal
  const getProductCodeFields = (channelType: string) => {
    const metadata = CHANNEL_METADATA[channelType as keyof typeof CHANNEL_METADATA];
    return metadata?.productCodeFields || [];
  };

  const selectedChannelType = defaultValues.type;
  const codeFields = getProductCodeFields(selectedChannelType);

  return (
    <FormDialog
      title={data ? "Editar Canal" : "Novo Canal"}
      schema={channelFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isLoading}
      size="lg"
      isOpen={true}
      onOpenChange={(open) => !open && onCancel()}
    >
      {(form) => {
        const watchedChannelType = form.watch('type');
        const currentCodeFields = getProductCodeFields(watchedChannelType);
        const metadata = CHANNEL_METADATA[watchedChannelType as keyof typeof CHANNEL_METADATA];

        return (
          <div className="space-y-6">
            {/* Configuração Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração Básica</h3>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Canal *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de canal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_CHANNEL_TYPES.map((type) => {
                          const metadata = CHANNEL_METADATA[type];
                          return (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${metadata.color}`} />
                                {metadata.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {metadata && (
                      <p className="text-xs text-muted-foreground">
                        {metadata.description}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Canal Ativo</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Ativar vendas neste canal
                      </p>
                    </div>
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

            {/* Preços e Custos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preços e Custos</h3>
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="commissionPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comissão (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="packagingCostValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo de Embalagem</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shippingCostValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo de Envio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingCostPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marketing (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Códigos do Produto - Dinâmico baseado no tipo de canal */}
            {currentCodeFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Códigos do Produto</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {currentCodeFields.includes('fnsku') && (
                    <FormField
                      control={form.control}
                      name="fnsku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FNSKU</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="FNSKU da Amazon" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentCodeFields.includes('asin') && (
                    <FormField
                      control={form.control}
                      name="asin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ASIN</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ASIN da Amazon" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentCodeFields.includes('mlb') && (
                    <FormField
                      control={form.control}
                      name="mlb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MLB</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="MLB do Mercado Livre" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentCodeFields.includes('skuMgl') && (
                    <FormField
                      control={form.control}
                      name="skuMgl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU Magazine Luiza</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="SKU do Magazine Luiza" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentCodeFields.includes('idProduto') && (
                    <FormField
                      control={form.control}
                      name="idProduto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Produto</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ID do produto no marketplace" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </FormDialog>
  );
}
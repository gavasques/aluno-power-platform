import React from 'react';
import { z } from 'zod';
import { FormDialog } from '@/components/common/FormDialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ProductSupplier } from '../types/productSupplier';

/**
 * SupplierFormDialog - Formulário para vinculação de fornecedores
 */

const supplierFormSchema = z.object({
  supplierId: z.string().min(1, "Fornecedor é obrigatório"),
  productCode: z.string().min(1, "Código do produto é obrigatório"),
  costPrice: z.number().min(0.01, "Preço deve ser maior que zero"),
  currency: z.string().default('BRL'),
  leadTime: z.number().min(0, "Lead time deve ser positivo").default(0),
  minimumQuantity: z.number().min(0, "Quantidade mínima deve ser positiva").optional(),
  maximumQuantity: z.number().min(0, "Quantidade máxima deve ser positiva").optional(),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormDialogProps {
  data?: ProductSupplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Hook para buscar fornecedores disponíveis
function useAvailableSuppliers() {
  return useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: () => apiRequest<Array<{ id: number; tradeName: string; corporateName: string }>>('/api/suppliers'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function SupplierFormDialog({ 
  data, 
  onSubmit, 
  onCancel, 
  isLoading 
}: SupplierFormDialogProps) {
  const { data: suppliers = [] } = useAvailableSuppliers();

  const defaultValues: SupplierFormData = {
    supplierId: data?.supplierId?.toString() || '',
    productCode: data?.productCode || '',
    costPrice: data?.costPrice || 0,
    currency: data?.currency || 'BRL',
    leadTime: data?.leadTime || 0,
    minimumQuantity: data?.minimumQuantity || undefined,
    maximumQuantity: data?.maximumQuantity || undefined,
    isPrimary: data?.isPrimary || false,
    isActive: data?.isActive ?? true,
    notes: data?.notes || '',
  };

  const currencies = [
    { value: 'BRL', label: 'Real Brasileiro (R$)' },
    { value: 'USD', label: 'Dólar Americano ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'CNY', label: 'Yuan Chinês (¥)' },
  ];

  return (
    <FormDialog
      title={data ? "Editar Fornecedor" : "Vincular Fornecedor"}
      schema={supplierFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isLoading}
      size="lg"
      isOpen={true}
      onOpenChange={(open) => !open && onCancel()}
    >
      {(form) => (
        <div className="space-y-6">
          {/* Informações do Fornecedor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Fornecedor</h3>
            
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          <div>
                            <div className="font-medium">{supplier.tradeName}</div>
                            <div className="text-xs text-gray-500">{supplier.corporateName}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Produto no Fornecedor *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ex: SKU, código interno, etc."
                      className="font-mono"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Como o fornecedor identifica este produto em seu catálogo
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Fornecedor Primário</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Fornecedor principal para este produto
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

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Fornecedor disponível para compras
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
          </div>

          {/* Preços e Custos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preços e Condições</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo *</FormLabel>
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
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="leadTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Tempo entre o pedido e a entrega em dias
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Mínima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Máxima</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Observações</h3>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informações adicionais sobre este fornecedor..."
                      rows={3}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Informações sobre condições especiais, qualidade, contatos, etc.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </FormDialog>
  );
}
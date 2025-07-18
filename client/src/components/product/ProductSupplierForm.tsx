/**
 * Product Supplier Form Component
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for supplier form management
 * - OCP: Open for extension with new form fields
 * - LSP: Consistent form component interface
 * - ISP: Interface segregation with focused props
 * - DIP: Depends on abstractions through hooks
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle, Building, DollarSign, Package, Clock, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProductSuppliers, useSupplierSelection } from '@/hooks/useProductSuppliers';
import { formatCurrency } from '@/shared/utils/formatters';
import type { ProductSupplier } from '@/shared/types/productSupplier';

// Form schema with validation
const supplierFormSchema = z.object({
  supplierId: z.number().min(1, 'Selecione um fornecedor'),
  supplierProductCode: z.string().min(1, 'Código do produto é obrigatório'),
  supplierCost: z.number().min(0, 'Custo deve ser um valor positivo'),
  isPrimary: z.boolean().default(false),
  leadTime: z.number().min(0, 'Tempo de entrega deve ser positivo').optional(),
  minimumOrderQuantity: z.number().min(1, 'Quantidade mínima deve ser maior que 0').optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface ProductSupplierFormProps {
  productId: number;
  supplier?: ProductSupplier | null;
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ProductSupplierForm: React.FC<ProductSupplierFormProps> = ({
  productId,
  supplier,
  onSuccess,
  onCancel,
  isOpen
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const isEditing = !!supplier;

  const {
    addSupplier,
    updateSupplier,
    hasSupplier,
    isAdding,
    isUpdating
  } = useProductSuppliers(productId);

  const {
    suppliers,
    isLoading: isLoadingSuppliers,
    getSupplierById
  } = useSupplierSelection();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplierId: supplier?.supplierId || 0,
      supplierProductCode: supplier?.supplierProductCode || '',
      supplierCost: supplier?.supplierCost || 0,
      isPrimary: supplier?.isPrimary || false,
      leadTime: supplier?.leadTime || undefined,
      minimumOrderQuantity: supplier?.minimumOrderQuantity || undefined,
      notes: supplier?.notes || '',
      active: supplier?.active ?? true,
    },
  });

  // Update form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        supplierId: supplier.supplierId,
        supplierProductCode: supplier.supplierProductCode,
        supplierCost: supplier.supplierCost,
        isPrimary: supplier.isPrimary,
        leadTime: supplier.leadTime || undefined,
        minimumOrderQuantity: supplier.minimumOrderQuantity || undefined,
        notes: supplier.notes || '',
        active: supplier.active,
      });
      setSelectedSupplier(supplier.supplier);
    } else {
      form.reset({
        supplierId: 0,
        supplierProductCode: '',
        supplierCost: 0,
        isPrimary: false,
        leadTime: undefined,
        minimumOrderQuantity: undefined,
        notes: '',
        active: true,
      });
      setSelectedSupplier(null);
    }
  }, [supplier, form]);

  // Handle supplier selection
  const handleSupplierSelect = (supplierId: string) => {
    const selectedSupplierId = parseInt(supplierId);
    const supplierData = getSupplierById(selectedSupplierId);
    
    form.setValue('supplierId', selectedSupplierId);
    setSelectedSupplier(supplierData);
  };

  // Handle form submission
  const handleSubmit = async (data: SupplierFormData) => {
    try {
      if (isEditing && supplier) {
        await updateSupplier(supplier.id, data);
      } else {
        // Check if supplier is already linked when adding
        if (hasSupplier(data.supplierId)) {
          form.setError('supplierId', {
            type: 'manual',
            message: 'Este fornecedor já está vinculado ao produto'
          });
          return;
        }
        await addSupplier(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    form.reset();
    setSelectedSupplier(null);
    onCancel();
  };

  // Available suppliers for selection (exclude already linked ones when adding)
  const availableSuppliers = suppliers.filter(s => 
    isEditing || !hasSupplier(s.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite as informações do fornecedor para este produto'
              : 'Adicione um novo fornecedor ao produto com informações específicas'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Supplier Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Seleção do Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <Select 
                        onValueChange={handleSupplierSelect}
                        value={field.value.toString()}
                        disabled={isEditing || isLoadingSuppliers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              <div className="flex items-center gap-2">
                                {supplier.logo && (
                                  <img 
                                    src={supplier.logo} 
                                    alt={supplier.tradeName}
                                    className="w-6 h-6 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{supplier.tradeName}</div>
                                  <div className="text-xs text-gray-500">{supplier.corporateName}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSupplier && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      {selectedSupplier.logo && (
                        <img 
                          src={selectedSupplier.logo} 
                          alt={selectedSupplier.tradeName}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{selectedSupplier.tradeName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedSupplier.corporateName}
                        </p>
                        {selectedSupplier.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedSupplier.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informações do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierProductCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Produto no Fornecedor</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: SKU-12345"
                            className="bg-white dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormDescription>
                          Código usado pelo fornecedor para identificar este produto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplierCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo do Fornecedor</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="pl-10 bg-white dark:bg-gray-800"
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Preço de compra do produto neste fornecedor
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leadTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de Entrega (dias)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              value={field.value || ''}
                              className="pl-10 bg-white dark:bg-gray-800"
                              placeholder="Ex: 15"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Prazo médio de entrega em dias
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimumOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade Mínima</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Package className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              value={field.value || ''}
                              className="pl-10 bg-white dark:bg-gray-800"
                              placeholder="Ex: 10"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Quantidade mínima de pedido
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Opções Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="isPrimary"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Fornecedor Principal
                          </FormLabel>
                          <FormDescription>
                            Marque como fornecedor principal para este produto
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Fornecedor ativo para novos pedidos
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Adicione observações sobre este fornecedor..."
                          className="min-h-[100px] bg-white dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormDescription>
                        Informações adicionais sobre este fornecedor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isAdding || isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isAdding || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isAdding || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
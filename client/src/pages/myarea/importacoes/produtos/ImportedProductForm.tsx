import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Package, Building2, FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Validation schema
const importedProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  internalCode: z.string().min(1, 'Código interno é obrigatório'),
  status: z.enum(['research', 'analysis', 'negotiation', 'ordered', 'shipped', 'arrived', 'cancelled']).default('research'),
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  technicalSpecifications: z.string().optional(),
  hasMultiplePackages: z.boolean().default(false),
  totalPackages: z.number().int().min(1).default(1),
  hsCode: z.string().optional(),
  ipiPercentage: z.number().optional(),
  productEan: z.string().optional(),
  productUpc: z.string().optional(),
  internalBarcode: z.string().optional(),
  customsDescription: z.string().optional(),
  supplierId: z.number().optional(),
  supplierProductCode: z.string().optional(),
  supplierProductName: z.string().optional(),
  supplierDescription: z.string().optional(),
  moq: z.number().int().optional(),
  leadTimeDays: z.number().int().optional(),
  notes: z.string().optional(),
});

type ImportedProductFormData = z.infer<typeof importedProductSchema>;

// Status options
const statusOptions = [
  { value: 'research', label: 'Pesquisa' },
  { value: 'analysis', label: 'Análise' },
  { value: 'negotiation', label: 'Negociação' },
  { value: 'ordered', label: 'Pedido Feito' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'arrived', label: 'Chegou' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface ImportedProductFormProps {
  productId?: string;
}

export default function ImportedProductForm({ productId }: ImportedProductFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!productId;

  // Form setup
  const form = useForm<ImportedProductFormData>({
    resolver: zodResolver(importedProductSchema),
    defaultValues: {
      name: '',
      internalCode: '',
      status: 'research',
      hasMultiplePackages: false,
      totalPackages: 1,
    },
  });

  // Fetch existing product for editing
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['imported-product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/imported-products/${productId}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar produto');
      }
      return response.json();
    },
    enabled: isEditing,
  });

  // Fetch suppliers for selection
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers/search?limit=100');
      if (!response.ok) {
        throw new Error('Erro ao carregar fornecedores');
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fill form with existing data
  useEffect(() => {
    if (existingProduct?.data && isEditing) {
      const product = existingProduct.data;
      form.reset({
        name: product.name || '',
        internalCode: product.internalCode || '',
        status: product.status || 'research',
        description: product.description || '',
        detailedDescription: product.detailedDescription || '',
        category: product.category || '',
        brand: product.brand || '',
        model: product.model || '',
        color: product.color || '',
        material: product.material || '',
        technicalSpecifications: product.technicalSpecifications || '',
        hasMultiplePackages: product.hasMultiplePackages || false,
        totalPackages: product.totalPackages || 1,
        hsCode: product.hsCode || '',
        ipiPercentage: product.ipiPercentage || undefined,
        productEan: product.productEan || '',
        productUpc: product.productUpc || '',
        internalBarcode: product.internalBarcode || '',
        customsDescription: product.customsDescription || '',
        supplierId: product.supplierId || undefined,
        supplierProductCode: product.supplierProductCode || '',
        supplierProductName: product.supplierProductName || '',
        supplierDescription: product.supplierDescription || '',
        moq: product.moq || undefined,
        leadTimeDays: product.leadTimeDays || undefined,
        notes: product.notes || '',
      });
    }
  }, [existingProduct, isEditing, form]);

  // Create/update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ImportedProductFormData) => {
      const url = isEditing 
        ? `/api/imported-products/${productId}`
        : '/api/imported-products';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Sucesso',
        description: isEditing 
          ? 'Produto atualizado com sucesso' 
          : 'Produto criado com sucesso',
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['imported-products'] });
      queryClient.invalidateQueries({ queryKey: ['imported-product', productId] });

      // Redirect to product detail
      setLocation(`/minha-area/importacoes/produtos/${data.data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: ImportedProductFormData) => {
    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoadingProduct) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando produto...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/minha-area/importacoes/produtos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Produto' : 'Novo Produto Importado'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Edite as informações do produto importado'
              : 'Adicione um novo produto ao seu catálogo de importações'
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maca Portátil Dobrável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Interno *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: IMP-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Eletrônicos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: BKZA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MP-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição breve do produto..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição técnica completa do produto..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Preto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Alumínio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hsCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código HS</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9403.20.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="technicalSpecifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especificações Técnicas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Dimensões, peso, capacidades, características técnicas..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="productEan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código EAN</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 7891234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productUpc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código UPC</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internalBarcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras Interno</FormLabel>
                      <FormControl>
                        <Input placeholder="Código interno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Packaging Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Embalagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="hasMultiplePackages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Produto com múltiplas embalagens</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="totalPackages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Embalagens</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ipiPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual IPI (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customsDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição para Alfândega</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição para documentos aduaneiros" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value) || undefined)}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum fornecedor</SelectItem>
                        {suppliers?.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name} - {supplier.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="supplierProductCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Produto no Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Código usado pelo fornecedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierProductName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto no Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome usado pelo fornecedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supplierDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Fornecedor</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição conforme catálogo do fornecedor..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="moq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MOQ (Quantidade Mínima)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Unidades"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leadTimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Time (dias)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="Dias para produção/envio"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas e Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notas gerais, observações importantes, histórico de negociações..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/minha-area/importacoes/produtos">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting || saveMutation.isPending}
              className="flex items-center gap-2"
            >
              {(isSubmitting || saveMutation.isPending) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? 'Atualizar Produto' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
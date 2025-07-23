import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
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
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import ImportedProductSuppliersTab from '@/components/imported-products/ImportedProductSuppliersTab';

// Validation schema
const importedProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  internalCode: z.string().min(1, 'Código interno é obrigatório'),
  status: z.enum(['Em Desenvolvimento', 'Ativo', 'Inativo']).default('Em Desenvolvimento'),
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  reference: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  variation1: z.string().optional(),
  variation2: z.string().optional(),
  material: z.string().optional(),
  technicalSpecifications: z.string().optional(),
  ncmCode: z.string().optional(),
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
  { value: 'Em Desenvolvimento', label: 'Em Desenvolvimento' },
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
];

export default function ImportedProductForm() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extrair o id da URL usando useParams do wouter
  const params = useParams() as { id?: string };
  const productId = params.id;

  const isEditing = !!productId;

  // Form setup
  const form = useForm<ImportedProductFormData>({
    resolver: zodResolver(importedProductSchema),
    defaultValues: {
      name: '',
      internalCode: '',
      status: 'Em Desenvolvimento',
      description: '',
      detailedDescription: '',
      category: '',
      brand: '',
      model: '',
      reference: '',
      color: '',
      size: '',
      variation1: '',
      variation2: '',
      material: '',
      technicalSpecifications: '',
      ncmCode: '',
      hasMultiplePackages: false,
      totalPackages: 1,
      hsCode: '',
      ipiPercentage: undefined,
      customsDescription: '',
    },
  });

  // Fetch existing product for editing
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['imported-product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await fetch(`/api/imported-products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao carregar produto');
      }
      return response.json();
    },
    enabled: isEditing,
  });

  // Empty suppliers array to prevent "suppliers is not defined" error
  // TODO: Implement supplier selection if needed
  const suppliers: any[] = [];

  // State para departments e brands
  const [departments, setDepartments] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);

  // Fetch departments diretamente
  useEffect(() => {
    if (!token) return;
    
    setIsDepartmentsLoading(true);
    fetch('/api/departments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setDepartments(Array.isArray(data) ? data : []);
    })
    .catch(error => {
      console.error('Erro ao carregar departments:', error);
      setDepartments([]);
    })
    .finally(() => {
      setIsDepartmentsLoading(false);
    });
  }, [token]);

  // Fetch brands diretamente
  useEffect(() => {
    if (!token) return;
    
    setIsBrandsLoading(true);
    fetch('/api/brands', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setBrands(Array.isArray(data) ? data : []);
    })
    .catch(error => {
      console.error('Erro ao carregar brands:', error);
      setBrands([]);
    })
    .finally(() => {
      setIsBrandsLoading(false);
    });
  }, [token]);

  // Fill form with existing data
  useEffect(() => {
    console.error('🔍 [DEBUG] useEffect executado:', { 
      params, 
      productId, 
      isEditing, 
      existingProduct, 
      hasData: !!existingProduct?.data 
    });
    
    if (existingProduct?.data && isEditing) {
      // A API retorna {success: true, data: produto}, então existingProduct.data é o produto
      const product = existingProduct.data;
      
      console.error('🔍 [DEBUG] Dados do produto carregados:', {
        productName: product.name,
        productCode: product.internalCode,
        productStatus: product.status,
        productKeys: Object.keys(product)
      });
      
      // Mapear status da API para valores do formulário
      const statusMapping: Record<string, string> = {
        'research': 'Em Desenvolvimento',
        'active': 'Ativo',
        'inactive': 'Inativo'
      };
      
      const mappedStatus = statusMapping[product.status] || 'Em Desenvolvimento';
      console.error('🔍 [DEBUG] Status mapeado:', mappedStatus);
      
      form.reset({
        name: product.name || '',
        internalCode: product.internalCode || '',
        status: mappedStatus,
        description: product.description || '',
        detailedDescription: product.detailedDescription || '',
        category: product.category || '',
        brand: product.brand || '',
        model: product.model || '',
        reference: product.reference || '',
        color: product.color || '',
        size: product.size || '',
        variation1: product.variation1 || '',
        variation2: product.variation2 || '',
        material: product.material || '',
        technicalSpecifications: product.technicalSpecifications || '',
        ncmCode: product.ncmCode || '',
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
          'Authorization': `Bearer ${token}`,
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
      // Mapear status do formulário para valores da API
      const reverseStatusMapping: Record<string, string> = {
        'Em Desenvolvimento': 'research',
        'Ativo': 'active',
        'Inativo': 'inactive'
      };
      
      const dataToSend = {
        ...data,
        status: reverseStatusMapping[data.status] || 'research'
      };
      
      await saveMutation.mutateAsync(dataToSend);
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
              {/* Primeira linha: Nome do Produto, Código Interno, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do produto" {...field} />
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
                        <Input 
                          placeholder="Ex: IMP-001" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
              </div>

              {/* Segunda linha: Categoria, Marca, Modelo, Referência */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isDepartmentsLoading && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Carregando categorias...
                            </div>
                          )}
                          {departments.map((department: any) => (
                            <SelectItem key={department.id} value={department.name}>
                              {department.name}
                            </SelectItem>
                          ))}
                          {!isDepartmentsLoading && departments.length === 0 && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Nenhuma categoria disponível
                            </div>
                          )}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isBrandsLoading && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Carregando marcas...
                            </div>
                          )}
                          {brands.map((brand: any) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                          {!isBrandsLoading && brands.length === 0 && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              Nenhuma marca disponível
                            </div>
                          )}
                        </SelectContent>
                      </Select>
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
                        <Input 
                          placeholder="Ex: MP-2024" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referência</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: REF-001" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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

              {/* Terceira linha: Cor, Tamanho, Variação 1, Variação 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Preto" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: M, 42, 15cm" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variation1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variação 1</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Campo livre" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variation2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variação 2</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Campo livre" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quarta linha: Material, Código HS, NCM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Alumínio" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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

                <FormField
                  control={form.control}
                  name="ncmCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NCM</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 9403.20.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quinta linha: Percentual de IPI e Descrição para Alfândega */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ipiPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual IPI (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="0.00"
                          value={field.value?.toString() || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                            field.onChange(parseFloat(value) || undefined);
                          }}
                          inputMode="decimal"
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
                        <Input 
                          placeholder="Descrição para documentos aduaneiros" 
                          {...field}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sexta linha: Códigos EAN, UPC, Código de Barras Interno */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        type="text" 
                        placeholder="1"
                        value={field.value?.toString() || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(parseInt(value) || 1);
                        }}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Fornecedores - Sistema de Abas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gestão de Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImportedProductSuppliersTab productId={productId || ''} />
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
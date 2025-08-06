/**
 * Product Edit Page with Tabs - PRODUTOS PRO
 * Complete product editing with suppliers management integrated
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Package, Upload, X, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProductSupplierManagerRefactored from '@/components/product/ProductSupplierManagerRefactored';

// Form schema
const productFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().optional(),
  freeCode: z.string().optional(),
  supplierCode: z.string().optional(),
  internalCode: z.string().optional(),
  ean: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  supplierId: z.number().optional(),
  ncm: z.string().optional(),
  costItem: z.number().min(0, 'Custo deve ser maior que 0').optional(),
  packCost: z.number().min(0, 'Custo de embalagem deve ser maior que 0').optional(),
  taxPercent: z.number().min(0, 'Taxa de imposto deve ser maior que 0').max(100, 'Taxa de imposto não pode ser maior que 100').optional(),
  weight: z.number().min(0, 'Peso deve ser maior que 0').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Comprimento deve ser maior que 0').optional(),
    width: z.number().min(0, 'Largura deve ser maior que 0').optional(),
    height: z.number().min(0, 'Altura deve ser maior que 0').optional(),
  }).optional(),
  description: z.string().optional(),
  bulletPoints: z.string().optional(),
  observations: z.string().optional(),
  active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface Product {
  id: number;
  name: string;
  sku?: string;
  freeCode?: string;
  supplierCode?: string;
  internalCode?: string;
  ean?: string;
  brand?: string;
  category?: string;
  supplierId?: number;
  ncm?: string;
  costItem?: number;
  packCost?: number;
  taxPercent?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  description?: string;
  bulletPoints?: string;
  observations?: string;
  active: boolean;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

const ProductEditWithTabs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      freeCode: '',
      supplierCode: '',
      internalCode: '',
      ean: '',
      brand: '',
      category: '',
      supplierId: undefined,
      ncm: '',
      costItem: 0,
      packCost: 0,
      taxPercent: 0,
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      description: '',
      bulletPoints: '',
      observations: '',
      active: true,
    },
  });

  // Load product data
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${id}`) as { data: Product };
      return response.data;
    },
    enabled: !!id,
  });

  // Load suppliers for dropdown
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 60000,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku || '',
        freeCode: product.freeCode || '',
        supplierCode: product.supplierCode || '',
        internalCode: product.internalCode || '',
        ean: product.ean || '',
        brand: product.brand || '',
        category: product.category || '',
        supplierId: product.supplierId,
        ncm: product.ncm || '',
        costItem: product.costItem,
        packCost: product.packCost,
        taxPercent: product.taxPercent,
        weight: product.weight,
        dimensions: product.dimensions || {
          length: undefined,
          width: undefined,
          height: undefined,
        },
        description: product.description || '',
        bulletPoints: product.bulletPoints || '',
        observations: product.observations || '',
        active: product.active,
      });
      setPhotoPreview(product.photo || null);
    }
  }, [product, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Add all form fields with proper naming
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dimensions') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'supplierId' && value !== undefined) {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add photo if selected
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      return apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Produto atualizado',
        description: 'O produto foi atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setLocation('/produtos-novo');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message || 'Ocorreu um erro ao atualizar o produto.',
        variant: 'destructive',
      });
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Produto não encontrado</h3>
          <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => setLocation('/produtos-novo')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/produtos-novo')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Dados Básicos
          </TabsTrigger>
        </TabsList>

        {/* Basic Data Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o SKU" {...field} />
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
                            <Input placeholder="Digite a marca" {...field} />
                          </FormControl>
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
                            <Input placeholder="Digite a categoria" {...field} />
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
                            placeholder="Descreva o produto..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bulletPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bullet Points</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite os bullet points do produto..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use uma linha para cada bullet point
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Produto Ativo</FormLabel>
                          <FormDescription>
                            Desative para ocultar o produto do sistema
                          </FormDescription>
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
                </CardContent>
              </Card>

              {/* Codes and Technical Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Códigos e Dados Técnicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="freeCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Livre</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o código livre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Fornecedor</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o código do fornecedor" {...field} />
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
                          <FormLabel>Código Interno</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o código interno" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ean"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EAN/Código de Barras</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o EAN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ncm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NCM</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o NCM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.001"
                              placeholder="0.000" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost and Tax Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Custos e Impostos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="costItem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo do Item (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="packCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo da Embalagem (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Imposto (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Photo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Foto do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {photoPreview && (
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="photo">Selecionar Foto</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suppliers Section - Outside of form */}
            </form>
          </Form>

          {/* Suppliers Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fornecedores do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSupplierManagerRefactored 
                productId={parseInt(id!)} 
                productName={product?.name || ''} 
              />
            </CardContent>
          </Card>

          {/* Submit Button - Outside form but inside tab */}
          <div className="flex justify-end">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </TabsContent>





      </Tabs>
    </div>
  );
};

export default ProductEditWithTabs;
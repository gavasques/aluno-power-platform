import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Package, Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";
import type { InsertProduct, Product as DbProduct } from '@shared/schema';

const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  photo: z.string().optional(),
  sku: z.string().optional(),
  internalCode: z.string().optional(),
  ean: z.string().optional(),
  weight: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  supplierId: z.number().optional(),
  ncm: z.string().optional(),
  costItem: z.string().optional(),
  packCost: z.string().optional(),
  taxPercent: z.string().optional(),
  observations: z.string().optional(),
  active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const ProductEditForm = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { getProductById, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<DbProduct | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      photo: '',
      sku: '',
      internalCode: '',
      ean: '',
      weight: '',
      brand: '',
      category: '',
      ncm: '',
      costItem: '',
      packCost: '',
      taxPercent: '',
      observations: '',
      active: true,
    },
  });

  useEffect(() => {
    if (id) {
      const productData = getProductById(parseInt(id));
      if (productData) {
        setProduct(productData);
        // Reset form with product data
        form.reset({
          name: productData.name || '',
          photo: productData.photo || '',
          sku: productData.sku || '',
          internalCode: productData.internalCode || '',
          ean: productData.ean || '',
          weight: productData.weight || '',
          brand: productData.brand || '',
          category: productData.category || '',
          ncm: productData.ncm || '',
          costItem: productData.costItem || '',
          packCost: productData.packCost || '',
          taxPercent: productData.taxPercent || '',
          observations: productData.observations || '',
          active: productData.active,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: "O produto solicitado não foi encontrado.",
          variant: "destructive",
        });
        setLocation("/minha-area/produtos");
      }
    }
  }, [id, getProductById, form, setLocation]);

  const onSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const productData: Partial<InsertProduct> = {
        ...data,
        weight: data.weight ? data.weight : null,
        costItem: data.costItem ? data.costItem : null,
        packCost: data.packCost ? data.packCost : null,
        taxPercent: data.taxPercent ? data.taxPercent : null,
        supplierId: data.supplierId || null,
      };

      await updateProduct(parseInt(id), productData);
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso!",
      });
      
      setLocation("/minha-area/produtos");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minha-area/produtos")}
            className="mb-6 hover:bg-white/80 dark:hover:bg-slate-800/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Editar Produto</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Edite as informações do produto: {product.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Produto */}
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Nome do produto"
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    placeholder="SKU do produto"
                    className="mt-1"
                  />
                </div>

                {/* Código Interno */}
                <div>
                  <Label htmlFor="internalCode">Código Interno</Label>
                  <Input
                    id="internalCode"
                    {...form.register('internalCode')}
                    placeholder="Código interno"
                    className="mt-1"
                  />
                </div>

                {/* EAN */}
                <div>
                  <Label htmlFor="ean">EAN</Label>
                  <Input
                    id="ean"
                    {...form.register('ean')}
                    placeholder="Código EAN"
                    className="mt-1"
                  />
                </div>

                {/* Peso */}
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    {...form.register('weight')}
                    placeholder="0.000"
                    type="number"
                    step="0.001"
                    className="mt-1"
                  />
                </div>

                {/* Marca */}
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    {...form.register('brand')}
                    placeholder="Marca do produto"
                    className="mt-1"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    {...form.register('category')}
                    placeholder="Categoria do produto"
                    className="mt-1"
                  />
                </div>

                {/* NCM */}
                <div>
                  <Label htmlFor="ncm">NCM</Label>
                  <Input
                    id="ncm"
                    {...form.register('ncm')}
                    placeholder="Código NCM"
                    className="mt-1"
                  />
                </div>

                {/* Custo Item */}
                <div>
                  <Label htmlFor="costItem">Custo do Item (R$)</Label>
                  <Input
                    id="costItem"
                    {...form.register('costItem')}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="mt-1"
                  />
                </div>

                {/* Custo Pack */}
                <div>
                  <Label htmlFor="packCost">Custo do Pack (R$)</Label>
                  <Input
                    id="packCost"
                    {...form.register('packCost')}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="mt-1"
                  />
                </div>

                {/* Percentual de Taxa */}
                <div>
                  <Label htmlFor="taxPercent">Taxa (%)</Label>
                  <Input
                    id="taxPercent"
                    {...form.register('taxPercent')}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  {...form.register('observations')}
                  placeholder="Observações sobre o produto"
                  className="mt-1 h-24"
                />
              </div>

              {/* Status Ativo */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.watch('active')}
                  onCheckedChange={(checked) => form.setValue('active', checked)}
                />
                <Label htmlFor="active">Produto ativo</Label>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 justify-end pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setLocation("/minha-area/produtos")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductEditForm;
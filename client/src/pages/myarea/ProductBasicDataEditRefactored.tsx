import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductFormWrapper } from "@/shared/components/forms/ProductFormWrapper";
import { useUrlProductId } from "@/shared/hooks/useUrlProductId";
import { useProductQuery } from "@/shared/hooks/useProductQuery";
import { useProductMutation } from "@/shared/hooks/useProductMutation";

const basicDataSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().optional(),
  ean: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  ncm: z.string().optional(),
  weight: z.number().min(0, "Peso deve ser positivo").optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }).optional(),
  photo: z.string().optional(),
});

type BasicDataForm = z.infer<typeof basicDataSchema>;

/**
 * Product basic data editing page
 * Single Responsibility: Handle product basic information editing
 * Follows Open/Closed Principle - extensible without modification
 */
export default function ProductBasicDataEditRefactored() {
  const productId = useUrlProductId();
  const { data: product, isLoading } = useProductQuery(productId);
  const mutation = useProductMutation(productId);

  const form = useForm<BasicDataForm>({
    resolver: zodResolver(basicDataSchema),
    defaultValues: {
      name: "",
      sku: "",
      ean: "",
      description: "",
      category: "",
      brandId: "",
      supplierId: "",
      ncm: "",
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      photo: "",
    },
  });

  // Get supporting data with optimized queries
  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        sku: product.sku || "",
        ean: product.ean || "",
        description: product.description || "",
        category: product.category || "",
        brandId: product.brandId?.toString() || "",
        supplierId: product.supplierId?.toString() || "",
        ncm: product.ncm || "",
        weight: Number(product.weight) || 0,
        dimensions: {
          length: Number(product.dimensions?.length) || 0,
          width: Number(product.dimensions?.width) || 0,
          height: Number(product.dimensions?.height) || 0,
        },
        photo: product.photo || "",
      });
    }
  }, [product, form]);

  const onSubmit = (data: BasicDataForm) => {
    mutation.mutate({
      ...data,
      brandId: data.brandId ? parseInt(data.brandId) : undefined,
      supplierId: data.supplierId ? parseInt(data.supplierId) : undefined,
    });
  };

  if (isLoading) {
    return (
      <ProductFormWrapper
        productId={productId}
        title="Editar Dados do Produto"
        subtitle="Carregando..."
        description="Carregando dados do produto..."
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ProductFormWrapper>
    );
  }

  return (
    <ProductFormWrapper
      productId={productId}
      title="Editar Dados do Produto"
      subtitle={product?.name || ""}
      description="Configure as informações básicas do produto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do produto" />
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
                    <Input {...field} placeholder="Código SKU" />
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
                  <FormLabel>EAN/GTIN</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Código de barras" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhuma marca</SelectItem>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
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
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum fornecedor</SelectItem>
                      {suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.tradeName || supplier.corporateName}
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
                    <Input {...field} placeholder="Categoria do produto" />
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
                    {...field}
                    placeholder="Descrição detalhada do produto"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
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
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comprimento (cm)</FormLabel>
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
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Largura (cm)</FormLabel>
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
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura (cm)</FormLabel>
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

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Dados
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ProductFormWrapper>
  );
}
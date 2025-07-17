import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

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

interface ProductBasicDataEditProps {
  productId: string;
}

export default function ProductBasicDataEdit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get product ID from URL
  const productId = window.location.pathname.split('/')[3];

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

  // Get product data
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Get brands and suppliers
  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
  });

  const { data: suppliersResponse } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const suppliers = suppliersResponse?.data || [];

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        sku: product.sku || product.internalCode || "",
        ean: product.ean || "",
        description: product.description || "",
        category: product.category || "",
        brandId: product.brandId?.toString() || "",
        supplierId: product.supplierId?.toString() || "",
        ncm: product.ncm || "",
        weight: product.weight || 0,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        photo: product.photo || "",
      });
    }
  }, [product, form]);

  const onSubmit = async (data: BasicDataForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          brandId: data.brandId ? parseInt(data.brandId) : null,
          supplierId: data.supplierId ? parseInt(data.supplierId) : null,
        }),
      });

      toast({
        title: "Produto atualizado",
        description: "Os dados básicos do produto foram atualizados com sucesso.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      // Go back to product list
      setLocation("/minha-area/produtos");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados do produto.",
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Dados do Produto</h1>
              <p className="text-muted-foreground">
                Edite as informações básicas do produto
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do produto
                </CardDescription>
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
                        <FormLabel>SKU / Código</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código interno do produto" />
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
                        <FormLabel>EAN / Código de Barras</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código de barras" />
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
                          <Input {...field} placeholder="Categoria do produto" />
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
                                {supplier.tradeName}
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

                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Foto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="URL da imagem do produto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
                <CardDescription>
                  Dados técnicos e dimensões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ncm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NCM</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código NCM" />
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
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="Peso em quilogramas"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comprimento (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="Comprimento"
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
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="Largura"
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
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="Altura"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    Salvar Alterações
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
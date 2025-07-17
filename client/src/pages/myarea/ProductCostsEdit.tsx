import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Calculator, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { formatBRL } from "@/utils/pricingCalculations";

const costsSchema = z.object({
  costItem: z.number().min(0, "Custo deve ser positivo"),
  taxPercent: z.number().min(0).max(100, "Taxa deve estar entre 0 e 100%"),
  packCost: z.number().min(0, "Custo de embalagem deve ser positivo").optional(),
});

type CostsForm = z.infer<typeof costsSchema>;

export default function ProductCostsEdit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get product ID from URL
  const productId = window.location.pathname.split('/')[3];

  const form = useForm<CostsForm>({
    resolver: zodResolver(costsSchema),
    defaultValues: {
      costItem: 0,
      taxPercent: 0,
      packCost: 0,
    },
  });

  const { watch } = form;
  const watchedCostItem = watch("costItem");
  const watchedTaxPercent = watch("taxPercent");
  const watchedPackCost = watch("packCost");

  // Get product data
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        costItem: product.costItem || 0,
        taxPercent: product.taxPercent || 0,
        packCost: product.packCost || 0,
      });
    }
  }, [product, form]);

  // Calculate total cost including taxes and packaging
  const calculateTotalCost = () => {
    const baseWithTax = watchedCostItem * (1 + watchedTaxPercent / 100);
    return baseWithTax + (watchedPackCost || 0);
  };

  const onSubmit = async (data: CostsForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          costItem: data.costItem,
          taxPercent: data.taxPercent,
          packCost: data.packCost,
        }),
      });

      toast({
        title: "Custos atualizados",
        description: "Os custos do produto foram atualizados com sucesso.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      // Go back to product list
      setLocation("/minha-area/produtos");
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os custos do produto.",
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
              <h1 className="text-3xl font-bold text-gray-900">Editar Custos e Impostos</h1>
              <p className="text-muted-foreground">
                Configure os custos básicos e impostos do produto
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Custos do Produto
                </CardTitle>
                <CardDescription>
                  Configure os custos e impostos básicos do produto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="costItem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Custo do Item *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-10 text-lg"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Custo base do produto
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Taxa de Impostos (%)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400">%</span>
                            <Input
                              type="number"
                              step="0.1"
                              max="100"
                              className="pl-10 text-lg"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.0"
                            />
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Percentual de impostos aplicado
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Custo de Embalagem</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              step="0.01"
                              className="pl-10 text-lg"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Custo adicional da embalagem
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cost Breakdown */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumo dos Custos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Custo base:</span>
                        <span className="font-medium">{formatBRL(watchedCostItem)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impostos ({watchedTaxPercent}%):</span>
                        <span className="font-medium">{formatBRL(watchedCostItem * (watchedTaxPercent / 100))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Custo com impostos:</span>
                        <span className="font-medium">{formatBRL(watchedCostItem * (1 + watchedTaxPercent / 100))}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Embalagem:</span>
                        <span className="font-medium">{formatBRL(watchedPackCost || 0)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">Custo Total:</span>
                          <span className="font-bold text-lg text-blue-600">
                            {formatBRL(calculateTotalCost())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Margem para 20%</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatBRL(calculateTotalCost() / 0.8)}
                      </p>
                      <p className="text-xs text-gray-500">Preço de venda sugerido</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Margem para 30%</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatBRL(calculateTotalCost() / 0.7)}
                      </p>
                      <p className="text-xs text-gray-500">Preço de venda sugerido</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Margem para 40%</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatBRL(calculateTotalCost() / 0.6)}
                      </p>
                      <p className="text-xs text-gray-500">Preço de venda sugerido</p>
                    </div>
                  </Card>
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
                    Salvar Custos
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
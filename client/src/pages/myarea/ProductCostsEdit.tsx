import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { ProductFormWrapper } from "@/shared/components/forms/ProductFormWrapper";
import { CostSummaryCard } from "@/shared/components/forms/CostSummaryCard";
import { useUrlProductId } from "@/shared/hooks/useUrlProductId";
import { useProductQuery } from "@/shared/hooks/useProductQuery";
import { useProductMutation } from "@/shared/hooks/useProductMutation";

const costsSchema = z.object({
  costItem: z.number().min(0, "Custo deve ser positivo"),
  taxPercent: z.number().min(0).max(100, "Taxa deve estar entre 0 e 100%"),
  packCost: z.number().min(0, "Custo de embalagem deve ser positivo").optional(),
});

type CostsForm = z.infer<typeof costsSchema>;

/**
 * Product costs editing page
 * Single Responsibility: Handle product cost and tax editing
 * Follows SOLID principles with separated concerns
 */
export default function ProductCostsEdit() {
  const productId = useUrlProductId();
  const { data: product, isLoading } = useProductQuery(productId);
  const mutation = useProductMutation(productId);

  const form = useForm<CostsForm>({
    resolver: zodResolver(costsSchema),
    defaultValues: {
      costItem: 0,
      taxPercent: 0,
      packCost: 0,
    },
  });

  const { watch } = form;
  const watchedValues = watch();

  // Load product data into form when available
  useEffect(() => {
    if (product) {
      form.reset({
        costItem: Number(product.costItem) || 0,
        taxPercent: Number(product.taxPercent) || 0,
        packCost: Number(product.packCost) || 0,
      });
    }
  }, [product, form]);

  const onSubmit = (data: CostsForm) => {
    mutation.mutate({
      costItem: data.costItem,
      taxPercent: data.taxPercent,
      packCost: data.packCost || 0,
    });
  };

  if (isLoading) {
    return (
      <ProductFormWrapper
        productId={productId}
        title="Editar Custos e Impostos"
        subtitle="Carregando..."
        description="Carregando dados do produto..."
      >
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      </ProductFormWrapper>
    );
  }

  return (
    <ProductFormWrapper
      productId={productId}
      title="Editar Custos e Impostos"
      subtitle={product?.name || ""}
      description="Configure os custos básicos e impostos do produto"
    >
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="costItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo do Item *</FormLabel>
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
                name="taxPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Impostos (%)</FormLabel>
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
                name="packCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo de Embalagem</FormLabel>
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

            <CostSummaryCard
              costItem={watchedValues.costItem || 0}
              taxPercent={watchedValues.taxPercent || 0}
              packCost={watchedValues.packCost || 0}
            />

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <ButtonLoader />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Custos
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ProductFormWrapper>
  );
}
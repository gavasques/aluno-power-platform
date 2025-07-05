import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  PricingProduct, 
  ProductCosts, 
  SalesChannel, 
  ChannelType,
  ProductDimensions 
} from "@/types/pricing";
import { calculateCubicWeight } from "@/utils/pricingCalculations";
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  BarChart3,
  Save,
  X,
  Loader2
} from "lucide-react";

// Import tab components
import ProductBasicDataTab from "./tabs/ProductBasicDataTab";
import ProductCostsTab from "./tabs/ProductCostsTab";
import ProductChannelsTab from "./tabs/ProductChannelsTab";
import ProductResultsTab from "./tabs/ProductResultsTab";

// Form schema
const productFormSchema = z.object({
  // Basic data
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  photo: z.string().optional(),
  ean: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  supplierId: z.string().min(1, "Fornecedor é obrigatório"),
  ncm: z.string().optional(),
  
  // Dimensions
  dimensions: z.object({
    length: z.number().min(0.1, "Comprimento deve ser maior que 0"),
    width: z.number().min(0.1, "Largura deve ser maior que 0"),
    height: z.number().min(0.1, "Altura deve ser maior que 0"),
  }),
  weight: z.number().min(0.01, "Peso deve ser maior que 0"),
  
  // Costs
  costs: z.object({
    currentCost: z.number().min(0, "Custo não pode ser negativo"),
    taxPercent: z.number().min(0).max(100, "Imposto deve estar entre 0 e 100"),
    observations: z.string().optional(),
  }),
  
  // Channels
  channels: z.array(z.any()).optional(), // Will be validated in each channel component
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function ProductPricingForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [calculatedCubicWeight, setCalculatedCubicWeight] = useState(0);
  const isEditing = !!id;

  // Initialize form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      photo: "",
      ean: "",
      brand: "",
      categoryId: "",
      supplierId: "",
      ncm: "",
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      weight: 0,
      costs: {
        currentCost: 0,
        taxPercent: 0,
        observations: "",
      },
      channels: [],
    },
  });

  // Watch dimensions to calculate cubic weight
  const dimensions = form.watch("dimensions");
  const weight = form.watch("weight");

  useEffect(() => {
    if (dimensions.length && dimensions.width && dimensions.height) {
      const cubicWeight = calculateCubicWeight(dimensions);
      setCalculatedCubicWeight(cubicWeight);
    }
  }, [dimensions]);

  // Load existing product if editing
  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: isEditing,
  });

  // Update form when product is loaded
  useEffect(() => {
    if (existingProduct && isEditing) {
      // Map existing product data to form structure
      form.reset({
        name: existingProduct.name || "",
        photo: existingProduct.photo || "",
        ean: existingProduct.ean || "",
        brand: existingProduct.brand || "",
        categoryId: existingProduct.categoryId?.toString() || "",
        supplierId: existingProduct.supplierId?.toString() || "",
        ncm: existingProduct.ncm || "",
        dimensions: existingProduct.dimensions || {
          length: 0,
          width: 0,
          height: 0,
        },
        weight: existingProduct.weight || 0,
        costs: {
          currentCost: existingProduct.costItem || 0,
          taxPercent: existingProduct.taxPercent || 0,
          observations: existingProduct.observations || "",
        },
        channels: existingProduct.channels || [],
      });
    }
  }, [existingProduct, isEditing, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Add basic fields
      formData.append("name", data.name);
      if (data.ean) formData.append("ean", data.ean);
      if (data.brand) formData.append("brand", data.brand);
      formData.append("categoryId", data.categoryId);
      formData.append("supplierId", data.supplierId);
      if (data.ncm) formData.append("ncm", data.ncm);
      
      // Add dimensions and weight
      formData.append("dimensions", JSON.stringify(data.dimensions));
      formData.append("weight", data.weight.toString());
      formData.append("calculatedWeight", Math.max(data.weight, calculatedCubicWeight).toString());
      
      // Add costs
      formData.append("costItem", data.costs.currentCost.toString());
      formData.append("taxPercent", data.costs.taxPercent.toString());
      formData.append("totalCost", ((data.costs.currentCost * (1 + data.costs.taxPercent / 100))).toString());
      if (data.costs.observations) {
        formData.append("observations", data.costs.observations);
      }
      
      // Add channels configuration
      if (data.channels) {
        formData.append("channels", JSON.stringify(data.channels));
      }
      
      // Add image if selected
      if (imageFile) {
        formData.append("photo", imageFile);
      }
      
      const url = isEditing ? `/api/products/${id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar produto");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: "As informações foram salvas com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      }
      
      navigate(`/minha-area/produtos/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    saveMutation.mutate(data);
  };

  const handleSaveAndContinue = (data: ProductFormData) => {
    saveMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Produto salvo",
          description: "Continue editando as informações.",
        });
      },
    });
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-muted-foreground">
            Configure todos os dados e precificação do produto
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/minha-area/produtos")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Dados Básicos</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Custos</span>
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Canais</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Resultados</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <ProductBasicDataTab
                form={form}
                imageFile={imageFile}
                setImageFile={setImageFile}
                calculatedCubicWeight={calculatedCubicWeight}
              />
            </TabsContent>

            <TabsContent value="costs">
              <ProductCostsTab form={form} />
            </TabsContent>

            <TabsContent value="channels">
              <ProductChannelsTab form={form} />
            </TabsContent>

            <TabsContent value="results">
              <ProductResultsTab
                form={form}
                calculatedCubicWeight={calculatedCubicWeight}
              />
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/minha-area/produtos")}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(handleSaveAndContinue)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar e Continuar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
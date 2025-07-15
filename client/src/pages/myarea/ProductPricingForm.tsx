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
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { logger } from "@/utils/logger";
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
  Save,
  X,
  Loader2
} from "lucide-react";

// Import tab components
import ProductBasicDataTab from "@/pages/myarea/tabs/ProductBasicDataTab";
import ProductCostsTab from "@/pages/myarea/tabs/ProductCostsTab";
import ProductChannelsTab from "@/pages/myarea/tabs/ProductChannelsTab";

// Form schema
const productFormSchema = z.object({
  // ID for editing
  id: z.number().optional(),
  
  // Basic data
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  sku: z.string().min(1, "Código SKU é obrigatório"),
  freeCode: z.string().optional(),
  supplierCode: z.string().optional(),
  photo: z.string().optional(),
  ean: z.string().optional(),
  brandId: z.string().optional(),
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
    currentCost: z.union([z.number(), z.string()]).transform((val) => {
      if (typeof val === 'string') return val;
      return String(val);
    }),
    taxPercent: z.union([z.number(), z.string()]).transform((val) => {
      if (typeof val === 'string') return val;
      return String(val);
    }),
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
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [calculatedCubicWeight, setCalculatedCubicWeight] = useState(0);
  const isEditing = !!id;

  // Initialize form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      freeCode: "",
      supplierCode: "",
      photo: "",
      ean: "",
      brandId: "",
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
        currentCost: "0",
        taxPercent: "0",
        observations: "",
      },
      channels: [],
    },
  });

  // Watch dimensions to calculate cubic weight
  const dimensions = form.watch("dimensions");
  const weight = form.watch("weight");

  useEffect(() => {
    if (dimensions && dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      const cubicWeight = calculateCubicWeight(dimensions);
      setCalculatedCubicWeight(cubicWeight);
    } else {
      setCalculatedCubicWeight(0);
    }
  }, [dimensions?.length, dimensions?.width, dimensions?.height]);

  // Load existing product if editing
  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: isEditing,
  }) as { data: any, isLoading: boolean };

  // Update form when product is loaded
  useEffect(() => {
    if (existingProduct && isEditing) {
      logger.debug("🔍 [PRODUCT_PRICING_FORM] Existing product data:", existingProduct);
      logger.debug("🔍 [PRODUCT_PRICING_FORM] BrandId from product:", existingProduct?.brandId);
      logger.debug("🔍 [PRODUCT_PRICING_FORM] Category from product:", existingProduct?.category);
      
      // Map existing product data to form structure
      const productDimensions = existingProduct?.dimensions || {
        length: 0,
        width: 0,
        height: 0,
      };
      
      form.reset({
        id: existingProduct?.id,
        name: existingProduct?.name || "",
        sku: existingProduct?.sku || existingProduct?.internalCode || "", // Use internalCode as fallback if SKU is empty
        freeCode: existingProduct?.freeCode || "",
        supplierCode: existingProduct?.supplierCode || "",
        photo: existingProduct?.photo || "",
        ean: existingProduct?.ean || "",
        brandId: existingProduct?.brandId?.toString() || "",
        categoryId: existingProduct?.category?.toString() || "",
        supplierId: existingProduct?.supplierId?.toString() || "",
        ncm: existingProduct?.ncm || "",
        dimensions: productDimensions,
        weight: existingProduct?.weight || 0,
        costs: {
          currentCost: existingProduct?.costItem ? String(existingProduct.costItem).replace('.', ',') : "0",
          taxPercent: existingProduct?.taxPercent ? String(existingProduct.taxPercent).replace('.', ',') : "0",
          observations: existingProduct?.observations || "",
        },
        channels: existingProduct?.channels || [],
      });
      
      logger.debug("🔍 [PRODUCT_PRICING_FORM] Form reset values:", {
        brandId: existingProduct?.brandId?.toString() || "",
        categoryId: existingProduct?.category?.toString() || "",
        sku: existingProduct?.sku || existingProduct?.internalCode || ""
      });
      
      // Force update brand and category fields with a small delay
      setTimeout(() => {
        if (existingProduct?.brandId) {
          form.setValue("brandId", existingProduct.brandId.toString());
          logger.debug("🔍 [PRODUCT_PRICING_FORM] Force set brandId:", existingProduct.brandId.toString());
        }
        if (existingProduct?.category) {
          form.setValue("categoryId", existingProduct.category.toString());
          logger.debug("🔍 [PRODUCT_PRICING_FORM] Force set categoryId:", existingProduct.category.toString());
        }
      }, 100);
      
      // Calculate cubic weight for loaded product
      if (productDimensions.length > 0 && productDimensions.width > 0 && productDimensions.height > 0) {
        const cubicWeight = calculateCubicWeight(productDimensions);
        setCalculatedCubicWeight(cubicWeight);
      }
    }
  }, [existingProduct, isEditing, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Add basic fields
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      if (data.freeCode) formData.append("freeCode", data.freeCode);
      if (data.supplierCode) formData.append("supplierCode", data.supplierCode);
      if (data.ean) formData.append("ean", data.ean);
      if (data.brandId) formData.append("brandId", data.brandId);
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
      formData.append("packCost", "0"); // Default to 0 for now
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
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
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
    console.log("🔄 [handleSaveAndContinue] Iniciado com dados:", {
      hasData: !!data,
      productName: data?.name,
      sku: data?.sku,
      isEditing,
      id
    });
    
    const saveData = async () => {
      try {
        console.log("💾 [saveData] Iniciando salvamento assíncrono...");
        const formData = new FormData();
        
        // Add basic fields
        formData.append("name", data.name);
        formData.append("sku", data.sku || "");
        if (data.freeCode) formData.append("freeCode", data.freeCode);
        if (data.supplierCode) formData.append("supplierCode", data.supplierCode);
        if (data.ean) formData.append("ean", data.ean);
        if (data.brandId) formData.append("brandId", data.brandId);
        formData.append("categoryId", data.categoryId);
        formData.append("supplierId", data.supplierId);
        if (data.ncm) formData.append("ncm", data.ncm);
        
        // Add dimensions and weight (as strings for backend compatibility)
        formData.append("dimensions", JSON.stringify(data.dimensions));
        formData.append("weight", String(data.weight));
        formData.append("calculatedWeight", String(Math.max(data.weight, calculatedCubicWeight)));
        
        // Add costs (as strings for backend compatibility)
        formData.append("costItem", String(data.costs.currentCost));
        formData.append("taxPercent", String(data.costs.taxPercent));
        formData.append("packCost", "0");
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
        const method = isEditing ? "PUT" : "POST";
        
        console.log("📤 Enviando para:", url, "Método:", method);
        const currentToken = localStorage.getItem("auth_token");
        console.log("🔑 Token atual:", !!currentToken, currentToken ? currentToken.substring(0, 20) + "..." : "Sem token");
        
        const response = await fetch(url, {
          method,
          headers: {
            "Authorization": `Bearer ${currentToken}`,
          },
          body: formData,
        });
        
        console.log("📨 Resposta recebida:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Erro ao salvar produto");
        }
        
        const savedProduct = await response.json();
        console.log("✅ Produto salvo:", savedProduct);
        
        toast({
          title: "Produto salvo com sucesso",
          description: "Continue editando ou vá para a próxima aba.",
        });
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        if (isEditing) {
          queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
        }
        
        // Se for um produto novo, redireciona para edição
        if (!isEditing && savedProduct?.id) {
          setTimeout(() => {
            navigate(`/minha-area/produtos/${savedProduct.id}/editar`);
          }, 1000);
        } else {
          // Se for edição, avança para próxima aba se não estiver na última
          const tabs = ["basic", "costs", "channels", "descriptions"];
          const currentIndex = tabs.indexOf(activeTab);
          if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        toast({
          title: "Erro ao salvar",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    };
    
    console.log("🚀 [handleSaveAndContinue] Chamando saveData()...");
    saveData();
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
            <TabsList className="grid w-full grid-cols-3">
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
            </TabsList>

            <TabsContent value="basic">
              <ProductBasicDataTab
                form={form}
                imageFile={imageFile}
                setImageFile={setImageFile}
                calculatedCubicWeight={calculatedCubicWeight}
                isEditing={isEditing}
                productId={id}
              />
            </TabsContent>

            <TabsContent value="costs">
              <ProductCostsTab 
                form={form} 
                isEditing={isEditing}
                productId={id}
              />
            </TabsContent>

            <TabsContent value="channels">
              <ProductChannelsTab form={form} />
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
          </div>
        </form>
      </Form>
    </div>
  );
}
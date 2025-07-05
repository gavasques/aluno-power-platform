import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Image, 
  Upload, 
  X, 
  Package,
  Ruler,
  Weight,
  Barcode,
  Building,
  Factory,
  Save,
  Loader2
} from "lucide-react";
import { formatBRL } from "@/utils/pricingCalculations";
import { useState } from "react";

interface ProductBasicDataTabProps {
  form: UseFormReturn<any>;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  calculatedCubicWeight: number;
  isEditing?: boolean;
  productId?: string;
}

export default function ProductBasicDataTab({ 
  form, 
  imageFile, 
  setImageFile,
  calculatedCubicWeight,
  isEditing,
  productId
}: ProductBasicDataTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  
  // Load categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Load suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  // Load brands
  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ["/api/brands"],
  });

  // Debug form values
  const currentFormValues = form.watch();
  console.log("🔍 [PRODUCT_BASIC_TAB] Current form values:", currentFormValues);
  console.log("🔍 [PRODUCT_BASIC_TAB] BrandId value:", currentFormValues.brandId);
  console.log("🔍 [PRODUCT_BASIC_TAB] CategoryId value:", currentFormValues.categoryId);
  console.log("🔍 [PRODUCT_BASIC_TAB] Available brands:", brands);

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("/api/brands", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return response;
    },
    onSuccess: (newBrand: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      form.setValue("brand", newBrand.id.toString());
      setNewBrandName("");
      toast({
        title: "Marca criada",
        description: `A marca "${newBrand.name}" foi criada com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar marca",
        description: error.message || "Não foi possível criar a marca",
        variant: "destructive",
      });
    },
  });

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome para a marca",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingBrand(true);
    await createBrandMutation.mutateAsync(newBrandName.trim());
    setIsCreatingBrand(false);
  };

  // Save basic information
  const saveBasicInfo = async () => {
    try {
      setIsSaving(true);
      const values = form.getValues();
      const token = localStorage.getItem("auth_token");
      
      console.log("🔍 [BASIC_INFO_FRONTEND] Form values:", values);
      console.log("🔍 [BASIC_INFO_FRONTEND] SKU:", values.sku);
      console.log("🔍 [BASIC_INFO_FRONTEND] Category:", values.categoryId);
      console.log("🔍 [BASIC_INFO_FRONTEND] Brand:", values.brandId);
      
      const formData = new FormData();
      
      // Add basic fields
      formData.append("name", values.name || "");
      formData.append("sku", values.sku || "");
      if (values.freeCode) formData.append("freeCode", values.freeCode);
      if (values.supplierCode) formData.append("supplierCode", values.supplierCode);
      if (values.ean) formData.append("ean", values.ean);
      if (values.brandId) formData.append("brandId", values.brandId);
      if (values.categoryId) formData.append("categoryId", values.categoryId);
      if (values.supplierId) formData.append("supplierId", values.supplierId);
      if (values.ncm) formData.append("ncm", values.ncm);
      
      // Add dimensions and weight
      if (values.dimensions) {
        formData.append("dimensions", JSON.stringify(values.dimensions));
      }
      if (values.weight !== undefined) {
        formData.append("weight", values.weight.toString());
        formData.append("calculatedWeight", Math.max(values.weight, calculatedCubicWeight).toString());
      }
      
      // Add image if selected
      if (imageFile) {
        formData.append("photo", imageFile);
      }
      
      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar");
      }
      
      toast({
        title: "Informações básicas salvas",
        description: "As informações básicas foram salvas com sucesso.",
      });
      
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image upload with automatic save
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (3MB max)
      if (file.size > 3 * 1024 * 1024) {
        form.setError("photo", {
          type: "manual",
          message: "A imagem deve ter no máximo 3MB",
        });
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        form.setError("photo", {
          type: "manual",
          message: "Formato inválido. Use JPG, PNG ou WebP",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-save photo if editing existing product
      if (isEditing && productId) {
        try {
          const token = localStorage.getItem("auth_token");
          const formData = new FormData();
          formData.append("photo", file);
          
          const response = await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (response.ok) {
            toast({
              title: "Foto salva automaticamente",
              description: "A imagem foi salva com sucesso.",
            });
          }
        } catch (error) {
          // Silent fail for auto-save - don't disrupt user experience
          console.error("Auto-save failed:", error);
        }
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    form.setValue("photo", "");
  };

  const dimensions = form.watch("dimensions");
  const weight = form.watch("weight");
  const billableWeight = Math.max(weight || 0, calculatedCubicWeight);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Capa para iPhone 15 Pro Max" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SKU *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: CAPA-IP15PM-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="freeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Livre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: CLV-001" />
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
                  <FormLabel>Código no Fornecedor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: FORN-12345" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => {
                console.log("🔍 [BRAND_SELECT] Field value:", field.value);
                console.log("🔍 [BRAND_SELECT] Available brands:", brands);
                console.log("🔍 [BRAND_SELECT] Loading brands:", loadingBrands);
                return (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    disabled={loadingBrands}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBrands ? "Carregando marcas..." : "Selecione uma marca"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(brands as any[])?.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2 space-y-2">
                    <Label className="text-sm text-muted-foreground">Inserir Marca</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nova marca"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        disabled={isCreatingBrand}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCreateBrand();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateBrand}
                        disabled={isCreatingBrand || !newBrandName.trim()}
                      >
                        {isCreatingBrand ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Criar"
                        )}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="ean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    Código de Barras (EAN)
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 7891234567890" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Categoria *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(categories as any[])
                        ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                        ?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
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
                  <FormLabel className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    Fornecedor *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(suppliers as any[])?.map((supplier: any) => (
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
          </div>

          <FormField
            control={form.control}
            name="ncm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NCM (Nomenclatura Comum do Mercosul)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 8523.51.10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Product Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Foto do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-4">
                    {field.value ? (
                      <div className="relative inline-block">
                        <img
                          src={field.value}
                          alt="Produto"
                          className="w-48 h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-8 w-8"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-sm text-gray-600">
                            Clique para fazer upload ou arraste a imagem aqui
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG ou WebP. Máximo 3MB.
                        </p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Dimensions and Weight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Dimensões e Peso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comprimento (cm) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Largura (cm) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Altura (cm) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Peso Real (kg) *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.001"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Peso Cubado (kg)</FormLabel>
              <div className="bg-gray-50 border rounded-md p-3 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Fórmula: (C × L × A) ÷ 6000
                </div>
                <div className="text-lg font-semibold">
                  {calculatedCubicWeight.toFixed(3)} kg
                </div>
                {dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0 && (
                  <div className="text-xs text-muted-foreground">
                    ({dimensions.length} × {dimensions.width} × {dimensions.height}) ÷ 6000
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billable Weight Summary */}
          {(weight > 0 || calculatedCubicWeight > 0) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Peso Faturável</p>
                  <p className="text-sm text-blue-700">
                    O maior entre peso real e peso cubado
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {billableWeight.toFixed(3)} kg
                  </p>
                  <Badge variant={billableWeight === weight ? "default" : "secondary"}>
                    {billableWeight === weight ? "Peso Real" : "Peso Cubado"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button for Basic Information */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={saveBasicInfo}
          disabled={isSaving}
          className="min-w-[150px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Informações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
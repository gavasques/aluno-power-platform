import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Image, 
  Upload, 
  X, 
  Package,
  Ruler,
  Weight,
  Barcode,
  Building,
  Factory
} from "lucide-react";
import { formatBRL } from "@/utils/pricingCalculations";

interface ProductBasicDataTabProps {
  form: UseFormReturn<any>;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  calculatedCubicWeight: number;
}

export default function ProductBasicDataTab({ 
  form, 
  imageFile, 
  setImageFile,
  calculatedCubicWeight 
}: ProductBasicDataTabProps) {
  // Load categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Load suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Apple, Samsung" />
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
                      {(categories as any[])?.map((category: any) => (
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
    </div>
  );
}
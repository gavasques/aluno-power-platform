import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  Loader2,
  Image,
  Upload,
  X,
  Package,
  Barcode,
  Building,
  Factory,
} from "lucide-react";

// Validation schema for basic info
const basicInfoSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório").max(120, "Nome deve ter no máximo 120 caracteres"),
  sku: z.string().min(1, "SKU é obrigatório"),
  freeCode: z.string().optional(),
  supplierCode: z.string().optional(),
  ean: z.string().optional().refine((val) => !val || val.length <= 13, "EAN deve ter no máximo 13 dígitos"),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  ncm: z.string().optional(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoEditorProps {
  productId: string;
  trigger?: React.ReactNode;
}

export default function BasicInfoEditor({ productId, trigger }: BasicInfoEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load product data
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: isOpen,
  });

  // Load categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/departments"],
    enabled: isOpen,
  });

  // Load suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
    enabled: isOpen,
  });

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      sku: "",
      freeCode: "",
      supplierCode: "",
      ean: "",
      brand: "",
      categoryId: "",
      supplierId: "",
      ncm: "",
    },
  });

  // Update form when product loads
  React.useEffect(() => {
    if (product && isOpen) {
      form.reset({
        name: (product as any).name || "",
        sku: (product as any).sku || "",
        freeCode: (product as any).freeCode || "",
        supplierCode: (product as any).supplierCode || "",
        ean: (product as any).ean || "",
        brand: (product as any).brand || "",
        categoryId: (product as any).category || "",
        supplierId: (product as any).supplierId?.toString() || "",
        ncm: (product as any).ncm || "",
      });
      setImagePreview((product as any).photo || null);
    }
  }, [product, isOpen, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 3MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use apenas arquivos PNG, JPG, JPEG ou WebP",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      console.log("🔍 [BASIC_INFO_FORM] Form data being submitted:", data);
      console.log("🔍 [BASIC_INFO_FORM] Category value:", data.categoryId);

      const formData = new FormData();
      
      // Add basic fields
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      if (data.freeCode) formData.append("freeCode", data.freeCode);
      if (data.supplierCode) formData.append("supplierCode", data.supplierCode);
      if (data.ean) formData.append("ean", data.ean);
      if (data.brand) formData.append("brand", data.brand);
      if (data.categoryId) {
        console.log("🔍 [BASIC_INFO_FORM] Adding categoryId to FormData:", data.categoryId);
        formData.append("categoryId", data.categoryId);
      } else {
        console.log("🔍 [BASIC_INFO_FORM] No categoryId to add");
      }
      if (data.supplierId) formData.append("supplierId", data.supplierId);
      if (data.ncm) formData.append("ncm", data.ncm);

      // Add image if uploaded
      if (imageFile) {
        formData.append("photo", imageFile);
      } else if (imagePreview === null) {
        // User removed existing image
        formData.append("photo", "");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao salvar informações básicas");
      }

      toast({
        title: "Sucesso!",
        description: "Informações básicas salvas com sucesso",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving basic info:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao salvar informações básicas",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Editar Informações Básicas
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Editar Informações Básicas do Produto
          </DialogTitle>
        </DialogHeader>

        {loadingProduct ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando informações...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
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
                            <Input {...field} placeholder="Ex: iPhone 15 Pro Max" />
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
                          <FormLabel>Código SKU *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: IPH15PM128" />
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
                            <Input {...field} placeholder="Código personalizado" />
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
                            <Input {...field} placeholder="Código do fornecedor" />
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
                          <FormLabel>
                            <Barcode className="inline h-4 w-4 mr-1" />
                            Código de Barras (EAN)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: 1234567890123" maxLength={13} />
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
                            <Input {...field} placeholder="Ex: Apple" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Building className="inline h-4 w-4 mr-1" />
                            Categoria
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(categories as any[]).map((category: any) => (
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
                          <FormLabel>
                            <Factory className="inline h-4 w-4 mr-1" />
                            Fornecedor
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um fornecedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(suppliers as any[]).map((supplier: any) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  {supplier.name}
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
                      name="ncm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NCM (Nomenclatura Comum do Mercosul)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: 8517.12.31" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Photo Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Foto do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="h-6 w-6 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-500 mt-1">Sem foto</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            {imagePreview ? "Alterar Foto" : "Adicionar Foto"}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG ou WebP. Máximo 3MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Informações Básicas
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
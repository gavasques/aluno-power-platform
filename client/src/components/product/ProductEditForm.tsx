import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";

interface ProductFormData {
  name: string;
  sku: string;
  brand: string;
  category: string;
  ean: string;
  weight: string;
  costItem: string;
  packCost: string;
  taxPercent: string;
  observations: string;
  active: boolean;
}

export default function ProductEditForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const productId = params.id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    brand: "",
    category: "",
    ean: "",
    weight: "",
    costItem: "",
    packCost: "",
    taxPercent: "",
    observations: "",
    active: true
  });

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }
      return response.json();
    },
    enabled: !!productId
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        brand: product.brand || "",
        category: product.category || "",
        ean: product.ean || "",
        weight: product.weight ? String(product.weight) : "",
        costItem: product.costItem ? String(product.costItem) : "",
        packCost: product.packCost ? String(product.packCost) : "",
        taxPercent: product.taxPercent ? String(product.taxPercent) : "",
        observations: product.observations || "",
        active: product.active
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        weight: data.weight ? parseFloat(data.weight) : null,
        costItem: data.costItem ? parseFloat(data.costItem) : null,
        packCost: data.packCost ? parseFloat(data.packCost) : null,
        taxPercent: data.taxPercent ? parseFloat(data.taxPercent) : null
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar produto');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso"
      });
      window.location.href = '/minha-area/produtos';
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleBack = () => {
    window.location.href = '/minha-area/produtos';
  };

  const handleChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Produto</h1>
            <p className="text-muted-foreground">Atualize as informações do produto</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Digite o nome do produto"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      placeholder="SKU do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ean">EAN</Label>
                    <Input
                      id="ean"
                      value={formData.ean}
                      onChange={(e) => handleChange('ean', e.target.value)}
                      placeholder="Código EAN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      placeholder="Marca do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      placeholder="Categoria do produto"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    placeholder="Observações adicionais sobre o produto"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informações Financeiras */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="costItem">Custo do Item (R$)</Label>
                  <Input
                    id="costItem"
                    type="number"
                    step="0.01"
                    value={formData.costItem}
                    onChange={(e) => handleChange('costItem', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="packCost">Custo de Embalagem (R$)</Label>
                  <Input
                    id="packCost"
                    type="number"
                    step="0.01"
                    value={formData.packCost}
                    onChange={(e) => handleChange('packCost', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="taxPercent">Taxa de Imposto (%)</Label>
                  <Input
                    id="taxPercent"
                    type="number"
                    step="0.01"
                    value={formData.taxPercent}
                    onChange={(e) => handleChange('taxPercent', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="active">Produto ativo</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
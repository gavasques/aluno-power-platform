import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Package } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SupplierBrandsProps {
  supplierId: number;
}

interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  createdAt: string;
}

const SupplierBrands = ({ supplierId }: SupplierBrandsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: "",
    description: "",
    logo: ""
  });

  // Buscar marcas do fornecedor
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers', supplierId, 'brands'],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/brands`);
      if (!response.ok) throw new Error('Failed to fetch brands');
      return response.json();
    },
  });

  // Mutation para criar nova marca
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: typeof newBrand) => {
      return apiRequest(`/api/suppliers/${supplierId}/brands`, {
        method: 'POST',
        body: JSON.stringify(brandData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId, 'brands'] });
      setIsDialogOpen(false);
      setNewBrand({ name: "", description: "", logo: "" });
      toast({
        title: "Sucesso",
        description: "Marca adicionada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar marca",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar marca
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: number) => {
      return apiRequest(`/api/suppliers/brands/${brandId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId, 'brands'] });
      toast({
        title: "Sucesso",
        description: "Marca removida com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover marca",
        variant: "destructive",
      });
    },
  });

  const handleCreateBrand = () => {
    if (!newBrand.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da marca é obrigatório",
        variant: "destructive",
      });
      return;
    }
    createBrandMutation.mutate(newBrand);
  };

  const handleDeleteBrand = (brandId: number) => {
    if (confirm("Tem certeza que deseja remover esta marca?")) {
      deleteBrandMutation.mutate(brandId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div>Carregando marcas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Marcas do Fornecedor</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as marcas que este fornecedor revende
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Marca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand-name">Nome da Marca *</Label>
                <Input
                  id="brand-name"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Ex: Samsung, Apple, Dell..."
                />
              </div>
              
              <div>
                <Label htmlFor="brand-description">Descrição</Label>
                <Textarea
                  id="brand-description"
                  value={newBrand.description}
                  onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                  placeholder="Descrição da marca (opcional)"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="brand-logo">URL do Logo</Label>
                <Input
                  id="brand-logo"
                  value={newBrand.logo}
                  onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })}
                  placeholder="https://exemplo.com/logo.png (opcional)"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateBrand}
                  disabled={createBrandMutation.isPending}
                >
                  {createBrandMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma marca cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione as marcas que este fornecedor revende
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Marca
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand: Brand) => (
            <Card key={brand.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{brand.name}</CardTitle>
                    {brand.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {brand.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBrand(brand.id)}
                    disabled={deleteBrandMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {brand.logo && (
                <CardContent className="pt-0">
                  <div className="flex justify-center">
                    <img
                      src={brand.logo}
                      alt={`Logo ${brand.name}`}
                      className="max-h-12 max-w-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierBrands;
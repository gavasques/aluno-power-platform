import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Edit, Building2 } from "lucide-react";

interface Brand {
  id: number;
  name: string;
  userId: number;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MyBrands() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load brands
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("/api/brands", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Marca criada",
        description: "Nova marca foi criada com sucesso",
      });
      setIsDialogOpen(false);
      setBrandName("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar marca",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: number) => {
      return await apiRequest(`/api/brands/${brandId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Marca excluída",
        description: "Marca foi excluída com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir marca",
        description: error.message || "Não é possível excluir marcas globais",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    createBrandMutation.mutate(brandName.trim());
  };

  const handleDelete = (brand: Brand) => {
    if (brand.isGlobal) {
      toast({
        title: "Não é possível excluir",
        description: "Marcas globais não podem ser excluídas",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a marca "${brand.name}"?`)) {
      deleteBrandMutation.mutate(brand.id);
    }
  };

  const userBrands = brands.filter(brand => !brand.isGlobal);
  const globalBrands = brands.filter(brand => brand.isGlobal);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando marcas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Marcas</h1>
          <p className="text-muted-foreground">
            Gerencie suas marcas personalizadas para organizar seus produtos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Marca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Marca</DialogTitle>
              <DialogDescription>
                Adicione uma nova marca para organizar seus produtos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="brandName">Nome da Marca</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Digite o nome da marca"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBrandMutation.isPending || !brandName.trim()}
                >
                  {createBrandMutation.isPending ? "Criando..." : "Criar Marca"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Minhas Marcas */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Minhas Marcas Personalizadas</CardTitle>
          </div>
          <CardDescription>
            Marcas criadas por você ({userBrands.length} marca{userBrands.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userBrands.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma marca personalizada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie sua primeira marca para organizar melhor seus produtos
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Marca
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userBrands.map((brand) => (
                <Card key={brand.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{brand.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Criada em {new Date(brand.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(brand)}
                          disabled={deleteBrandMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marcas Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Marcas do Sistema</CardTitle>
          <CardDescription>
            Marcas disponíveis para todos os usuários ({globalBrands.length} marca{globalBrands.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {globalBrands.map((brand) => (
              <Card key={brand.id} className="border-l-4 border-l-gray-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{brand.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        Global
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
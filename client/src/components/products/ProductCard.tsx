import { useState } from "react";
import { Link } from "wouter";
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  name: string;
  image?: string;
  ean?: string;
  brand?: string;
  baseCost: number;
  packagingCost?: number;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
  channels: Array<{
    id: number;
    channelType: string;
    salePrice: number;
    isActive: boolean;
  }>;
  calculations?: Array<{
    channelType: string;
    margin: number;
    profit: number;
    isActive: boolean;
  }>;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutação para deletar produto
  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/api/products/${product.id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produto deletado",
        description: "O produto foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutação para alternar status
  const toggleStatusMutation = useMutation({
    mutationFn: () => apiRequest(`/api/products/${product.id}/toggle-status`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Status alterado",
        description: `Produto ${product.isActive ? 'desativado' : 'ativado'} com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate();
  };

  // Calcular métricas dos canais
  const activeChannels = (product.channels || []).filter(c => c.isActive);
  const totalChannels = (product.channels || []).length;
  const bestMargin = product.calculations?.reduce((best, calc) => 
    calc.margin > (best?.margin || 0) ? calc : best
  );

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Iniciais do nome do produto para o avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${!product.isActive ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                {product.image ? (
                  <AvatarImage src={product.image} alt={product.name} />
                ) : (
                  <AvatarFallback>
                    {getInitials(product.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-6 truncate">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/myarea/products/${product.id}`}>
                  <DropdownMenuItem>
                    <Package className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                </Link>
                <Link href={`/myarea/products/${product.id}/edit`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleToggleStatus}
                  disabled={toggleStatusMutation.isPending}
                >
                  {product.isActive ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Custo Base</p>
                <p className="font-medium">{formatCurrency(product.baseCost)}</p>
              </div>
              {product.ean && (
                <div>
                  <p className="text-muted-foreground">EAN</p>
                  <p className="font-medium text-xs">{product.ean}</p>
                </div>
              )}
            </div>

            {/* Métricas dos canais */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Canais</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {activeChannels.length}/{totalChannels} ativos
                  </p>
                  {bestMargin && bestMargin.margin > 0 && (
                    <p className="text-xs text-green-600">
                      Melhor margem: {bestMargin.margin.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fornecedor */}
            {product.supplier && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="text-sm font-medium truncate">{product.supplier.name}</p>
              </div>
            )}

            {/* Ações rápidas */}
            <div className="flex gap-2 pt-2">
              <Link href={`/myarea/products/${product.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </Link>
              <Link href={`/myarea/products/${product.id}/pricing`} className="flex-1">
                <Button size="sm" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Simular Preços
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de delete */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto "{product.name}" será permanentemente 
              removido do sistema junto com todos os seus dados de pricing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar Produto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
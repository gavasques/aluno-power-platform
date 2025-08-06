import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SearchIcon, Plus, Trash2, Package2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProductCompatibilityProps {
  boxId?: number;
  boxCode?: string;
}

interface Product {
  id: number;
  name: string;
  brand?: string;
  sku?: string;
  description?: string;
}

interface CompatibleProduct {
  id: number;
  boxId: number;
  productId: number;
  productName: string;
  productBrand?: string;
  productSku?: string;
  createdAt: string;
}

const ProductCompatibility: React.FC<ProductCompatibilityProps> = ({ boxId, boxCode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch compatible products for this box
  const { data: compatibleProducts = [], isLoading: isLoadingCompatible } = useQuery<CompatibleProduct[]>({
    queryKey: ['/api/boxes', boxId, 'compatibility'],
    enabled: !!boxId,
  });

  // Search for products to add - busca apenas produtos do usuário logado
  const { data: searchResults = [], isLoading: isSearching } = useQuery<Product[]>({
    queryKey: ['/api/products/search', searchTerm],
    enabled: searchTerm.length > 2,
  });

  // Add product compatibility mutation
  const addCompatibilityMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest(`/api/boxes/${boxId}/compatibility`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boxes', boxId, 'compatibility'] });
      toast({
        title: 'Sucesso',
        description: 'Produto adicionado à compatibilidade',
      });
      setSearchTerm('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o produto',
        variant: 'destructive',
      });
    },
  });

  // Remove product compatibility mutation
  const removeCompatibilityMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest(`/api/boxes/${boxId}/compatibility/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boxes', boxId, 'compatibility'] });
      toast({
        title: 'Sucesso',
        description: 'Produto removido da compatibilidade',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o produto',
        variant: 'destructive',
      });
    },
  });

  const handleAddProduct = (productId: number) => {
    addCompatibilityMutation.mutate(productId);
  };

  const handleRemoveProduct = (productId: number) => {
    removeCompatibilityMutation.mutate(productId);
  };

  if (!boxId) {
    return <div>Erro: ID da caixa não fornecido</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Product Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Produto Compatível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos por nome, marca ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchTerm.length > 2 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Buscando produtos...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Nenhum produto encontrado</div>
                ) : (
                  <div className="divide-y">
                    {searchResults.map((product: Product) => (
                      <div key={product.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.brand && <span>Marca: {product.brand}</span>}
                            {product.sku && <span className="ml-2">SKU: {product.sku}</span>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddProduct(product.id)}
                          disabled={addCompatibilityMutation.isPending || 
                                   compatibleProducts.some((cp: CompatibleProduct) => cp.productId === product.id)}
                        >
                          {compatibleProducts.some((cp: CompatibleProduct) => cp.productId === product.id) 
                            ? 'Já compatível' 
                            : 'Adicionar'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compatible Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Produtos Compatíveis ({compatibleProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCompatible ? (
            <div className="text-center py-8">Carregando produtos compatíveis...</div>
          ) : compatibleProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto compatível cadastrado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Data de Adição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compatibleProducts.map((cp: CompatibleProduct) => (
                    <TableRow key={cp.id}>
                      <TableCell className="font-medium">{cp.productName}</TableCell>
                      <TableCell>{cp.productBrand || '-'}</TableCell>
                      <TableCell>{cp.productSku || '-'}</TableCell>
                      <TableCell>
                        {new Date(cp.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover "{cp.productName}" da lista de produtos compatíveis com a caixa {boxCode}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveProduct(cp.productId)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCompatibility;
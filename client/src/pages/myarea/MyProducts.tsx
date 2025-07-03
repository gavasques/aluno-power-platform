import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit, Trash2, Power } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product as DbProduct } from '@shared/schema';

const MyProducts = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { products, loading, error, deleteProduct, toggleProductStatus, refetch, searchProducts } = useProducts();

  // Filter and search products
  const filteredProducts = products.filter((product: DbProduct) => {
    // Status filter
    if (statusFilter === 'active' && !product.active) return false;
    if (statusFilter === 'inactive' && product.active) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao deletar produto.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleProductStatus(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Erro ao carregar produtos: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Meus Produtos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Gerencie seus produtos cadastrados ({products.length} produtos)
                </p>
              </div>
              <Button
                onClick={() => setLocation("/minha-area/produtos/novo")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar produtos por nome, marca, categoria ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-slate-800"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Apenas ativos</option>
                  <option value="inactive">Apenas inativos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            {searchTerm || statusFilter !== 'all' ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Tente ajustar os filtros ou criar um novo produto
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  variant="outline"
                  className="mr-4"
                >
                  Limpar filtros
                </Button>
                <Button onClick={() => setLocation("/minha-area/produtos/novo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum produto cadastrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Comece criando seu primeiro produto
                </p>
                <Button onClick={() => setLocation("/minha-area/produtos/novo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: DbProduct) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Marca: {product.brand}
                        </p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {product.category && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/minha-area/produtos/${product.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/minha-area/produtos/${product.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(product.id)}
                        className={product.active ? "text-orange-600" : "text-green-600"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
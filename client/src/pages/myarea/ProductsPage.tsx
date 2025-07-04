import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Package } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";

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

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  // Buscar produtos
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/products', { search: searchTerm, categoryId: selectedCategory, supplierId: selectedSupplier }],
    enabled: true
  });

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/products/categories']
  });

  // Buscar fornecedores
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/products/suppliers']
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value);
  };

  const handleSupplierChange = (value: string) => {
    setSelectedSupplier(value === "all" ? "" : value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSupplier("");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar produtos</h3>
              <p className="text-muted-foreground mb-4">
                Ocorreu um erro ao buscar seus produtos. Tente novamente.
              </p>
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e simule preços por canal de venda
          </p>
        </div>
        <Link href="/myarea/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedSupplier={selectedSupplier}
            categories={categories}
            suppliers={suppliers}
            onSearchChange={handleSearch}
            onCategoryChange={handleCategoryChange}
            onSupplierChange={handleSupplierChange}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-16" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory || selectedSupplier
                  ? "Nenhum produto corresponde aos filtros aplicados."
                  : "Você ainda não tem produtos cadastrados. Comece criando seu primeiro produto."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {(searchTerm || selectedCategory || selectedSupplier) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                )}
                <Link href="/myarea/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resultados */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
            {(searchTerm || selectedCategory || selectedSupplier) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
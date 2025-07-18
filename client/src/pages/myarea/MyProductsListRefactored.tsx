import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { formatBRL } from "@/utils/pricingCalculations";
import { calculateChannelProfitability, type ChannelCalculationResult } from "@/utils/channelCalculations";
import { cn } from "@/lib/utils";
import { Product } from "@shared/schema";
import { ITEMS_PER_PAGE, CHANNEL_NAMES } from "@/shared/constants/product";
import { getActiveChannels } from "@/shared/utils/productCalculations";
import { ProductActionButtons } from "@/shared/components/ProductActionButtons";
import { useProductDeleteMutation } from "@/shared/hooks/useProductMutation";

/**
 * Products list page with enhanced performance and maintainability
 * Single Responsibility: Display and manage products list
 * Follows SOLID principles and DRY methodology
 * Interface Segregation: Separated action handlers for specific functionalities
 */
export default function MyProductsListRefactored() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [, setLocation] = useLocation();
  const { data: products = [], isLoading } = useProducts();
  const { data: brands = [] } = useBrands();
  const deleteMutation = useProductDeleteMutation();

  // Debounce search term to avoid excessive re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  /**
   * Get brand name with fallback logic
   * Single Responsibility: Handle brand name resolution
   */
  const getBrandName = (product: Product): string => {
    if (product.brandId) {
      const brand = brands?.find(b => b.id === product.brandId);
      return brand?.name || '-';
    }
    
    if (product.brand && !isNaN(Number(product.brand))) {
      const brand = brands?.find(b => b.id === Number(product.brand));
      return brand?.name || product.brand;
    }
    
    return product.brand || '-';
  };

  /**
   * Handle product deletion with confirmation
   * Single Responsibility: Manage product deletion flow
   */
  const handleDelete = (id: string, productName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  /**
   * Handle create product navigation
   * Single Responsibility: Navigate to product creation
   */
  const handleCreate = () => {
    window.location.href = `/minha-area/produtos/novo`;
  };

  /**
   * Toggle row expansion for detailed view
   * Single Responsibility: Manage UI state for expandable rows
   */
  const toggleRowExpansion = (productId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  /**
   * Get channel calculations for a product
   * Single Responsibility: Calculate channel profitability
   */
  const getChannelCalculations = (product: any): { channel: any; calculation: ChannelCalculationResult }[] => {
    const activeChannels = getActiveChannels(product);
    if (!activeChannels.length) return [];

    return activeChannels.map((channel: any) => {
      const productBase = {
        costItem: parseFloat(product.costItem) || 0,
        taxPercent: parseFloat(product.taxPercent) || 0,
      };

      return {
        channel,
        calculation: calculateChannelProfitability(channel.type, channel.data || {}, productBase)
      };
    });
  };

  // Filter products based on debounced search with memoization
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    return products.filter((product: Product) =>
      product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.ean?.includes(debouncedSearchTerm)
    );
  }, [products, debouncedSearchTerm]);

  // Pagination calculations with performance optimization
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  /**
   * Handle search with pagination reset
   * Open/Closed Principle: Extensible search functionality
   */
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
                      <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-lg text-muted-foreground">Carregando produtos...</p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Produtos</h1>
              <p className="text-gray-600">
                Gerencie seus produtos e configure preços por canal de venda
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, SKU, marca ou EAN..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages || 1}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border-2 border-gray-100 shadow-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-gray-200 bg-gray-50/50">
                <TableHead className="w-[40px] py-4"></TableHead>
                <TableHead className="w-[90px] py-4 font-semibold text-gray-700">Foto</TableHead>
                <TableHead className="py-4 font-semibold text-gray-700">Nome do Produto</TableHead>
                <TableHead className="w-[120px] py-4 font-semibold text-gray-700">SKU</TableHead>
                <TableHead className="w-[140px] py-4 font-semibold text-gray-700">Marca</TableHead>
                <TableHead className="w-[120px] text-right py-4 font-semibold text-gray-700">Custo</TableHead>
                <TableHead className="min-w-[280px] py-4 font-semibold text-gray-700">Canais Ativos</TableHead>
                <TableHead className="w-[220px] text-center py-4 font-semibold text-gray-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreate} className="flex items-center gap-2 mx-auto">
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Produto
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product: any) => {
                  const activeChannels = getActiveChannels(product);
                  const channelCalculations = getChannelCalculations(product);
                  const isExpanded = expandedRows.has(product.id);

                  return (
                    <React.Fragment key={product.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-blue-50/30 transition-colors border-b border-gray-100"
                        onClick={() => toggleRowExpansion(product.id)}
                      >
                        <TableCell className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-6 w-6 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(product.id);
                            }}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="py-3">
                          {product.photo ? (
                            <img
                              src={product.photo}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300 shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-lg border-2 border-gray-300 shadow-md flex items-center justify-center text-xs text-gray-600 font-semibold">
                              SEM FOTO
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium py-3">
                          <div>
                            <div className="text-gray-900 font-semibold">{product.name}</div>
                            {product.category && (
                              <div className="mt-1 mb-1">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {product.category}
                                </span>
                              </div>
                            )}
                            <div className="mt-1">
                              <Badge 
                                variant={product.active ? "default" : "secondary"} 
                                className={cn(
                                  "text-xs px-2 py-0.5",
                                  product.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {product.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-gray-700 font-mono text-sm">
                          {product.internalCode || product.sku || <span className="text-gray-400 italic">-</span>}
                        </TableCell>
                        <TableCell className="py-3 text-gray-700">
                          {getBrandName(product)}
                        </TableCell>
                        <TableCell className="text-right py-3 font-semibold text-gray-900">
                          {product.costItem ? formatBRL(parseFloat(product.costItem)) : '-'}
                        </TableCell>
                        <TableCell className="py-3">
                          {activeChannels.length > 0 ? (
                            <div className="space-y-1 max-w-[280px]">
                              {activeChannels.slice(0, 2).map((channel: any, index: number) => {
                                const channelCalc = channelCalculations.find(c => c.channel.type === channel.type);
                                const calculation = channelCalc?.calculation;
                                return (
                                  <div key={`${product.id}-${channel.type}-${index}`} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-xs">
                                    <span className="font-medium text-gray-700">
                                      {CHANNEL_NAMES[channel.type] || channel.type}
                                    </span>
                                    {calculation && (
                                      <Badge 
                                        variant={calculation.marginPercent >= 20 ? "default" : "destructive"}
                                        className={cn(
                                          "text-xs px-1.5 py-0.5 min-w-[50px] text-center",
                                          calculation.marginPercent >= 30 ? "bg-green-500 text-white" :
                                          calculation.marginPercent >= 20 ? "bg-blue-500 text-white" :
                                          calculation.marginPercent >= 10 ? "bg-yellow-500 text-white" :
                                          "bg-red-500 text-white"
                                        )}
                                      >
                                        {calculation.marginPercent.toFixed(1)}%
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                              {activeChannels.length > 2 && (
                                <div className="text-center mt-1">
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600">
                                    +{activeChannels.length - 2} outros
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <div className="bg-gray-50 rounded-md p-2 border-2 border-dashed border-gray-300 max-w-[180px] mx-auto">
                                <span className="text-xs text-gray-500 italic">Nenhum canal</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <ProductActionButtons
                            productId={product.id.toString()}
                            productName={product.name}
                            onDelete={handleDelete}
                          />
                        </TableCell>
                      </TableRow>
                      {/* Expanded calculation details */}
                      {isExpanded && activeChannels.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg mb-2">Detalhes dos Cálculos por Canal</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {channelCalculations.map(({ channel, calculation }, index) => (
                                  <div key={`${product.id}-${channel.type}-${index}`} className="bg-white rounded-lg border p-3 space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold">{CHANNEL_NAMES[channel.type] || channel.type}</h5>
                                      <Badge 
                                        variant={calculation.marginPercent >= 20 ? "default" : "destructive"}
                                        className={cn(
                                          calculation.marginPercent >= 30 ? "bg-green-500" :
                                          calculation.marginPercent >= 20 ? "bg-blue-500" :
                                          calculation.marginPercent >= 10 ? "bg-yellow-500" :
                                          "bg-red-500"
                                        )}
                                      >
                                        {calculation.marginPercent.toFixed(1)}%
                                      </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Preço de Venda:</span>
                                        <span className="font-semibold">{formatBRL(calculation.finalPrice)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Margem:</span>
                                        <span className="font-semibold">{formatBRL(calculation.marginValue)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Taxa do Canal:</span>
                                        <span className="text-gray-600">{calculation.channelFeePercent.toFixed(2)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
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
  Loader2, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  TrendingDown
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { formatBRL, calculateChannelPricing } from "@/utils/pricingCalculations";
import { calculateChannelProfitability, getDetailedCostBreakdown, type ChannelCalculationResult, type CostBreakdownItem } from "@/utils/channelCalculations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SalesChannel, PricingCalculation } from "@/types/pricing";
import { Product } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { ITEMS_PER_PAGE, CHANNEL_NAMES } from "@/shared/constants/product";
import { getActiveChannels } from "@/shared/utils/productCalculations";
import { ProductActionButtons } from "@/shared/components/ProductActionButtons";
import { useProductDeleteMutation } from "@/shared/hooks/useProductMutation";

/**
 * Products list page with enhanced performance and maintainability
 * Single Responsibility: Display and manage products list
 * Follows SOLID principles and DRY methodology
 */
export default function MyProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [expandedCosts, setExpandedCosts] = useState<Record<string, boolean>>({});
  const { products, isLoading, error, deleteProduct } = useProducts();
  const { brands } = useBrands();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Debounce search term to avoid excessive re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get brand name by ID
  const getBrandName = (product: Product): string => {
    // If brandId exists, use it to find the brand
    if (product.brandId) {
      const brand = brands?.find(b => b.id === product.brandId);
      return brand?.name || '-';
    }

    // If brand field contains a number (legacy ID), try to find it
    if (product.brand && !isNaN(Number(product.brand))) {
      const brand = brands?.find(b => b.id === Number(product.brand));
      return brand?.name || product.brand;
    }

    // Otherwise return the brand field as is (might be a string name)
    return product.brand || '-';
  };

  const handleEditBasicData = (id: number) => {
    setLocation(`/minha-area/produtos/${id}/editar-dados`);
  };

  const handleEditCosts = (id: number) => {
    setLocation(`/minha-area/produtos/${id}/editar-custos`);
  };

  const handleEditChannels = (id: number) => {
    setLocation(`/minha-area/produtos/${id}/editar-canais`);
  };

  const handleCreate = () => {
    window.location.href = `/minha-area/produtos/novo`;
  };

  const deleteMutation = useProductDeleteMutation();

  const handleDelete = (id: string, productName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

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

  const getChannelCalculations = (product: any): { channel: any; calculation: ChannelCalculationResult }[] => {
    try {
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
    } catch (error) {
      return [];
    }
  };

  // Filter products based on debounced search
  const filteredProducts = useMemo(() => {
    // Ensure we have a valid array before processing
    if (!products || !Array.isArray(products)) {
      console.warn('Products data is not an array:', products);
      return [];
    }

    return products.filter((product: Product) =>
      product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.ean?.includes(debouncedSearchTerm)
    );
  }, [products, debouncedSearchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
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
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-red-600">Erro: {error?.message || 'Erro desconhecido'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="space-y-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, SKU, marca ou EAN..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} produtos encontrados
              {searchTerm && ` para "${searchTerm}"`}
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                  toast({
                    title: "Lista atualizada",
                    description: "As informações dos produtos foram atualizadas.",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4" />
                Atualizar
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
                        <TableCell className="py-3">
                          <span className="text-gray-900 font-medium">
                            {getBrandName(product) || <span className="text-gray-400 italic">Sem marca</span>}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          {product.costItem ? (
                            <span className="font-semibold text-gray-900">{formatBRL(product.costItem)}</span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[280px] py-3">
                          {channelCalculations.length > 0 ? (
                            <div className="space-y-1">
                              {channelCalculations.slice(0, 2).map(({ channel, calculation }, index) => (
                                <div key={`${product.id}-${channel.id || channel.type}-${index}`} 
                                     className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-1.5 border border-gray-200 shadow-sm max-w-[250px]">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0 flex-1 gap-2">
                                      <span className="font-semibold text-xs text-gray-900 truncate">
                                        {CHANNEL_NAMES[channel.type] || channel.name}
                                      </span>
                                      <span className="text-xs text-gray-600 font-medium">
                                        {formatBRL(channel.data?.price || 0)}
                                      </span>
                                    </div>
                                    <Badge 
                                      variant="outline"
                                      className={cn(
                                        "text-xs px-1.5 py-0.5 font-bold border-0 rounded-full shadow-sm ml-1 flex-shrink-0",
                                        calculation.marginPercent >= 30 ? "bg-green-100 text-green-800" :
                                        calculation.marginPercent >= 20 ? "bg-blue-100 text-blue-800" :
                                        calculation.marginPercent >= 10 ? "bg-yellow-100 text-yellow-800" :
                                        "bg-red-100 text-red-800"
                                      )}
                                    >
                                      {calculation.marginPercent.toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {channelCalculations.length > 2 && (
                                <div className="text-center mt-1">
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600">
                                    +{channelCalculations.length - 2} outros
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
                      {isExpanded && channelCalculations.length > 0 && (
                        <TableRow key={`${product.id}-details`}>
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
                                        {calculation.marginPercent.toFixed(1)}% margem
                                      </Badge>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Preço de Venda:</span>
                                        <span className="font-medium">{formatBRL(channel.data?.price || 0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span 
                                          className="text-gray-600 cursor-pointer hover:text-gray-800 underline decoration-dotted"
                                          onClick={() => setExpandedCosts(prev => ({
                                            ...prev,
                                            [`${product.id}-${channel.type}`]: !prev[`${product.id}-${channel.type}`]
                                          }))}
                                        >
                                          Custo Total:
                                        </span>
                                        <span>{formatBRL(calculation.totalCosts)}</span>
                                      </div>

                                      {expandedCosts[`${product.id}-${channel.type}`] && (() => {
                                        const costBreakdown = getDetailedCostBreakdown(
                                          channel.type,
                                          channel.data || {},
                                          {
                                            costItem: product.costItem || 0,
                                            taxPercent: product.taxPercent || 0
                                          },
                                          product.packCost || 0
                                        );

                                        return (
                                          <div className="ml-2 mt-1 space-y-1 text-xs border-l-2 border-gray-200 pl-2">
                                            {costBreakdown.map((item: CostBreakdownItem, index: number) => (
                                              <div key={index} className={cn(
                                                "flex justify-between",
                                                item.isRebate ? "text-green-600" : "text-gray-500"
                                              )}>
                                                <span>{item.label}:</span>
                                                <span className={cn(
                                                  item.isRebate && "font-medium"
                                                )}>
                                                  {item.isRebate ? '+' : ''}{formatBRL(item.value)}
                                                </span>
                                              </div>
                                            ))}
                                            <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-200">
                                              <span className="font-medium">Total:</span>
                                              <span className="font-medium">{formatBRL(calculation.totalCosts)}</span>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Preço:</span>
                                        <span>{formatBRL(channel.data?.price || 0)}</span>
                                      </div>
                                      <div className="flex justify-between pt-1 border-t">
                                        <span className="text-gray-600">Lucro Líquido:</span>
                                        <span className={cn(
                                          "font-medium",
                                          calculation.netProfit > 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                          {formatBRL(calculation.netProfit)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">ROI:</span>
                                        <span className="font-medium">{calculation.roi.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Margem:</span>
                                        <span className={cn(
                                          "font-medium",
                                          calculation.marginPercent >= 20 ? "text-green-600" : 
                                          calculation.marginPercent >= 10 ? "text-yellow-600" : "text-red-600"
                                        )}>
                                          {calculation.marginPercent.toFixed(1)}%
                                        </span>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Select
                value={currentPage.toString()}
                onValueChange={(value) => setCurrentPage(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <SelectItem key={page} value={page.toString()}>
                      Página {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                de {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
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
          </div>
        )}
      </div>
    </div>
  );
}
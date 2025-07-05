import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Store
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatBRL, calculateChannelPricing } from "@/utils/pricingCalculations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SalesChannel, PricingCalculation } from "@/types/pricing";
import BasicInfoEditor from "@/components/product/BasicInfoEditor";
import { ChannelsEditor } from "@/components/product/ChannelsEditor";
import { useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 50;

// Channel display configuration
const CHANNEL_NAMES: Record<string, string> = {
  'SITE_PROPRIO': 'Site',
  'AMAZON_FBM': 'FBM',
  'AMAZON_FBA_ON_SITE': 'FBA-Site',
  'AMAZON_DBA': 'DBA',
  'AMAZON_FBA': 'FBA',
  'ML_ME1': 'ML-ME1',
  'ML_FLEX': 'ML-Flex',
  'ML_ENVIOS': 'ML-Envios',
  'ML_FULL': 'ML-Full',
  'SHOPEE': 'Shopee',
  'MARKETPLACE_OTHER': 'Outro'
};

export default function MyProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [channelsEditorOpen, setChannelsEditorOpen] = useState(false);
  const [channelsEditorProductId, setChannelsEditorProductId] = useState<number | null>(null);
  const { products, isLoading, error, deleteProduct } = useProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (id: number) => {
    window.location.href = `/minha-area/produtos/${id}/editar`;
  };

  const handleCreate = () => {
    window.location.href = `/minha-area/produtos/novo`;
  };

  const handleDelete = async (id: number, productName: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
      try {
        await deleteProduct(id);
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o produto.",
          variant: "destructive",
        });
      }
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

  const getActiveChannels = (product: any): { channel: SalesChannel; calculation: PricingCalculation }[] => {
    if (!product.channels) return [];
    
    try {
      const channels = typeof product.channels === 'string' 
        ? JSON.parse(product.channels) 
        : product.channels;
      
      if (!Array.isArray(channels)) return [];
      
      return channels
        .filter((channel: SalesChannel) => channel.enabled)
        .map((channel: SalesChannel) => ({
          channel,
          calculation: calculateChannelPricing(product, channel)
        }));
    } catch (error) {
      return [];
    }
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ean?.includes(searchTerm)
    );
  }, [products, searchTerm]);

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
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[50px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Canais Ativos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                currentProducts.map((product) => {
                  const activeChannels = getActiveChannels(product);
                  const isExpanded = expandedRows.has(product.id);
                  
                  return (
                    <React.Fragment key={product.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRowExpansion(product.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(product.id);
                            }}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {product.photo ? (
                            <img
                              src={product.photo}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.brand || '-'}</TableCell>
                        <TableCell className="text-right">
                          {product.costItem ? formatBRL(product.costItem) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {activeChannels.length > 0 ? (
                            <div className="space-y-1">
                              {activeChannels.slice(0, 3).map(({ channel, calculation }, index) => (
                                <div key={`${product.id}-${channel.id || channel.type}-${index}`} className="text-xs">
                                  <div className="font-medium">{CHANNEL_NAMES[channel.type] || channel.name}</div>
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-gray-600">{formatBRL(channel.sellingPrice)}</span>
                                    <span 
                                      className={cn(
                                        "font-semibold",
                                        calculation.profitMarginPercent >= 30 ? "text-green-600" :
                                        calculation.profitMarginPercent >= 20 ? "text-blue-600" :
                                        calculation.profitMarginPercent >= 10 ? "text-yellow-600" :
                                        "text-red-600"
                                      )}
                                    >
                                      {calculation.profitMarginPercent.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {activeChannels.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{activeChannels.length - 3} canais
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Nenhum canal ativo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <BasicInfoEditor 
                              productId={product.id.toString()}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Editar Informações Básicas"
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChannelsEditorProductId(product.id);
                                setChannelsEditorOpen(true);
                              }}
                              title="Editar Canais de Venda"
                            >
                              <Store className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(product.id);
                              }}
                              title="Editar Produto Completo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product.id, product.name);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      
                      {/* Expanded calculation details */}
                      {isExpanded && activeChannels.length > 0 && (
                        <TableRow key={`${product.id}-details`}>
                          <TableCell colSpan={9} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm mb-2">Detalhes dos Cálculos por Canal</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeChannels.map(({ channel, calculation }) => (
                                  <div key={channel.id} className="bg-white rounded-lg border p-3 space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold">{channel.name}</h5>
                                      <Badge 
                                        variant={calculation.profitMarginPercent >= 20 ? "default" : "destructive"}
                                        className={cn(
                                          calculation.profitMarginPercent >= 30 ? "bg-green-500" :
                                          calculation.profitMarginPercent >= 20 ? "bg-blue-500" :
                                          calculation.profitMarginPercent >= 10 ? "bg-yellow-500" :
                                          "bg-red-500"
                                        )}
                                      >
                                        {calculation.profitMarginPercent.toFixed(1)}% margem
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Preço de Venda:</span>
                                        <span className="font-medium">{formatBRL(channel.sellingPrice)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Custo Total:</span>
                                        <span>{formatBRL(calculation.totalCost)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Comissão ({channel.fees.commissionPercent}%):</span>
                                        <span>{formatBRL(calculation.commissionValue)}</span>
                                      </div>
                                      {channel.fees.shippingCost && channel.fees.shippingCost > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Frete:</span>
                                          <span>{formatBRL(channel.fees.shippingCost)}</span>
                                        </div>
                                      )}
                                      {channel.fees.advertisingPercent && channel.fees.advertisingPercent > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Publicidade ({channel.fees.advertisingPercent}%):</span>
                                          <span>{formatBRL(calculation.advertisingCost)}</span>
                                        </div>
                                      )}
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

      {/* Channels Editor Modal */}
      {channelsEditorProductId && (
        <ChannelsEditor
          productId={channelsEditorProductId}
          isOpen={channelsEditorOpen}
          onClose={() => {
            setChannelsEditorOpen(false);
            setChannelsEditorProductId(null);
          }}
        />
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Grid, List, Edit, Trash2, Filter, TrendingUp, Package, Eye, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Samsung Galaxy S23",
    photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
    ean: "7899999999999",
    dimensions: { length: 15, width: 8, height: 3 },
    weight: 0.5,
    brand: "Samsung",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85171200",
    costItem: 800,
    packCost: 15,
    taxPercent: 18,
    active: true,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 8,
        salePrice: 1299,
        gatewayPct: 3.5
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 10,
        inboundFreight: 25,
        prepCenter: 8,
        salePrice: 1499
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 20,
        prepCenter: 5,
        salePrice: 1399
      }
    },
    createdAt: "2024-01-15"
  }
];

const MyProducts = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();

  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;
    const matchesActive = showInactive || product.active;
    return matchesSearch && matchesCategory && matchesActive;
  });

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Produto removido",
      description: "O produto foi removido com sucesso."
    });
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStatus = !p.active;
        toast({
          title: newStatus ? "Produto ativado" : "Produto desativado",
          description: newStatus ? "O produto foi ativado com sucesso." : "O produto foi desativado e ocultado do sistema."
        });
        return { ...p, active: newStatus };
      }
      return p;
    }));
  };

  const channelOrder = [
    { key: "sitePropio", label: "Site Próprio", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { key: "amazonFBA", label: "Amazon FBA", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "mlFull", label: "ML Full", color: "bg-yellow-50 text-yellow-700 border-yellow-200" }
  ];

  const getChannelInfo = (product: Product, channelKey: keyof Product["channels"]) => {
    const channel: any = product.channels[channelKey];
    if (!channel?.enabled) return null;
    const result = calculateChannelResults(product, channelKey, channel);
    return {
      price: channel.salePrice,
      margin: result.margin,
      color: channelOrder.find(ch => ch.key === channelKey)?.color ?? ""
    };
  };

  const getTotalStats = () => {
    const total = filteredProducts.length;
    const activeChannels = filteredProducts.reduce((acc, product) => {
      return acc + channelOrder.reduce((cAcc, c) => getChannelInfo(product, c.key as keyof Product["channels"]) ? cAcc + 1 : cAcc, 0);
    }, 0);
    return { total, activeChannels };
  };

  const stats = getTotalStats();

  const ProductCard = ({ product }: { product: Product }) => {
    const enabledChannels = getEnabledChannels(product);
    const bestMargin = enabledChannels.reduce((max, channel) => 
      channel.margin > max ? channel.margin : max, -Infinity
    );

    const handleCardClick = () => {
      navigate(`/minha-area/produtos/${product.id}`);
    };

    return (
      <Card
        className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:shadow-blue-100/50 hover:-translate-y-1 cursor-pointer ${
          !product.active ? 'opacity-50' : ''
        }`}
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`Visualizar detalhes de ${product.name}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-100"
              />
              {bestMargin > 20 && product.active && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  <TrendingUp className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</CardTitle>
              <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50 text-gray-600">
                  {enabledChannels.length} canais
                </Badge>
                <Badge variant={product.active ? "default" : "secondary"} className="text-xs px-2 py-1">
                  {product.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Canais Ativos</span>
                <span className="text-xs text-gray-500">{enabledChannels.length} ativo(s)</span>
              </div>
              <div className="space-y-2">
                {enabledChannels.slice(0, 2).map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-medium border ${channel.color}`}>
                        {channel.name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(channel.price)}</p>
                      <p className={`text-xs font-medium ${channel.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(channel.margin)}
                      </p>
                    </div>
                  </div>
                ))}
                {enabledChannels.length > 2 && (
                  <div className="text-center py-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/minha-area/produtos/${product.id}`);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver mais {enabledChannels.length - 2} canais
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/minha-area/produtos/${product.id}`);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`text-xs ${product.active ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                onClick={e => {
                  e.stopPropagation();
                  handleToggleProductStatus(product.id);
                }}
              >
                {product.active ? <PowerOff className="h-3 w-3 mr-1" /> : <Power className="h-3 w-3 mr-1" />}
                {product.active ? "Desativar" : "Ativar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteProduct(product.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getEnabledChannels = (product: Product) => {
    const channels = [];
    if (product.channels.sitePropio?.enabled) {
      const result = calculateChannelResults(product, 'sitePropio', product.channels.sitePropio);
      channels.push({
        name: "Site Próprio",
        price: product.channels.sitePropio.salePrice,
        margin: result.margin,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200"
      });
    }
    if (product.channels.amazonFBA?.enabled) {
      const result = calculateChannelResults(product, 'amazonFBA', product.channels.amazonFBA);
      channels.push({
        name: "Amazon FBA",
        price: product.channels.amazonFBA.salePrice,
        margin: result.margin,
        color: "bg-orange-50 text-orange-700 border-orange-200"
      });
    }
    if (product.channels.mlFull?.enabled) {
      const result = calculateChannelResults(product, 'mlFull', product.channels.mlFull);
      channels.push({
        name: "ML Full",
        price: product.channels.mlFull.salePrice,
        margin: result.margin,
        color: "bg-yellow-50 text-yellow-700 border-yellow-200"
      });
    }
    return channels;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="w-full py-4">
        {/* Header Section */}
        <div className="mb-6 px-2">
          {/* Header Section */}
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Meus Produtos</h1>
                <p className="text-gray-600">
                  Gerencie seus produtos e analise a viabilidade financeira em diferentes canais
                </p>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => navigate("/minha-area/produtos/novo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-blue-100/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700">Total de Produtos</p>
                      <p className="text-xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-green-100/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700">Canais Ativos</p>
                      <p className="text-xl font-bold text-green-900">{stats.activeChannels}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-purple-100/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Filter className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-700">Categoria Ativa</p>
                      <p className="text-sm font-bold text-purple-900">{selectedCategory}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-4 px-2">
            <Card className="mb-4 border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar produtos por nome ou marca..."
                      className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showInactive}
                        onCheckedChange={setShowInactive}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-sm text-gray-600">Mostrar inativos</span>
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-44 h-10 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center border border-gray-200 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid/List */}
          <div className="mb-4 px-2">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20 text-center">Foto</TableHead>
                          <TableHead className="min-w-[200px]">Produto</TableHead>
                          <TableHead className="w-32">Marca</TableHead>
                          <TableHead className="w-32">Categoria</TableHead>
                          <TableHead className="w-24 text-center">Status</TableHead>
                          {channelOrder.map(c => (
                            <TableHead key={c.key} className="text-center min-w-[160px]">{c.label}</TableHead>
                          ))}
                          <TableHead className="text-center w-40">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map(product => (
                          <TableRow
                            key={product.id}
                            className={`hover:bg-gray-50/50 cursor-pointer ${!product.active ? 'opacity-50' : ''}`}
                            onClick={() => navigate(`/minha-area/produtos/${product.id}`)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Visualizar detalhes de ${product.name}`}
                          >
                            <TableCell className="text-center">
                              <img
                                src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg shadow border border-gray-100 mx-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">{product.brand}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={product.active ? "default" : "secondary"} className="text-xs">
                                {product.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            {channelOrder.map((chan) => {
                              const info = getChannelInfo(product, chan.key as keyof Product["channels"]);
                              return (
                                <TableCell key={chan.key} className="text-center">
                                  {info ? (
                                    <div className="space-y-1">
                                      <div className="font-semibold text-sm text-gray-900">{formatCurrency(info.price)}</div>
                                      <div className={`text-xs font-medium px-2 py-1 rounded ${info.margin > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                        {formatPercentage(info.margin)}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-xs italic">-</span>
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                  onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/minha-area/produtos/${product.id}`);
                                  }}
                                  title="Editar"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${product.active ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleToggleProductStatus(product.id);
                                  }}
                                  title={product.active ? "Desativar" : "Ativar"}
                                >
                                  {product.active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                  title="Remover"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col gap-2 items-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-600 mb-2">Nenhum produto encontrado</p>
                      <Button 
                        onClick={() => navigate("/minha-area/produtos/novo")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Produto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;

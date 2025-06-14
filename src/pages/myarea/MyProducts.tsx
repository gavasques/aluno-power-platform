
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Grid2X2, LayoutList, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";

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
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 8,
        salePrice: 1299
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
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    photo: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop",
    ean: "7899999999998",
    dimensions: { length: 15, width: 7, height: 2 },
    weight: 0.4,
    brand: "Apple",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85171200",
    costItem: 1200,
    packCost: 20,
    taxPercent: 18,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 10,
        salePrice: 1899
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 30,
        prepCenter: 10,
        salePrice: 2199
      },
      mlFull: {
        enabled: false,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 25,
        prepCenter: 8,
        salePrice: 2099
      }
    },
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Notebook Dell Inspiron",
    photo: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
    ean: "7899999999997",
    dimensions: { length: 35, width: 25, height: 5 },
    weight: 2.1,
    brand: "Dell",
    category: "Eletrônicos",
    supplierId: "2",
    ncm: "84713000",
    costItem: 1500,
    packCost: 50,
    taxPercent: 18,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 10,
        otherPct: 3,
        otherValue: 0,
        adsPct: 8,
        salePrice: 2299
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 10,
        inboundFreight: 80,
        prepCenter: 25,
        salePrice: 2599
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 70,
        prepCenter: 20,
        salePrice: 2499
      }
    },
    createdAt: "2024-02-01"
  },
  {
    id: "4",
    name: "Fone Bluetooth JBL",
    photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    ean: "7899999999996",
    dimensions: { length: 12, width: 8, height: 6 },
    weight: 0.3,
    brand: "JBL",
    category: "Eletrônicos",
    supplierId: "3",
    ncm: "85183000",
    costItem: 120,
    packCost: 8,
    taxPercent: 18,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 3,
        otherPct: 2,
        otherValue: 0,
        adsPct: 15,
        salePrice: 199
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 18,
        inboundFreight: 12,
        prepCenter: 4,
        salePrice: 229
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 16,
        inboundFreight: 10,
        prepCenter: 3,
        salePrice: 219
      }
    },
    createdAt: "2024-02-05"
  },
  {
    id: "5",
    name: "Smartwatch Apple Watch SE",
    photo: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=200&h=200&fit=crop",
    ean: "7899999999995",
    dimensions: { length: 8, width: 6, height: 3 },
    weight: 0.2,
    brand: "Apple",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "91021200",
    costItem: 400,
    packCost: 12,
    taxPercent: 18,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 12,
        salePrice: 599
      },
      amazonFBA: {
        enabled: false,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 15,
        inboundFreight: 15,
        prepCenter: 5,
        salePrice: 679
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 14,
        inboundFreight: 12,
        prepCenter: 4,
        salePrice: 649
      }
    },
    createdAt: "2024-02-10"
  },
  {
    id: "6",
    name: "Câmera Canon EOS R10",
    photo: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop",
    ean: "7899999999994",
    dimensions: { length: 18, width: 12, height: 10 },
    weight: 0.8,
    brand: "Canon",
    category: "Eletrônicos",
    supplierId: "4",
    ncm: "90069100",
    costItem: 1800,
    packCost: 40,
    taxPercent: 18,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 15,
        otherPct: 3,
        otherValue: 0,
        adsPct: 8,
        salePrice: 2799
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 10,
        inboundFreight: 50,
        prepCenter: 15,
        salePrice: 3199
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 45,
        prepCenter: 12,
        salePrice: 2999
      }
    },
    createdAt: "2024-02-15"
  }
];

const MyProducts = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Produto removido",
      description: "O produto foi removido com sucesso."
    });
  };

  const getEnabledChannels = (product: Product) => {
    const channels = [];
    if (product.channels.sitePropio?.enabled) {
      const result = calculateChannelResults(product, 'sitePropio', product.channels.sitePropio);
      channels.push({
        name: "Site Próprio",
        price: product.channels.sitePropio.salePrice,
        margin: result.margin,
        color: "bg-blue-100 text-blue-800"
      });
    }
    if (product.channels.amazonFBA?.enabled) {
      const result = calculateChannelResults(product, 'amazonFBA', product.channels.amazonFBA);
      channels.push({
        name: "Amazon FBA",
        price: product.channels.amazonFBA.salePrice,
        margin: result.margin,
        color: "bg-orange-100 text-orange-800"
      });
    }
    if (product.channels.mlFull?.enabled) {
      const result = calculateChannelResults(product, 'mlFull', product.channels.mlFull);
      channels.push({
        name: "ML Full",
        price: product.channels.mlFull.salePrice,
        margin: result.margin,
        color: "bg-yellow-100 text-yellow-800"
      });
    }
    return channels;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const enabledChannels = getEnabledChannels(product);
    
    if (viewMode === "list") {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
              </div>
              <div className="flex gap-4">
                {enabledChannels.map((channel, index) => (
                  <div key={index} className="text-center">
                    <Badge className={`${channel.color} text-xs mb-1`}>{channel.name}</Badge>
                    <p className="font-medium text-sm">{formatCurrency(channel.price)}</p>
                    <p className={`text-xs ${channel.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(channel.margin)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/minha-area/produtos/${product.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <img
              src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop"}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <Badge variant="outline" className="mt-1 text-xs">{product.category}</Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <p className="text-xs font-medium">Canais Ativos:</p>
            {enabledChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <Badge className={`${channel.color} text-xs`}>{channel.name}</Badge>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(channel.price)}</p>
                  <p className={`text-xs ${channel.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(channel.margin)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate(`/minha-area/produtos/${product.id}`)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleDeleteProduct(product.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remover
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Produtos</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie seus produtos e analise a viabilidade financeira em diferentes canais
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar de Filtros - Mais compacto */}
        <div className="lg:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-10 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9">
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Visualização</label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full mt-4" 
            onClick={() => navigate("/minha-area/produtos/novo")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {/* Lista de Produtos */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;

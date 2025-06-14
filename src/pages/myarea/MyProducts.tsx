
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Grid, List, Edit, Trash2 } from "lucide-react";
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
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start gap-4">
            <img
              src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <Badge variant="outline" className="mt-1">{product.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Canais Ativos:</p>
              <div className="space-y-2">
                {enabledChannels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge className={channel.color}>{channel.name}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(channel.price)}</p>
                      <p className={`text-sm ${channel.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(channel.margin)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/minha-area/produtos/${product.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Produtos</h1>
        <p className="text-muted-foreground">
          Gerencie seus produtos e analise a viabilidade financeira em diferentes canais
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
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
        <div className="lg:w-3/4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
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

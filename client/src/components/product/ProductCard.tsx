
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

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
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover ring-2 ring-gray-100"
            />
            {bestMargin > 20 && product.active && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                <TrendingUp className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</CardTitle>
            <p className="text-sm text-gray-600 font-medium mb-3">{product.brand}</p>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                {product.category}
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 text-gray-600">
                {enabledChannels.length} canais
              </Badge>
              <Badge variant={product.active ? "default" : "secondary"} className="text-xs px-3 py-1">
                {product.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {/* Novos campos SKU e Código Interno */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {product.sku && (
                <span><strong>SKU:</strong> {product.sku}</span>
              )}
              {product.internalCode && (
                <span><strong>Código:</strong> {product.internalCode}</span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">Canais Ativos</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{enabledChannels.length} ativo(s)</span>
            </div>
            <div className="space-y-3">
              {enabledChannels.slice(0, 3).map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-100/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xs font-medium border ${channel.color}`}>
                      {channel.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-gray-900">{formatCurrency(channel.price)}</p>
                    <p className={`text-sm font-semibold ${channel.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(channel.margin)}
                    </p>
                  </div>
                </div>
              ))}
              {enabledChannels.length > 3 && (
                <div className="text-center py-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/minha-area/produtos/${product.id}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver mais {enabledChannels.length - 3} canais
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

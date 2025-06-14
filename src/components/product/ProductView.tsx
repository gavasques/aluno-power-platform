
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/productCalculations";

interface ProductViewProps {
  product: Product;
  supplierName: string;
}

export const ProductView = ({ product, supplierName }: ProductViewProps) => {
  const enabledChannels = Object.entries(product.channels)
    .filter(([_, channel]) => channel?.enabled)
    .length;

  const channelNames = {
    sitePropio: "Site Próprio",
    amazonFBM: "Amazon FBM",
    amazonFBAOnSite: "Amazon FBA On Site",
    amazonDBA: "Amazon DBA",
    amazonFBA: "Amazon FBA",
    mlME1: "ML ME1",
    mlFlex: "ML Flex",
    mlEnvios: "ML Envios",
    mlFull: "ML Full"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informações Principais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            {product.photo && (
              <div className="flex-shrink-0">
                <img 
                  src={product.photo} 
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-lg font-semibold">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Marca</label>
                <p>{product.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                <p>{product.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fornecedor</label>
                <p>{supplierName}</p>
              </div>
              {product.ean && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EAN</label>
                  <p className="font-mono">{product.ean}</p>
                </div>
              )}
              {product.ncm && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NCM</label>
                  <p className="font-mono">{product.ncm}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Custo do Item</label>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(product.costItem)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Custo de Embalagem</label>
            <p className="text-lg">{formatCurrency(product.packCost)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Imposto Global</label>
            <p className="text-lg">{product.taxPercent}%</p>
          </div>
          <div className="pt-2 border-t">
            <label className="text-sm font-medium text-muted-foreground">Canais Ativos</label>
            <p className="text-lg font-semibold">{enabledChannels}</p>
          </div>
        </CardContent>
      </Card>

      {/* Especificações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Especificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Dimensões (C×L×A)</label>
            <p>{product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Peso</label>
            <p>{product.weight} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
            <p>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Canais de Venda */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Canais de Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(product.channels).map(([channelKey, channel]) => {
              if (!channel) return null;
              
              return (
                <div 
                  key={channelKey}
                  className={`p-4 rounded-lg border ${
                    channel.enabled 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {channelNames[channelKey as keyof typeof channelNames]}
                    </h4>
                    <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                      {channel.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {channel.enabled && (
                    <div className="space-y-1 text-sm">
                      <p>Preço: {formatCurrency(channel.salePrice)}</p>
                      <p>Comissão: {channel.commissionPct}%</p>
                      {channel.adsPct > 0 && <p>Ads: {channel.adsPct}%</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/productCalculations";
import { ChannelDetails } from "./ChannelDetails";

interface ProductViewProps {
  product: Product;
  supplierName: string;
  onEditBasicData?: () => void;
  onEditChannels?: () => void;
}

export const ProductView = ({ 
  product, 
  supplierName, 
  onEditBasicData, 
  onEditChannels 
}: ProductViewProps) => {
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

  // Cálculo da cubagem
  const volumeCm3 = product.dimensions.length * product.dimensions.width * product.dimensions.height;
  const volumeM3 = volumeCm3 / 1000000; // Converter cm³ para m³
  
  // Cálculo do peso cubado
  const pesoCubado167 = volumeM3 * 167;
  const pesoCubado300 = volumeM3 * 300;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informações Principais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações do Produto</CardTitle>
            {onEditBasicData && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditBasicData}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
            )}
          </div>
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
            <label className="text-sm font-medium text-muted-foreground">Volume</label>
            <p>{volumeCm3.toLocaleString('pt-BR')} cm³ ({volumeM3.toFixed(6)} m³)</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Peso Cubado (167)</label>
            <p>{pesoCubado167.toFixed(2)} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Peso Cubado (300)</label>
            <p>{pesoCubado300.toFixed(2)} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
            <p>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Canais de Venda - Formato Lista */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Canais de Venda</CardTitle>
            {onEditChannels && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditChannels}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Canais
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(product.channels).map(([channelKey, channel]) => {
              if (!channel) return null;
              
              return (
                <ChannelDetails
                  key={channelKey}
                  product={product}
                  channelKey={channelKey as keyof typeof product.channels}
                  channelName={channelNames[channelKey as keyof typeof channelNames]}
                  channel={channel}
                  onEditChannel={() => onEditChannels?.()}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

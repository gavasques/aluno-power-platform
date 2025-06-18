
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Edit, Trash2, Power, PowerOff } from "lucide-react";
import { useLocation } from "wouter";
import { Product } from "@/types/product";
import { calculateChannelResults, formatCurrency, formatPercentage } from "@/utils/productCalculations";
import { channelNames } from "@/config/channels";
import { ColumnPreferencesManager } from "./ColumnPreferencesManager";
import { useColumnPreferences } from "@/hooks/useColumnPreferences";

interface ProductListProps {
  products: Product[];
  onToggleProductStatus: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductList = ({ products, onToggleProductStatus, onDeleteProduct }: ProductListProps) => {
  const [, setLocation] = useLocation();
  const { columnPreferences, updateColumnVisibility, updateChannelVisibility } = useColumnPreferences();

  const allChannels = [
    { key: "sitePropio", label: "Site Próprio", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { key: "amazonFBM", label: "Amazon FBM", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "amazonFBAOnSite", label: "Amazon FBA On Site", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "amazonDBA", label: "Amazon DBA", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "amazonFBA", label: "Amazon FBA", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { key: "mlME1", label: "ML ME1", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { key: "mlFlex", label: "ML Flex", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { key: "mlEnvios", label: "ML Envios", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { key: "mlFull", label: "ML Full", color: "bg-yellow-50 text-yellow-700 border-yellow-200" }
  ];

  const visibleChannelData = allChannels.filter(channel => columnPreferences.channels.includes(channel.key));

  const getChannelInfo = (product: Product, channelKey: keyof Product["channels"]) => {
    const channel: any = product.channels[channelKey];
    if (!channel?.enabled) return null;
    const result = calculateChannelResults(product, channelKey, channel);
    return {
      price: channel.salePrice,
      margin: result.margin,
      color: allChannels.find(ch => ch.key === channelKey)?.color ?? ""
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnPreferencesManager
          columnPreferences={columnPreferences}
          onColumnVisibilityChange={updateColumnVisibility}
          onChannelVisibilityChange={updateChannelVisibility}
        />
      </div>
      
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnPreferences.photo && <TableHead className="w-20 text-center">Foto</TableHead>}
                  {columnPreferences.name && <TableHead className="min-w-[200px]">Produto</TableHead>}
                  {columnPreferences.brand && <TableHead className="w-32">Marca</TableHead>}
                  {columnPreferences.category && <TableHead className="w-32">Categoria</TableHead>}
                  {columnPreferences.sku && <TableHead className="w-24 text-center">SKU</TableHead>}
                  {columnPreferences.internalCode && <TableHead className="w-32 text-center">Código Interno</TableHead>}
                  {columnPreferences.status && <TableHead className="w-24 text-center">Status</TableHead>}
                  {visibleChannelData.map(c => (
                    <TableHead key={c.key} className="text-center min-w-[160px]">{c.label}</TableHead>
                  ))}
                  <TableHead className="text-center w-40">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-gray-50/50 cursor-pointer ${!product.active ? 'opacity-50' : ''}`}
                    onClick={() => navigate(`/minha-area/produtos/${product.id}`)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Visualizar detalhes de ${product.name}`}
                  >
                    {columnPreferences.photo && (
                      <TableCell className="text-center">
                        <img
                          src={product.photo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg shadow border border-gray-100 mx-auto"
                        />
                      </TableCell>
                    )}
                    {columnPreferences.name && (
                      <TableCell>
                        <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                      </TableCell>
                    )}
                    {columnPreferences.brand && (
                      <TableCell className="text-sm text-gray-700">{product.brand}</TableCell>
                    )}
                    {columnPreferences.category && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                          {product.category}
                        </Badge>
                      </TableCell>
                    )}
                    {columnPreferences.sku && (
                      <TableCell className="text-center text-sm text-gray-600">
                        {product.sku || '-'}
                      </TableCell>
                    )}
                    {columnPreferences.internalCode && (
                      <TableCell className="text-center text-sm text-gray-600">
                        {product.internalCode || '-'}
                      </TableCell>
                    )}
                    {columnPreferences.status && (
                      <TableCell className="text-center">
                        <Badge variant={product.active ? "default" : "secondary"} className="text-xs">
                          {product.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleChannelData.map((chan) => {
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
                            onToggleProductStatus(product.id);
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
                            onDeleteProduct(product.id);
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
        </CardContent>
      </Card>
    </div>
  );
};

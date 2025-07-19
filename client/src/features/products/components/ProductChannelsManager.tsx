import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Settings, TrendingUp, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EntityManager } from '@/components/common/EntityManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/lib/utils/unifiedFormatters';
import { toast } from '@/hooks/use-toast';
import { ChannelFormDialog } from './ChannelFormDialog';
import { productService } from '../services/ProductService';
import type { ProductChannel } from '../types/productChannels';
import { CHANNEL_DISPLAY_NAMES, PERFORMANCE_COLORS, PERFORMANCE_THRESHOLDS } from '../constants/channels';

/**
 * ProductChannelsManager - Refatorado usando EntityManager
 * 
 * Benefícios:
 * - Usa EntityManager adaptado para canais
 * - Mantém funcionalidades específicas de canais
 * - Formatação usando UnifiedFormatters
 * - Interface consistente com outros managers
 * - Ações customizadas para canais
 */

interface ProductChannelsManagerProps {
  productId: number;
}

export function ProductChannelsManager({ productId }: ProductChannelsManagerProps) {
  const queryClient = useQueryClient();

  // Adapter service para usar EntityManager com canais específicos do produto
  const channelService = useMemo(() => ({
    getAll: async () => {
      const product = await productService.getWithChannels(productId);
      const channels = product.channels || {};
      
      // Transforma objeto de canais em array para o EntityManager
      return Object.entries(channels).map(([type, data]: [string, any]) => ({
        id: `${productId}-${type}`,
        productId,
        type,
        name: CHANNEL_DISPLAY_NAMES[type] || type,
        enabled: data?.isActive || false,
        salePrice: data?.price || 0,
        commission: data?.commissionPercent || 0,
        margin: calculateMargin(data),
        netProfit: calculateNetProfit(data),
        lastUpdated: data?.updatedAt || new Date().toISOString(),
        productCodes: extractProductCodes(data),
        config: data,
      }));
    },
    
    create: async (data: any) => {
      // Criar novo canal para o produto
      await productService.updateChannels(productId, data);
      return data;
    },
    
    update: async (id: string, data: any) => {
      // Atualizar canal específico
      const [, channelType] = id.split('-');
      await productService.updateChannels(productId, { [channelType]: data });
      return data;
    },
    
    remove: async (id: string) => {
      // Remover canal
      const [, channelType] = id.split('-');
      await productService.updateChannels(productId, { [channelType]: null });
    },
    
    // Método customizado para toggle de status
    toggleStatus: async (channelId: string) => {
      const [, channelType] = channelId.split('-');
      const product = await productService.getWithChannels(productId);
      const channelData = product.channels?.[channelType];
      
      if (channelData) {
        await productService.updateChannels(productId, {
          [channelType]: {
            ...channelData,
            isActive: !channelData.isActive
          }
        });
      }
    }
  }), [productId]);

  // Funções auxiliares para cálculos
  function calculateMargin(channelData: any): number {
    if (!channelData?.price || !channelData?.costPrice) return 0;
    return ((channelData.price - channelData.costPrice) / channelData.price) * 100;
  }

  function calculateNetProfit(channelData: any): number {
    if (!channelData?.price || !channelData?.costPrice) return 0;
    const commission = (channelData.price * (channelData.commissionPercent || 0)) / 100;
    const otherCosts = (channelData.packagingCostValue || 0) + (channelData.shippingCostValue || 0);
    return channelData.price - channelData.costPrice - commission - otherCosts;
  }

  function extractProductCodes(channelData: any): Record<string, string> {
    const codes: Record<string, string> = {};
    if (channelData?.fnsku) codes.fnsku = channelData.fnsku;
    if (channelData?.asin) codes.asin = channelData.asin;
    if (channelData?.mlb) codes.mlb = channelData.mlb;
    if (channelData?.skuMgl) codes.skuMgl = channelData.skuMgl;
    return codes;
  }

  function getPerformanceColor(margin: number): string {
    if (margin >= PERFORMANCE_THRESHOLDS.EXCELLENT_MARGIN * 100) return PERFORMANCE_COLORS.EXCELLENT;
    if (margin >= PERFORMANCE_THRESHOLDS.GOOD_MARGIN * 100) return PERFORMANCE_COLORS.GOOD;
    if (margin >= PERFORMANCE_THRESHOLDS.ACCEPTABLE_MARGIN * 100) return PERFORMANCE_COLORS.ACCEPTABLE;
    if (margin >= PERFORMANCE_THRESHOLDS.POOR_MARGIN * 100) return PERFORMANCE_COLORS.POOR;
    return PERFORMANCE_COLORS.NEGATIVE;
  }

  // Mutation para toggle de status
  const toggleStatusMutation = useMutation({
    mutationFn: (channelId: string) => channelService.toggleStatus(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', productId] });
      toast({
        title: "Sucesso",
        description: "Status do canal alterado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status do canal",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<ProductChannel>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Canal',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${row.original.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div>
            <span className="font-medium">{row.original.name}</span>
            <div className="text-xs text-gray-500">{row.original.type}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.original.enabled ? 'default' : 'secondary'}>
            {row.original.enabled ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleStatusMutation.mutate(row.original.id)}
            disabled={toggleStatusMutation.isPending}
          >
            {row.original.enabled ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      )
    },
    {
      accessorKey: 'salePrice',
      header: 'Preço de Venda',
      cell: ({ row }) => (
        row.original.salePrice > 0 ? 
          formatCurrency(row.original.salePrice) : 
          <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'margin',
      header: 'Margem',
      cell: ({ row }) => {
        const margin = row.original.margin;
        const color = getPerformanceColor(margin);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(margin / 100, { multiplier: 1 })}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'commission',
      header: 'Comissão',
      cell: ({ row }) => (
        row.original.commission > 0 ? 
          formatPercentage(row.original.commission / 100, { multiplier: 1 }) : 
          <span className="text-gray-400">-</span>
      )
    },
    {
      accessorKey: 'netProfit',
      header: 'Lucro Líquido',
      cell: ({ row }) => (
        <span className={`font-medium ${row.original.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(row.original.netProfit)}
        </span>
      )
    },
    {
      accessorKey: 'productCodes',
      header: 'Códigos',
      cell: ({ row }) => {
        const codes = row.original.productCodes;
        const codeCount = Object.keys(codes || {}).length;
        
        if (codeCount === 0) {
          return <span className="text-gray-400">-</span>;
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(codes || {}).slice(0, 2).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key.toUpperCase()}
              </Badge>
            ))}
            {codeCount > 2 && (
              <Badge variant="outline" className="text-xs">
                +{codeCount - 2}
              </Badge>
            )}
          </div>
        );
      }
    }
  ], [toggleStatusMutation]);

  const customActions = useMemo(() => [
    {
      label: "Configurar",
      icon: Settings,
      onClick: (channel: ProductChannel) => {
        // Abrir configurações específicas do canal
        console.log('Configurar canal:', channel);
      }
    },
    {
      label: "Análise",
      icon: TrendingUp,
      onClick: (channel: ProductChannel) => {
        // Abrir análise de performance
        console.log('Análise canal:', channel);
      }
    },
    {
      label: "Preços",
      icon: DollarSign,
      onClick: (channel: ProductChannel) => {
        // Abrir configuração de preços
        console.log('Preços canal:', channel);
      }
    }
  ], []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Canais de Venda</h2>
        <p className="text-gray-600 mt-1">Gerencie os canais onde este produto é vendido</p>
      </div>

      <EntityManager
        entityName="Canal"
        entityNamePlural="Canais de Venda"
        service={channelService}
        columns={columns}
        FormComponent={ChannelFormDialog}
        searchFields={['name', 'type']}
        customActions={customActions}
        enableCreate={true}
        enableEdit={true}
        enableDelete={true}
        enableSearch={false} // Desabilitado para poucos itens
        enableBulkOperations={false}
        permissions={{
          create: true,
          edit: true,
          delete: true,
        }}
        className="mt-6"
        emptyStateProps={{
          title: "Nenhum canal configurado",
          description: "Configure canais de venda para começar a vender este produto.",
          actionLabel: "Adicionar Canal",
        }}
        queryKey={['channels', productId]}
      />
    </div>
  );
}

export default ProductChannelsManager;
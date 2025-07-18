/**
 * Channel Manager Main Component
 * Orchestrates the complete channel management interface
 * Following composition over inheritance and dependency injection
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useChannelManager } from '@/hooks/useChannelManager';
import { ChannelCard } from './ChannelCard';
import { CHANNEL_CATEGORIES, CHANNEL_METADATA } from '@/shared/constants/channels';
import { formatCurrency, formatPercentage } from '@/shared/utils/channelCalculations';

interface ChannelManagerProps {
  productId: number;
  productCost: number;
  taxPercent: number;
  onClose?: () => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({
  productId,
  productCost,
  taxPercent,
  onClose,
}) => {
  const {
    channels,
    activeChannels,
    calculations,
    isLoading,
    error,
    hasChanges,
    isSaving,
    expandedChannels,
    updateChannelData,
    toggleChannelActive,
    toggleExpansion,
    saveChannels,
    resetChanges,
  } = useChannelManager({ productId, productCost, taxPercent });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações dos canais...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Erro ao carregar dados do produto</p>
        <p className="text-sm mt-2">{(error as any)?.message || 'Erro desconhecido'}</p>
      </div>
    );
  }

  // Calculate summary metrics
  const totalRevenue = Object.values(calculations).reduce((sum, calc) => sum + calc.netRevenue, 0);
  const totalProfit = Object.values(calculations).reduce((sum, calc) => sum + calc.netProfit, 0);
  const averageMargin = Object.values(calculations).length > 0 
    ? Object.values(calculations).reduce((sum, calc) => sum + calc.marginPercent, 0) / Object.values(calculations).length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gerenciamento de Canais</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Configure preços e custos para cada canal de venda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {activeChannels.length} de {channels.length} canais ativos
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {activeChannels.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Receita Total</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Lucro Total</div>
                <div className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Margem Média</div>
                <div className="text-lg font-semibold text-purple-600">
                  {formatPercentage(averageMargin)}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            onClick={saveChannels} 
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
          
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={resetChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Desfazer
            </Button>
          )}
        </div>

        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Channel Categories */}
      <div className="space-y-6">
        {Object.entries(CHANNEL_CATEGORIES).map(([categoryName, channelTypes]) => (
          <div key={categoryName} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {categoryName}
              <Badge variant="secondary" className="text-xs">
                {channelTypes.filter(type => 
                  channels.find(ch => ch.type === type)?.isActive
                ).length} ativo(s)
              </Badge>
            </h3>
            
            <div className="grid gap-4">
              {channelTypes.map(channelType => {
                const channel = channels.find(ch => ch.type === channelType);
                if (!channel) return null;

                return (
                  <ChannelCard
                    key={channelType}
                    channel={channel}
                    calculation={calculations[channelType] || null}
                    isExpanded={expandedChannels.has(channelType)}
                    onToggleExpansion={() => toggleExpansion(channelType)}
                    onToggleActive={() => toggleChannelActive(channelType)}
                    onUpdateData={(data) => updateChannelData(channelType, data)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Information */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Produto:</strong> Custo R$ {productCost.toFixed(2)} • Imposto {taxPercent}%</p>
            <p><strong>Nota:</strong> Rebates são considerados como receita adicional, não desconto de custo.</p>
            <p><strong>Cálculos:</strong> Todos os valores são atualizados em tempo real conforme você altera os dados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
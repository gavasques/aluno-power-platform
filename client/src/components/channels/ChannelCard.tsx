/**
 * Channel Card Component
 * Modular channel display and editing component following Single Responsibility
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SalesChannel, ChannelCalculationResult } from '@/shared/types/channels';
import { CHANNEL_METADATA } from '@/shared/constants/channels';
import { formatUnifiedCurrency as formatCurrency, formatUnifiedPercentage as formatPercentage, getUnifiedProfitabilityColor as getProfitabilityColor, getUnifiedProfitabilityStatus as getProfitabilityStatus } from '@/shared/utils/unifiedChannelCalculations';
import { ChannelForm } from './ChannelForm';
import { ChannelSummary } from './ChannelSummary';

interface ChannelCardProps {
  channel: SalesChannel;
  calculation: ChannelCalculationResult | null;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onToggleActive: () => void;
  onUpdateData: (data: Partial<SalesChannel['data']>) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  calculation,
  isExpanded,
  onToggleExpansion,
  onToggleActive,
  onUpdateData,
}) => {
  const metadata = CHANNEL_METADATA[channel.type];
  
  return (
    <Card className={`transition-all duration-200 ${channel.isActive ? 'ring-2 ring-blue-200' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Channel Icon & Name */}
                <div className={`p-2 rounded-lg ${metadata.color} text-white`}>
                  <div className="w-5 h-5" /> {/* Icon placeholder */}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{metadata.name}</h3>
                  <p className="text-sm text-gray-600">{metadata.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={channel.isActive}
                    onCheckedChange={onToggleActive}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium">
                    {channel.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Quick Status */}
                {channel.isActive && calculation && (
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(calculation?.netProfit || 0)}
                    </div>
                    <div className={`text-xs ${getProfitabilityColor(calculation?.marginPercent || 0)}`}>
                      {formatPercentage(calculation.marginPercent)} • {getProfitabilityStatus(calculation.marginPercent)}
                    </div>
                  </div>
                )}

                {/* Expansion Icon */}
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 border-t">
            {channel.isActive ? (
              <div className="space-y-6">
                {/* Channel Form */}
                <ChannelForm
                  channel={channel}
                  metadata={metadata}
                  onUpdateData={onUpdateData}
                />

                {/* Calculation Summary */}
                {calculation && (
                  <ChannelSummary calculation={calculation} />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Canal inativo</p>
                <p className="text-sm">Ative o canal para configurar preços e custos</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
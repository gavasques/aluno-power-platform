/**
 * Channel Summary Component
 * Displays comprehensive calculation results and profitability analysis
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChannelCalculationResult } from '@/shared/types/channels';
import { 
  formatCurrency, 
  formatPercentage, 
  getProfitabilityColor, 
  getProfitabilityStatus 
} from '@/shared/utils/channelCalculations';

interface ChannelSummaryProps {
  calculation: ChannelCalculationResult;
}

export const ChannelSummary: React.FC<ChannelSummaryProps> = ({ calculation }) => {
  const {
    grossRevenue,
    netRevenue,
    productCost,
    taxCost,
    commissionCost,
    packagingCost,
    fixedCost,
    marketingCost,
    financialCost,
    shippingCost,
    prepCenterCost,
    totalCosts,
    rebateIncome,
    grossProfit,
    netProfit,
    marginPercent,
    roiPercent,
    isValid,
    errors
  } = calculation;

  if (!isValid) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-700">Erros de Validação</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">• {error}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Análise de Rentabilidade</CardTitle>
          <Badge 
            variant="outline" 
            className={`${getProfitabilityColor(marginPercent)} border-current`}
          >
            {getProfitabilityStatus(marginPercent)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Receita</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Receita Bruta</p>
              <p className="font-semibold">{formatCurrency(grossRevenue)}</p>
            </div>
            {rebateIncome > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Rebate</p>
                <p className="font-semibold text-green-600">+{formatCurrency(rebateIncome)}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Receita Líquida</p>
              <p className="font-semibold text-blue-600">{formatCurrency(netRevenue)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Costs Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Detalhamento de Custos</h4>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Produto:</span>
              <span>{formatCurrency(productCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impostos:</span>
              <span>{formatCurrency(taxCost)}</span>
            </div>
            {commissionCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Comissão:</span>
                <span>{formatCurrency(commissionCost)}</span>
              </div>
            )}
            {packagingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Embalagem:</span>
                <span>{formatCurrency(packagingCost)}</span>
              </div>
            )}
            {fixedCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Custos Fixos:</span>
                <span>{formatCurrency(fixedCost)}</span>
              </div>
            )}
            {marketingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Marketing:</span>
                <span>{formatCurrency(marketingCost)}</span>
              </div>
            )}
            {financialCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Financeiro:</span>
                <span>{formatCurrency(financialCost)}</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Envio:</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
            )}
            {prepCenterCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Prep Center:</span>
                <span>{formatCurrency(prepCenterCost)}</span>
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total de Custos:</span>
              <span className="text-red-600">{formatCurrency(totalCosts)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Profitability Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Indicadores de Rentabilidade</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Lucro Bruto</p>
              <p className={`font-semibold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(grossProfit)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Lucro Líquido</p>
              <p className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Margem</p>
              <p className={`font-semibold ${getProfitabilityColor(marginPercent)}`}>
                {formatPercentage(marginPercent)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">ROI</p>
              <p className={`font-semibold ${roiPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(roiPercent)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Custo/Receita:</strong> {formatPercentage((totalCosts / grossRevenue) * 100)}
            </p>
            {commissionCost > 0 && (
              <p>
                <strong>Comissão/Receita:</strong> {formatPercentage((commissionCost / grossRevenue) * 100)}
              </p>
            )}
            {marketingCost > 0 && (
              <p>
                <strong>Marketing/Receita:</strong> {formatPercentage((marketingCost / grossRevenue) * 100)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
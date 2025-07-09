import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, DollarSign, PiggyBank, Banknote, Trophy } from 'lucide-react';
import { SimulationTotals } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

interface SummaryPanelProps {
  totals: SimulationTotals;
  tempoTotalDias: number;
}

export function SummaryPanel({ totals, tempoTotalDias }: SummaryPanelProps) {
  const getROIColorClass = (roiTotal: number) => {
    if (roiTotal >= 100) return 'text-green-600 dark:text-green-400';
    if (roiTotal >= 50) return 'text-blue-600 dark:text-blue-400';
    if (roiTotal >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getROIBadgeVariant = (roiTotal: number) => {
    if (roiTotal >= 100) return 'default';
    if (roiTotal >= 50) return 'secondary';
    if (roiTotal >= 20) return 'outline';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Resumo da Simulação
        </CardTitle>
        <CardDescription>
          Totais consolidados do investimento e retorno
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Main ROI Display */}
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold mb-2">
            <span className={getROIColorClass(totals.roiTotal)}>
              {formatPercentage(totals.roiTotal)}
            </span>
          </div>
          <Badge variant={getROIBadgeVariant(totals.roiTotal)} className="text-sm">
            ROI Total
          </Badge>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Investido */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totals.totalInvestido)}
              </p>
            </div>
          </div>

          {/* Saldo Final */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <PiggyBank className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Saldo Final</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totals.saldoFinal)}
              </p>
            </div>
          </div>

          {/* Ganho Líquido */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              {totals.ganhoLiquido >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ganho Líquido</p>
              <p className={`text-lg font-bold ${
                totals.ganhoLiquido >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(totals.ganhoLiquido)}
              </p>
            </div>
          </div>

          {/* Total Retornos */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Retornos</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(totals.totalRetornos)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Aportes</p>
              <p className="text-sm font-semibold">{formatCurrency(totals.totalAportes)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Retiradas</p>
              <p className="text-sm font-semibold">{formatCurrency(totals.totalRetiradas)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Tempo Total</p>
              <p className="text-sm font-semibold">{tempoTotalDias} dias</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
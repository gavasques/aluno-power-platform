import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface CreditCardProps {
  balance?: number;
  usage?: {
    thisMonth: number;
    lastMonth: number;
    topFeatures: Array<{name: string, usage: number}>;
    projection: number;
  };
  onBuyCredits?: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  balance = 0,
  usage,
  onBuyCredits
}) => {
  const usageThisMonth = usage?.thisMonth || 0;
  const usageLastMonth = usage?.lastMonth || 0;
  const usageChange = usageLastMonth > 0 ? ((usageThisMonth - usageLastMonth) / usageLastMonth) * 100 : 0;
  const projectedExhaustion = usage?.projection || 0;

  const getBalanceColor = (balance: number) => {
    if (balance >= 1000) return 'text-green-600';
    if (balance >= 500) return 'text-yellow-600';
    if (balance >= 100) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBalanceStatus = (balance: number) => {
    if (balance >= 1000) return { label: 'Excelente', variant: 'default' as const };
    if (balance >= 500) return { label: 'Bom', variant: 'secondary' as const };
    if (balance >= 100) return { label: 'Atenção', variant: 'destructive' as const };
    return { label: 'Crítico', variant: 'destructive' as const };
  };

  const balanceStatus = getBalanceStatus(balance);
  const usageProgress = Math.min((usageThisMonth / 1000) * 100, 100);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saldo de Créditos</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={balanceStatus.variant} className="text-xs">
            {balanceStatus.label}
          </Badge>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Balance Display */}
          <div>
            <div className={`text-2xl font-bold ${getBalanceColor(balance)}`}>
              {balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              créditos disponíveis
            </p>
          </div>

          {/* Usage This Month */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uso este mês</span>
              <span className="font-medium">{usageThisMonth} créditos</span>
            </div>
            <Progress value={usageProgress} className="h-2" />
          </div>

          {/* Usage Comparison */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">vs. mês anterior</span>
            <div className="flex items-center gap-1">
              {usageChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
              <span className={usageChange > 0 ? 'text-red-500' : 'text-green-500'}>
                {Math.abs(usageChange).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Projection Alert */}
          {projectedExhaustion > 0 && projectedExhaustion < 30 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-700">
                Créditos podem esgotar em ~{projectedExhaustion} dias
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={onBuyCredits}
            className="w-full" 
            variant={balance < 100 ? "default" : "outline"}
            size="sm"
          >
            {balance < 100 ? 'Comprar Créditos Agora' : 'Comprar Mais Créditos'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
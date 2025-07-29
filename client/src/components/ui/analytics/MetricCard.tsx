/**
 * Card para exibir métricas individuais
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { AnalyticsMetric } from '@/hooks/useAnalytics';

interface MetricCardProps {
  metric: AnalyticsMetric;
  className?: string;
}

export function MetricCard({ metric, className = '' }: MetricCardProps) {
  // Ícones por tipo de métrica
  const getMetricIcon = (iconName?: string) => {
    switch (iconName) {
      case 'dollar':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'users':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'shopping':
        return <ShoppingCart className="h-5 w-5 text-purple-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  // Ícone de tendência
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Cor da tendência
  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Formatação do valor
  const formatValue = (value: number) => {
    switch (metric.format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      
      case 'percentage':
        return `${value.toFixed(1)}%`;
      
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  // Formatação da mudança
  const formatChange = () => {
    if (!metric.change && !metric.changePercent) return null;

    const changeValue = metric.changePercent 
      ? `${metric.changePercent > 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%`
      : `${metric.change && metric.change > 0 ? '+' : ''}${formatValue(metric.change || 0)}`;

    return changeValue;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getMetricIcon(metric.icon)}
            <div>
              <p className="text-sm font-medium text-gray-600">
                {metric.name}
              </p>
            </div>
          </div>
          
          {/* Badge de tendência */}
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${getTrendColor()}
          `}>
            {getTrendIcon()}
            {formatChange()}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatValue(metric.value)}
            </span>
            
            {metric.previousValue !== undefined && (
              <span className="text-sm text-gray-500">
                de {formatValue(metric.previousValue)}
              </span>
            )}
          </div>

          {/* Indicador visual de mudança */}
          {metric.changePercent !== undefined && Math.abs(metric.changePercent) > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-500
                      ${metric.trend === 'up' 
                        ? 'bg-green-500' 
                        : metric.trend === 'down' 
                        ? 'bg-red-500' 
                        : 'bg-gray-400'
                      }
                    `}
                    style={{
                      width: `${Math.min(Math.abs(metric.changePercent), 100)}%`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {Math.abs(metric.changePercent).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Descrição adicional se houver */}
        {metric.trend !== 'stable' && (
          <p className="text-xs text-gray-500 mt-2">
            {metric.trend === 'up' 
              ? '📈 Crescimento em relação ao período anterior'
              : '📉 Redução em relação ao período anterior'
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
}
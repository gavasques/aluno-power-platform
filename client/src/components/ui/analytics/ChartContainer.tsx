/**
 * Container para gráficos com Chart.js
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Download,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartData } from '@/hooks/useAnalytics';

// Simulação de componentes de gráfico (normalmente seria Chart.js ou similar)
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as RechartsBarChart, Bar } from 'recharts';
import { PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface ChartContainerProps {
  chart: ChartData;
  className?: string;
  showActions?: boolean;
}

export function ChartContainer({ 
  chart, 
  className = '',
  showActions = true 
}: ChartContainerProps) {
  // Ícone baseado no tipo de gráfico
  const getChartIcon = () => {
    switch (chart.type) {
      case 'line':
      case 'area':
        return <LineChart className="h-4 w-4" />;
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Cores padrão para gráficos
  const defaultColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const colors = chart.config?.colors || defaultColors;

  // Processar dados para diferentes tipos de gráfico
  const processedData = useMemo(() => {
    if (chart.type === 'pie') {
      return chart.data.map((item, index) => ({
        ...item,
        fill: colors[index % colors.length]
      }));
    }
    
    return chart.data.map(item => ({
      name: item.label,
      value: item.value,
      date: item.date,
      ...item.metadata
    }));
  }, [chart.data, chart.type, colors]);

  // Renderizar gráfico baseado no tipo
  const renderChart = () => {
    const height = chart.config?.height || 300;

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={processedData}>
              {chart.config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR').format(value),
                  'Valor'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={processedData}>
              {chart.config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR').format(value),
                  'Valor'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={2}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={processedData}>
              {chart.config?.showGrid !== false && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR').format(value),
                  'Valor'
                ]}
              />
              <Bar dataKey="value" fill={colors[0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR').format(value),
                  'Valor'
                ]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Tipo de gráfico não suportado: {chart.type}</p>
            </div>
          </div>
        );
    }
  };

  // Exportar dados do gráfico
  const exportChartData = () => {
    const csv = [
      ['Label', 'Valor', 'Data'].join(','),
      ...chart.data.map(item => [
        `"${item.label}"`,
        item.value,
        item.date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <CardTitle className="text-lg">{chart.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {chart.type}
            </Badge>
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={exportChartData}
                className="h-8 w-8 p-0"
                title="Exportar dados"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Expandir"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {chart.data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Nenhum dado disponível</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}

        {/* Legendas customizadas para gráfico de pizza */}
        {chart.type === 'pie' && chart.config?.showLegend !== false && (
          <div className="mt-4 flex flex-wrap gap-2">
            {processedData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas resumidas */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('pt-BR').format(
                chart.data.reduce((sum, item) => sum + item.value, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Média</p>
            <p className="font-semibold">
              {new Intl.NumberFormat('pt-BR').format(
                chart.data.reduce((sum, item) => sum + item.value, 0) / chart.data.length
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pontos</p>
            <p className="font-semibold">{chart.data.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
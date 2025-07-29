/**
 * Dashboard analítico avançado
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Download, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Filter
} from 'lucide-react';
import { useAnalytics, AnalyticsMetric, ChartData } from '@/hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { ChartContainer } from './ChartContainer';
import { AnalyticsFilters } from './AnalyticsFilters';

interface AnalyticsDashboardProps {
  dashboardId?: string;
  title?: string;
  description?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function AnalyticsDashboard({
  dashboardId = 'financas360',
  title = 'Analytics Dashboard',
  description = 'Visão geral das métricas do sistema',
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutos
  className = ''
}: AnalyticsDashboardProps) {
  const {
    dashboard,
    metrics,
    charts,
    filters,
    selectedFilters,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    updateFilter,
    clearFilters,
    refresh,
    exportData,
    formatValue,
    getTrendColor,
    isExporting
  } = useAnalytics({
    dashboardId,
    autoRefresh,
    refreshInterval
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx');

  // Renderizar loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        
        {/* Loading metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar analytics</h3>
            <p className="text-gray-600 mb-4">
              {error.message || 'Não foi possível carregar os dados analíticos'}
            </p>
            <Button onClick={() => refresh()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600">{description}</p>
          
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filtros */}
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {Object.keys(selectedFilters).length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {Object.keys(selectedFilters).length}
                </Badge>
              )}
            </Button>
          )}

          {/* Export */}
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData(selectedExportFormat)}
              disabled={isExporting}
              className="rounded-r-none"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
            
            <select
              value={selectedExportFormat}
              onChange={(e) => setSelectedExportFormat(e.target.value as any)}
              className="border border-l-0 rounded-l-none rounded-r px-2 text-sm bg-white"
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && filters.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <AnalyticsFilters
              filters={filters}
              selectedFilters={selectedFilters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Métricas */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {/* Gráficos */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <ChartContainer key={chart.id} chart={chart} />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {metrics.length === 0 && charts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-600">
              Não há dados analíticos para exibir no momento.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre auto-refresh */}
      {autoRefresh && (
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Dados atualizados automaticamente a cada {Math.floor(refreshInterval / 60000)} minutos
          </div>
        </div>
      )}
    </div>
  );
}
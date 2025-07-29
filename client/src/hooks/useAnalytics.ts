/**
 * Hook para sistema de analytics avançado
 * Coleta, processa e fornece dados analíticos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage';
  icon?: string;
}

export interface ChartData {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Array<{
    label: string;
    value: number;
    date?: string;
    metadata?: Record<string, any>;
  }>;
  config?: {
    colors?: string[];
    showGrid?: boolean;
    showLegend?: boolean;
    height?: number;
  };
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  metrics: AnalyticsMetric[];
  charts: ChartData[];
  filters: AnalyticsFilter[];
  refreshInterval?: number;
  lastUpdated: Date;
}

export interface AnalyticsFilter {
  id: string;
  name: string;
  type: 'dateRange' | 'select' | 'multiSelect';
  value: any;
  options?: Array<{ label: string; value: any }>;
}

interface UseAnalyticsProps {
  dashboardId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAnalytics({
  dashboardId = 'default',
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutos
}: UseAnalyticsProps = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query para buscar dashboard
  const { 
    data: dashboard, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['analytics-dashboard', dashboardId, selectedFilters],
    queryFn: async (): Promise<AnalyticsDashboard> => {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dashboardId,
          filters: selectedFilters
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar analytics');
      }

      return response.json();
    },
    enabled: !!token,
    staleTime: refreshInterval,
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: false
  });

  // Mutation para salvar configuração do dashboard
  const saveDashboardMutation = useMutation({
    mutationFn: async (config: Partial<AnalyticsDashboard>) => {
      const response = await fetch('/api/analytics/dashboard/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dashboardId,
          config
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar dashboard');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
    }
  });

  // Mutation para exportar dados
  const exportDataMutation = useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' | 'pdf') => {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dashboardId,
          filters: selectedFilters,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      return response.blob();
    },
    onSuccess: (blob, format) => {
      // Download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-${dashboardId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });

  // Atualizar filtro
  const updateFilter = useCallback((filterId: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  // Refresh manual
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Salvar dashboard
  const saveDashboard = useCallback((config: Partial<AnalyticsDashboard>) => {
    return saveDashboardMutation.mutateAsync(config);
  }, [saveDashboardMutation]);

  // Exportar dados
  const exportData = useCallback((format: 'csv' | 'xlsx' | 'pdf') => {
    return exportDataMutation.mutateAsync(format);
  }, [exportDataMutation]);

  // Métricas calculadas
  const processedMetrics = useMemo(() => {
    if (!dashboard?.metrics) return [];

    return dashboard.metrics.map(metric => {
      const change = metric.previousValue 
        ? metric.value - metric.previousValue 
        : 0;
      
      const changePercent = metric.previousValue && metric.previousValue !== 0
        ? ((metric.value - metric.previousValue) / metric.previousValue) * 100
        : 0;

      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

      return {
        ...metric,
        change,
        changePercent,
        trend
      } as AnalyticsMetric;
    });
  }, [dashboard?.metrics]);

  // Formatação de valores
  const formatValue = useCallback((value: number, format: AnalyticsMetric['format']) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      
      case 'percentage':
        return `${value.toFixed(1)}%`;
      
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  }, []);

  // Cores para tendências
  const getTrendColor = useCallback((trend: AnalyticsMetric['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  // Preparar dados para gráficos (integração com bibliotecas de chart)
  const getChartConfig = useCallback((chart: ChartData) => {
    const baseConfig = {
      data: chart.data,
      type: chart.type,
      responsive: true,
      plugins: {
        legend: {
          display: chart.config?.showLegend ?? true
        }
      },
      ...chart.config
    };

    // Configurações específicas por tipo
    switch (chart.type) {
      case 'line':
      case 'area':
        return {
          ...baseConfig,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: chart.config?.showGrid ?? true
              }
            },
            x: {
              grid: {
                display: chart.config?.showGrid ?? true
              }
            }
          }
        };
      
      case 'pie':
        return {
          ...baseConfig,
          plugins: {
            ...baseConfig.plugins,
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((context.raw / total) * 100).toFixed(1);
                  return `${context.label}: ${percentage}%`;
                }
              }
            }
          }
        };
      
      default:
        return baseConfig;
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  return {
    // Dados
    dashboard,
    metrics: processedMetrics,
    charts: dashboard?.charts || [],
    filters: dashboard?.filters || [],
    selectedFilters,
    
    // Estados
    isLoading,
    isRefreshing,
    error,
    lastUpdated: dashboard?.lastUpdated,
    
    // Ações
    updateFilter,
    clearFilters,
    refresh,
    saveDashboard,
    exportData,
    
    // Utilitários
    formatValue,
    getTrendColor,
    getChartConfig,
    
    // Estados de mutação
    isSaving: saveDashboardMutation.isPending,
    isExporting: exportDataMutation.isPending
  };
}
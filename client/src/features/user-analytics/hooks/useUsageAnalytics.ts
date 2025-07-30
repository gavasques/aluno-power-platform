/**
 * HOOK: useUsageAnalytics
 * Gerencia estado e operações de análise de uso
 * Extraído de Usage.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  UsageAnalyticsState,
  UseUsageAnalyticsReturn,
  UsageAnalytics,
  CreditAnalytics,
  DateRange,
  FeatureType,
  ActionType,
  UsageTab,
  MetricType,
  ChartType,
  ViewMode,
  ExportFormat,
  ExportFilters
} from '../types/usage';

export const useUsageAnalytics = (
  userId?: number,
  defaultTab: UsageTab = 'overview',
  defaultDateRange: DateRange = { 
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'last30days'
  }
): UseUsageAnalyticsReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<UsageAnalyticsState>({
    // Data
    analytics: null,
    creditAnalytics: null,
    rawUsageData: [],
    rawCreditData: [],
    
    // Loading states
    isLoading: false,
    isLoadingAnalytics: false,
    isLoadingCredits: false,
    isExporting: false,
    
    // Filters
    dateRange: defaultDateRange,
    selectedFeatures: [],
    selectedActions: [],
    selectedUsers: userId ? [userId] : [],
    
    // UI state
    activeTab: defaultTab,
    selectedMetric: 'usage_count',
    chartType: 'line',
    viewMode: 'chart',
    
    // Export
    exportFormat: 'xlsx',
    exportFilters: {
      includeRawData: true,
      includeCharts: true,
      includeAnalytics: true,
      dateRange: defaultDateRange,
      features: [],
      actions: []
    },
    
    // Errors
    error: null,
    errors: {}
  });

  // ===== COMPUTED QUERY PARAMS =====
  const queryParams = useMemo(() => ({
    userId: state.selectedUsers.length === 1 ? state.selectedUsers[0] : undefined,
    startDate: state.dateRange.startDate,
    endDate: state.dateRange.endDate,
    features: state.selectedFeatures.length > 0 ? state.selectedFeatures : undefined,
    actions: state.selectedActions.length > 0 ? state.selectedActions : undefined
  }), [state.dateRange, state.selectedFeatures, state.selectedActions, state.selectedUsers]);

  // ===== QUERIES =====
  const analyticsQuery = useQuery({
    queryKey: ['/api/usage/analytics', queryParams],
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data || null,
    onError: (error: any) => {
      setState(prev => ({ ...prev, error: error.message }));
    }
  });

  const creditAnalyticsQuery = useQuery({
    queryKey: ['/api/usage/credits/analytics', queryParams],
    staleTime: 5 * 60 * 1000,
    select: (data) => data || null,
    onError: (error: any) => {
      setState(prev => ({ ...prev, error: error.message }));
    }
  });

  // ===== MUTATIONS =====
  const exportMutation = useMutation({
    mutationFn: async ({ format, filters }: { format: ExportFormat; filters: ExportFilters }) => {
      setState(prev => ({ ...prev, isExporting: true }));
      
      const response = await fetch('/api/usage/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          format,
          filters: {
            ...filters,
            userId: state.selectedUsers.length === 1 ? state.selectedUsers[0] : undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-analytics-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: 'Exportação concluída',
        description: 'Os dados foram exportados com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na exportação',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  });

  // ===== SIDE EFFECTS =====
  useEffect(() => {
    setState(prev => ({
      ...prev,
      analytics: analyticsQuery.data,
      isLoadingAnalytics: analyticsQuery.isLoading
    }));
  }, [analyticsQuery.data, analyticsQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      creditAnalytics: creditAnalyticsQuery.data,
      isLoadingCredits: creditAnalyticsQuery.isLoading
    }));
  }, [creditAnalyticsQuery.data, creditAnalyticsQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: analyticsQuery.isLoading || creditAnalyticsQuery.isLoading
    }));
  }, [analyticsQuery.isLoading, creditAnalyticsQuery.isLoading]);

  // ===== ACTIONS =====
  const actions = {
    // Date range
    setDateRange: useCallback((range: DateRange) => {
      setState(prev => ({ 
        ...prev, 
        dateRange: range,
        exportFilters: { ...prev.exportFilters, dateRange: range }
      }));
    }, []),

    setCustomDateRange: useCallback((start: string, end: string) => {
      const range: DateRange = {
        startDate: start,
        endDate: end,
        period: 'custom'
      };
      setState(prev => ({ 
        ...prev, 
        dateRange: range,
        exportFilters: { ...prev.exportFilters, dateRange: range }
      }));
    }, []),

    // Filters
    setFeatureFilter: useCallback((features: FeatureType[]) => {
      setState(prev => ({ 
        ...prev, 
        selectedFeatures: features,
        exportFilters: { ...prev.exportFilters, features }
      }));
    }, []),

    setActionFilter: useCallback((actions: ActionType[]) => {
      setState(prev => ({ 
        ...prev, 
        selectedActions: actions,
        exportFilters: { ...prev.exportFilters, actions }
      }));
    }, []),

    setUserFilter: useCallback((users: number[]) => {
      setState(prev => ({ ...prev, selectedUsers: users }));
    }, []),

    clearFilters: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        selectedFeatures: [],
        selectedActions: [],
        selectedUsers: userId ? [userId] : [],
        exportFilters: {
          ...prev.exportFilters,
          features: [],
          actions: []
        }
      }));
    }, [userId]),

    // UI
    setActiveTab: useCallback((tab: UsageTab) => {
      setState(prev => ({ ...prev, activeTab: tab }));
    }, []),

    setSelectedMetric: useCallback((metric: MetricType) => {
      setState(prev => ({ ...prev, selectedMetric: metric }));
    }, []),

    setChartType: useCallback((type: ChartType) => {
      setState(prev => ({ ...prev, chartType: type }));
    }, []),

    setViewMode: useCallback((mode: ViewMode) => {
      setState(prev => ({ ...prev, viewMode: mode }));
    }, []),

    // Export
    exportData: useCallback(async (format: ExportFormat, filters?: ExportFilters) => {
      const exportFilters = filters || state.exportFilters;
      await exportMutation.mutateAsync({ format, filters: exportFilters });
    }, [exportMutation, state.exportFilters]),

    // Real-time (placeholder - implement WebSocket connection if needed)
    startRealTimeUpdates: useCallback(() => {
      toast({
        title: 'Atualizações em tempo real ativadas',
        description: 'Os dados serão atualizados automaticamente.'
      });
    }, [toast]),

    stopRealTimeUpdates: useCallback(() => {
      toast({
        title: 'Atualizações em tempo real desativadas'
      });
    }, [toast]),

    // Data refresh
    refreshAll: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
    }, [queryClient]),

    refreshAnalytics: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/usage/analytics'] });
    }, [queryClient]),

    refreshCredits: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/usage/credits'] });
    }, [queryClient])
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    formatUsageNumber: useCallback((value: number): string => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }, []),

    formatDuration: useCallback((ms: number): string => {
      if (ms < 1000) return `${ms}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
      if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
      return `${(ms / 3600000).toFixed(1)}h`;
    }, []),

    formatCurrency: useCallback((value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }, []),

    formatPercentage: useCallback((value: number): string => {
      return `${(value * 100).toFixed(1)}%`;
    }, []),

    getGrowthIcon: useCallback((rate: number): 'up' | 'down' | 'stable' => {
      if (rate > 5) return 'up';
      if (rate < -5) return 'down';
      return 'stable';
    }, []),

    getStatusColor: useCallback((status: string): string => {
      switch (status) {
        case 'success': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        case 'info': return 'text-blue-600';
        default: return 'text-gray-600';
      }
    }, []),

    calculateGrowthRate: useCallback((current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    }, []),

    groupByPeriod: useCallback((data: any[], period: string): any[] => {
      // Group data by specified period (daily, weekly, monthly)
      const grouped: Record<string, any[]> = {};
      
      data.forEach(item => {
        const date = new Date(item.timestamp);
        let key: string;
        
        switch (period) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
        
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });
      
      return Object.entries(grouped).map(([key, items]) => ({
        period: key,
        count: items.length,
        items
      })).sort((a, b) => a.period.localeCompare(b.period));
    }, [])
  };

  // ===== RETURN OBJECT =====
  return {
    state,
    analytics: {
      data: analyticsQuery.data,
      isLoading: analyticsQuery.isLoading,
      error: analyticsQuery.error?.message || null,
      refetch: analyticsQuery.refetch
    },
    credits: {
      data: creditAnalyticsQuery.data,
      isLoading: creditAnalyticsQuery.isLoading,
      error: creditAnalyticsQuery.error?.message || null,
      refetch: creditAnalyticsQuery.refetch
    },
    actions,
    utils
  };
};
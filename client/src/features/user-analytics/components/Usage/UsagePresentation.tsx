/**
 * PRESENTATION: UsagePresentation
 * Interface de usuário para análise de uso e métricas
 * Extraído de Usage.tsx (739 linhas) para modularização
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  DollarSign,
  Users,
  Globe,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Settings,
  Eye
} from 'lucide-react';

// Import specialized components (to be created)
import { OverviewTab } from '../OverviewTab/OverviewTab';
import { FeaturesTab } from '../FeaturesTab/FeaturesTab';
import { PerformanceTab } from '../PerformanceTab/PerformanceTab';
import { UsersTab } from '../UsersTab/UsersTab';
import { GeographicTab } from '../GeographicTab/GeographicTab';
import { CreditsTab } from '../CreditsTab/CreditsTab';
import { ErrorsTab } from '../ErrorsTab/ErrorsTab';
import { RealTimeTab } from '../RealTimeTab/RealTimeTab';
import { DateRangePicker } from '../DateRangePicker/DateRangePicker';
import { FilterBar } from '../FilterBar/FilterBar';
import { ExportDialog } from '../ExportDialog/ExportDialog';
import { MetricCard } from '../MetricCard/MetricCard';

// Import types
import { UsageAnalyticsPresentationProps, UsageTab } from '../../types/usage';
import { USAGE_TAB_LABELS } from '../../types/usage';

export const UsagePresentation = ({
  state,
  analytics,
  credits,
  actions,
  utils,
  readOnly = false,
  showCredits = true,
  showRealTime = false
}: UsageAnalyticsPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const hasData = analytics.data || credits.data;
  const isLoading = analytics.isLoading || credits.isLoading;
  const hasError = analytics.error || credits.error;

  // Tab configuration
  const availableTabs: UsageTab[] = [
    'overview',
    'features', 
    'performance',
    'users',
    'geographic',
    ...(showCredits ? ['credits'] as UsageTab[] : []),
    'errors',
    ...(showRealTime ? ['realtime'] as UsageTab[] : [])
  ];

  // Quick stats for header
  const quickStats = analytics.data ? {
    totalActions: analytics.data.totalActions,
    uniqueSessions: analytics.data.uniqueSessions,
    avgDuration: analytics.data.averageSessionDuration,
    topFeature: analytics.data.topFeatures[0]?.feature || 'N/A'
  } : null;

  // ===== HANDLERS =====
  const handleTabChange = (tab: string) => {
    actions.setActiveTab(tab as UsageTab);
  };

  const handleExport = async () => {
    await actions.exportData(state.exportFormat);
  };

  const handleRefresh = () => {
    actions.refreshAll();
  };

  return (
    <>
      <Helmet>
        <title>Análise de Uso - Dashboard de Métricas</title>
        <meta 
          name="description" 
          content="Análise detalhada de uso de recursos, métricas de performance e insights de comportamento do usuário."
        />
      </Helmet>

      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Análise de Uso
              </h2>
              <p className="text-sm text-gray-600">
                Métricas e insights de uso da plataforma
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {!readOnly && (
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={state.isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Ações"
              value={quickStats.totalActions}
              format="number"
              icon={<Activity className="h-4 w-4" />}
              color="blue"
              utils={utils}
            />
            <MetricCard
              title="Sessões Únicas"
              value={quickStats.uniqueSessions}
              format="number"
              icon={<Users className="h-4 w-4" />}
              color="green"
              utils={utils}
            />
            <MetricCard
              title="Duração Média"
              value={quickStats.avgDuration}
              format="duration"
              icon={<Clock className="h-4 w-4" />}
              color="orange"
              utils={utils}
            />
            <MetricCard
              title="Recurso Principal"
              value={quickStats.topFeature}
              format="number"
              icon={<TrendingUp className="h-4 w-4" />}
              color="purple"
              utils={utils}
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Range Picker */}
              <div className="flex-1">
                <DateRangePicker
                  dateRange={state.dateRange}
                  onChange={actions.setDateRange}
                  onCustomRangeChange={actions.setCustomDateRange}
                />
              </div>

              {/* Filter Bar */}
              <div className="flex-2">
                <FilterBar
                  selectedFeatures={state.selectedFeatures}
                  selectedActions={state.selectedActions}
                  selectedUsers={state.selectedUsers}
                  onFeatureChange={actions.setFeatureFilter}
                  onActionChange={actions.setActionFilter}
                  onUserChange={actions.setUserFilter}
                  onClearFilters={actions.clearFilters}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && !hasData && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando análises...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Erro ao carregar dados</h3>
            </div>
            <p className="text-red-700 mt-1">
              {analytics.error || credits.error}
            </p>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm" 
              className="mt-3 text-red-600 border-red-600 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Main Content - Tabs */}
        {!isLoading && hasData && (
          <Card>
            <CardContent className="p-0">
              <Tabs 
                value={state.activeTab} 
                onValueChange={handleTabChange}
                className="w-full"
              >
                {/* Tabs Navigation */}
                <div className="border-b px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    {availableTabs.map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab}
                        className="text-xs lg:text-sm"
                      >
                        {USAGE_TAB_LABELS[tab]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Tab Contents */}
                <div className="p-6">
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <OverviewTab
                      analytics={analytics.data!}
                      creditAnalytics={credits.data}
                      isLoading={isLoading}
                      showCredits={showCredits}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="mt-0">
                    <FeaturesTab
                      analytics={analytics.data!}
                      selectedMetric={state.selectedMetric}
                      chartType={state.chartType}
                      viewMode={state.viewMode}
                      onMetricChange={actions.setSelectedMetric}
                      onChartTypeChange={actions.setChartType}
                      onViewModeChange={actions.setViewMode}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Performance Tab */}
                  <TabsContent value="performance" className="mt-0">
                    <PerformanceTab
                      analytics={analytics.data!}
                      isLoading={isLoading}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Users Tab */}
                  <TabsContent value="users" className="mt-0">
                    <UsersTab
                      analytics={analytics.data!}
                      selectedUsers={state.selectedUsers}
                      onUserSelect={actions.setUserFilter}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Geographic Tab */}
                  <TabsContent value="geographic" className="mt-0">
                    <GeographicTab
                      analytics={analytics.data!}
                      chartType={state.chartType}
                      onChartTypeChange={actions.setChartType}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Credits Tab */}
                  {showCredits && (
                    <TabsContent value="credits" className="mt-0">
                      <CreditsTab
                        creditAnalytics={credits.data!}
                        isLoading={credits.isLoading}
                        utils={utils}
                      />
                    </TabsContent>
                  )}

                  {/* Errors Tab */}
                  <TabsContent value="errors" className="mt-0">
                    <ErrorsTab
                      analytics={analytics.data!}
                      isLoading={isLoading}
                      utils={utils}
                    />
                  </TabsContent>

                  {/* Real Time Tab */}
                  {showRealTime && (
                    <TabsContent value="realtime" className="mt-0">
                      <RealTimeTab
                        isActive={state.activeTab === 'realtime'}
                        onStart={actions.startRealTimeUpdates}
                        onStop={actions.stopRealTimeUpdates}
                        utils={utils}
                      />
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !hasData && !hasError && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum dado de uso encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Os dados de uso aparecerão aqui conforme você utiliza a plataforma.
              </p>
              <Button
                onClick={handleRefresh}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Export Dialog */}
        <ExportDialog
          isOpen={false} // Control with state if needed
          onClose={() => {}}
          onExport={actions.exportData}
          isExporting={state.isExporting}
        />
      </div>
    </>
  );
};
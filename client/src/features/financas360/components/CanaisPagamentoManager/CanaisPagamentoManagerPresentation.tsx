/**
 * PRESENTATION: CanaisPagamentoManagerPresentation
 * Interface de usuário para gerenciamento de canais de pagamento
 * Extraído de CanaisPagamentoManager.tsx (693 linhas) para modularização
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  RefreshCw, 
  Download,
  Filter,
  CreditCard,
  Zap,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Link as LinkIcon,
  Activity
} from 'lucide-react';

// Import specialized components (to be created)
import { CanalPagamentoList } from '../CanalPagamentoList/CanalPagamentoList';
import { CanalPagamentoForm } from '../CanalPagamentoForm/CanalPagamentoForm';
import { CanalPagamentoFilters } from '../CanalPagamentoFilters/CanalPagamentoFilters';

// Import types
import { CanaisPagamentoManagerPresentationProps } from '../../types/canaisPagamento';

export const CanaisPagamentoManagerPresentation = ({
  state,
  canais,
  processadoras,
  transacoes,
  analytics,
  actions,
  utils,
  readOnly = false,
  showAnalytics = true,
  showBulkActions = true
}: CanaisPagamentoManagerPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const hasData = canais.data.length > 0;
  const isLoading = canais.isLoading;
  const hasError = canais.error;
  const selectedCount = state.selectedItems.length;

  // Quick stats for header
  const quickStats = {
    total: canais.data.length,
    ativos: canais.data.filter(c => c.isAtivo).length,
    inativos: canais.data.filter(c => !c.isAtivo).length,
    taxaMedia: canais.data.reduce((sum, c) => sum + c.taxas.taxaPercentual, 0) / (canais.data.length || 1)
  };

  // ===== HANDLERS =====
  const handleRefresh = () => {
    canais.refetch();
  };

  const handleExport = async () => {
    await actions.exportCanais('xlsx');
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    if (confirm(`Deseja realmente excluir ${selectedCount} canais selecionados?`)) {
      await actions.bulkDelete(state.selectedItems);
    }
  };

  const handleTestConnection = async (canalId: number) => {
    await actions.testConnection(canalId);
  };

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Canais de Pagamento - Finanças 360</title>
        <meta 
          name="description" 
          content="Sistema completo de gerenciamento de canais de pagamento com configuração, teste de conexão e análise de performance."
        />
      </Helmet>

      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Canais de Pagamento
              </h2>
              <p className="text-sm text-gray-600">
                Configuração e gerenciamento de métodos de pagamento
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedCount > 0 && showBulkActions && !readOnly && (
              <>
                <Badge variant="outline" className="px-3 py-1">
                  {selectedCount} selecionados
                </Badge>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  disabled={state.isDeleting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            {!readOnly && (
              <Button
                onClick={actions.showCreateForm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Canal
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.total}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{quickStats.ativos}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">{quickStats.inativos}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa Média</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {utils.formatPercentage(quickStats.taxaMedia)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        {showAnalytics && analytics.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Volume Processado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {utils.formatCurrency(analytics.data.valorTotalProcessado)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {utils.formatPercentage(analytics.data.taxaAprovacao)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.data.tempoMedioProcessamento.toFixed(1)}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <CanalPagamentoFilters
              filters={state.filters}
              onSearchChange={actions.search}
              onTipoFilter={actions.filterByTipo}
              onStatusFilter={actions.filterByStatus}
              onAtivoFilter={actions.filterByAtivo}
              onProcessadoraFilter={actions.filterByProcessadora}
              onDateRangeFilter={actions.filterByDateRange}
              onClearFilters={actions.clearFilters}
            />
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && !hasData && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando canais...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Erro ao carregar canais</h3>
            </div>
            <p className="text-red-700 mt-1">{hasError}</p>
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

        {/* Main Content - Data List */}
        {!isLoading && hasData && (
          <Card>
            <CardContent className="p-0">
              <CanalPagamentoList
                canais={canais.filteredData}
                isLoading={isLoading}
                selectedCanal={state.selectedCanal}
                selectedItems={state.selectedItems}
                expandedRows={state.expandedRows}
                sort={state.sort}
                onCanalSelect={actions.selectCanal}
                onCanalEdit={actions.showEditForm}
                onCanalDelete={actions.deleteCanal}
                onCanalActivate={actions.activateCanal}
                onCanalDeactivate={actions.deactivateCanal}
                onCanalTest={handleTestConnection}
                onItemToggle={actions.toggleItemSelection}
                onRowToggle={actions.toggleRowExpansion}
                onSort={actions.sortBy}
                readOnly={readOnly}
                utils={utils}
              />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !hasData && !hasError && (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum canal encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {state.filters.searchTerm || state.filters.tipoFilter !== 'all' || state.filters.statusFilter !== 'all'
                  ? 'Nenhum canal corresponde aos filtros aplicados.'
                  : 'Comece configurando seu primeiro canal de pagamento.'
                }
              </p>
              {!readOnly && (
                <Button
                  onClick={actions.showCreateForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Canal
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Result */}
        {state.testResult && (
          <Card className={`border-l-4 ${
            state.testResult.success ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {state.testResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-medium ${
                  state.testResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  Teste de Conexão
                </h3>
              </div>
              <p className={`${state.testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {state.testResult.message}
              </p>
              {state.testResult.details && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Tempo de resposta: {state.testResult.details.responseTime}ms</p>
                  {state.testResult.details.apiVersion && (
                    <p>Versão da API: {state.testResult.details.apiVersion}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {hasData && state.totalItems > state.itemsPerPage && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min((state.currentPage - 1) * state.itemsPerPage + 1, state.totalItems)} a{' '}
              {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} de {state.totalItems} canais
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => actions.setPage(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                {state.currentPage}
              </span>
              <Button
                onClick={() => actions.setPage(state.currentPage + 1)}
                disabled={state.currentPage * state.itemsPerPage >= state.totalItems}
                variant="outline"
                size="sm"
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Modals and Dialogs */}
        
        {/* Form Dialog */}
        {state.showForm && (
          <CanalPagamentoForm
            canal={state.editingCanal}
            processadoras={processadoras.data}
            onSave={state.editingCanal ? 
              (data) => actions.updateCanal(state.editingCanal!.id, data) : 
              actions.createCanal
            }
            onCancel={actions.hideForm}
            isLoading={processadoras.isLoading}
            isSaving={state.isSaving}
            errors={state.errors}
            validationErrors={state.validationErrors}
            utils={utils}
          />
        )}

        {/* Configuration Dialog */}
        {state.showConfigDialog && state.selectedCanal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Configurações do Canal</h2>
                <Button
                  onClick={actions.hideConfigDialog}
                  variant="outline"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-gray-600">{state.selectedCanal.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <p className="text-gray-600">{utils.formatTipo(state.selectedCanal.tipo)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge className={utils.getStatusColor(state.selectedCanal.status)}>
                      {utils.formatStatus(state.selectedCanal.status)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Taxa</label>
                    <p className="text-gray-600">
                      {utils.formatPercentage(state.selectedCanal.taxas.taxaPercentual)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Dialog */}
        {state.showTransacoesDialog && state.selectedCanal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Transações - {state.selectedCanal.nome}
                </h2>
                <Button
                  onClick={actions.hideTransacoesDialog}
                  variant="outline"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              {transacoes.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <span className="ml-2">Carregando transações...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {transacoes.data.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma transação encontrada
                    </p>
                  ) : (
                    transacoes.data.map((transacao) => (
                      <div key={transacao.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{transacao.id}</p>
                            <p className="text-sm text-gray-600">
                              {utils.formatDate(transacao.dataProcessamento)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {utils.formatCurrency(transacao.valor)}
                            </p>
                            <Badge variant="outline">
                              {transacao.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
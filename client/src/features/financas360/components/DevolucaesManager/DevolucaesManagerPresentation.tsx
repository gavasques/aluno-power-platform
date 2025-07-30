/**
 * PRESENTATION: DevolucaesManagerPresentation
 * Interface de usuário para gerenciamento de devoluções
 * Extraído de DevolucaesManager.tsx (700 linhas) para modularização
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
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Import specialized components
import { DevolucaoList } from '../DevolucaoList/DevolucaoList';
import { DevolucaoForm } from '../DevolucaoForm/DevolucaoForm';
import { DevolucaoFilters } from '../DevolucaoFilters/DevolucaoFilters';

// Import types
import { DevolucaesManagerPresentationProps } from '../../types/devolucoes';

export const DevolucaesManagerPresentation = ({
  state,
  devolucoes,
  notasFiscais,
  analytics,
  actions,
  utils,
  readOnly = false,
  showAnalytics = true,
  showBulkActions = true
}: DevolucaesManagerPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const hasData = devolucoes.data.length > 0;
  const isLoading = devolucoes.isLoading;
  const hasError = devolucoes.error;
  const selectedCount = state.selectedItems.length;

  // Quick stats for header
  const quickStats = {
    total: devolucoes.data.length,
    pendentes: devolucoes.data.filter(d => d.status === 'pendente').length,
    processadas: devolucoes.data.filter(d => d.status === 'processada').length,
    valorTotal: devolucoes.data.reduce((sum, d) => sum + d.valorDevolvido, 0)
  };

  // ===== HANDLERS =====
  const handleRefresh = () => {
    devolucoes.refetch();
  };

  const handleExport = async () => {
    await actions.exportDevolucoes('xlsx');
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    if (confirm(`Deseja realmente excluir ${selectedCount} devoluções selecionadas?`)) {
      await actions.bulkDelete(state.selectedItems);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Devoluções - Finanças 360</title>
        <meta 
          name="description" 
          content="Sistema completo de gerenciamento de devoluções com controle de status, processamento e análise de dados."
        />
      </Helmet>

      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <RotateCcw className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gerenciamento de Devoluções
              </h2>
              <p className="text-sm text-gray-600">
                Controle e processamento de devoluções de produtos
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
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Devolução
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
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{quickStats.pendentes}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processadas</p>
                  <p className="text-2xl font-bold text-green-600">{quickStats.processadas}</p>
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
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {utils.formatCurrency(quickStats.valorTotal)}
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
                Análise de Devoluções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DevolucaoStats
                analytics={analytics.data}
                isLoading={analytics.isLoading}
                utils={utils}
              />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <DevolucaoFilters
              filters={state.filters}
              onSearchChange={actions.search}
              onTipoFilter={actions.filterByTipo}
              onStatusFilter={actions.filterByStatus}
              onDateRangeFilter={actions.filterByDateRange}
              onValorRangeFilter={actions.filterByValorRange}
              onClearFilters={actions.clearFilters}
            />
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && !hasData && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando devoluções...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Erro ao carregar devoluções</h3>
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
              <DevolucaoList
                devolucoes={devolucoes.filteredData}
                isLoading={isLoading}
                selectedDevolucao={state.selectedDevolucao}
                selectedItems={state.selectedItems}
                expandedRows={state.expandedRows}
                sort={state.sort}
                onDevolucaoSelect={actions.selectDevolucao}
                onDevolucaoEdit={actions.showEditForm}
                onDevolucaoDelete={actions.deleteDevolucao}
                onDevolucaoProcess={actions.showProcessingDialog}
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
              <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma devolução encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {state.filters.searchTerm || state.filters.tipoFilter !== 'all' || state.filters.statusFilter !== 'all'
                  ? 'Nenhuma devolução corresponde aos filtros aplicados.'
                  : 'Comece criando sua primeira devolução.'
                }
              </p>
              {!readOnly && (
                <Button
                  onClick={actions.showCreateForm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Devolução
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {hasData && state.totalItems > state.itemsPerPage && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min((state.currentPage - 1) * state.itemsPerPage + 1, state.totalItems)} a{' '}
              {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} de {state.totalItems} devoluções
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
          <DevolucaoForm
            devolucao={state.editingDevolucao}
            notasFiscais={notasFiscais.data}
            onSave={state.editingDevolucao ? 
              (data) => actions.updateDevolucao(state.editingDevolucao!.id, data) : 
              actions.createDevolucao
            }
            onCancel={actions.hideForm}
            isLoading={notasFiscais.isLoading}
            isSaving={state.isSaving}
            errors={state.errors}
            validationErrors={state.validationErrors}
            utils={utils}
          />
        )}

        {/* Items Dialog */}
        {state.showItemsDialog && state.selectedDevolucao && (
          <DevolucaoItemsDialog
            devolucao={state.selectedDevolucao}
            isOpen={state.showItemsDialog}
            onClose={actions.hideItemsDialog}
            readOnly={readOnly}
            utils={utils}
          />
        )}

        {/* Anexos Dialog */}
        {state.showAnexosDialog && state.selectedDevolucao && (
          <DevolucaoAnexosDialog
            devolucao={state.selectedDevolucao}
            isOpen={state.showAnexosDialog}
            onClose={actions.hideAnexosDialog}
            onUpload={actions.uploadAnexos}
            onDelete={actions.deleteAnexo}
            onDownload={actions.downloadAnexo}
            isUploading={false} // Add to state if needed
            readOnly={readOnly}
          />
        )}

        {/* Processing Dialog */}
        {state.showProcessingDialog && state.selectedDevolucao && (
          <DevolucaoProcessingDialog
            devolucao={state.selectedDevolucao}
            isOpen={state.showProcessingDialog}
            onClose={actions.hideProcessingDialog}
            onProcess={actions.processDevolucao}
            onApprove={() => actions.approveDevolucao(state.selectedDevolucao!.id)}
            onReject={actions.rejectDevolucao}
            isProcessing={state.isProcessing}
          />
        )}
      </div>
    </>
  );
};
/**
 * PRESENTATION: NotasFiscaisManagerPresentation
 * Interface de usuário para gerenciamento de notas fiscais
 * Extraído de NotasFiscaisManager.tsx (810 linhas) para modularização
 */
import { useState } from 'react';
import { FileText, Upload, Download, Plus, Filter, Search, TrendingUp, DollarSign, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';

// Import specialized components (to be created)
import { NotasList } from '../NotasList/NotasList';
import { NotaFiscalForm } from '../NotaFiscalForm/NotaFiscalForm';
import { ImportDialog } from '../ImportDialog/ImportDialog';
import { FilterBar } from '../FilterBar/FilterBar';
import { StatsCards } from '../StatsCards/StatsCards';

// Import types
import { NotasFiscaisManagerPresentationProps } from '../../types';

export const NotasFiscaisManagerPresentation = ({
  state,
  notas,
  fornecedores,
  produtos,
  actions,
  calculations,
  readOnly = false,
  showImportExport = true,
  allowBulkOperations = true
}: NotasFiscaisManagerPresentationProps) => {
  
  // ===== COMPUTED VALUES =====
  const notasStats = {
    total: notas.data.length,
    filtered: notas.filteredData.length,
    selected: state.selectedItems.length,
    pendentes: notas.data.filter(n => n.status === 'pendente').length,
    aprovadas: notas.data.filter(n => n.status === 'aprovada').length
  };

  // ===== HANDLERS =====
  const handleNotaSave = async (data: any) => {
    if (state.selectedNota) {
      await actions.updateNota(state.selectedNota.id, data);
    } else {
      await actions.createNota(data);
    }
    actions.hideForm();
  };

  const handleImportXML = async (file: File) => {
    await actions.importXML(file);
    actions.hideImportDialog();
  };

  const handleImportCSV = async (file: File) => {
    await actions.importCSV(file);
    actions.hideImportDialog();
  };

  return (
    <>
      <Helmet>
        <title>Notas Fiscais - Gerenciamento Financeiro</title>
        <meta 
          name="description" 
          content="Gerencie notas fiscais com importação XML, controle de status, relatórios financeiros e integração com fornecedores." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notas Fiscais
                </h1>
                <p className="text-gray-600">
                  Controle de entrada e saída, impostos e fornecedores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats Quick View */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{notasStats.total} notas</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {calculations.totalValue.toLocaleString('pt-BR')}</span>
                </div>
                {notasStats.pendentes > 0 && (
                  <Badge variant="secondary">
                    {notasStats.pendentes} pendentes
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              {!readOnly && (
                <div className="flex gap-2">
                  {showImportExport && (
                    <>
                      <Button
                        onClick={actions.showImportDialog}
                        disabled={state.isImporting}
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {state.isImporting ? 'Importando...' : 'Importar'}
                      </Button>
                      
                      {state.selectedItems.length > 0 && (
                        <Button
                          onClick={() => actions.bulkExport(state.selectedItems)}
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar ({state.selectedItems.length})
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    onClick={actions.showCreateForm}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Nota
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, fornecedor ou chave de acesso..."
                value={state.searchQuery}
                onChange={(e) => actions.search(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-4">
            <FilterBar
              statusFilter={state.statusFilter}
              tipoFilter={state.tipoFilter}
              fornecedorFilter={state.fornecedorFilter}
              dateRange={state.dateRange}
              fornecedores={fornecedores.data}
              onStatusFilter={actions.filterByStatus}
              onTipoFilter={actions.filterByTipo}
              onFornecedorFilter={actions.filterByFornecedor}
              onDateRangeFilter={actions.filterByDateRange}
              onClearFilters={() => {
                actions.filterByStatus('all');
                actions.filterByTipo('all');
                actions.filterByFornecedor(null);
                actions.filterByDateRange({});
                actions.search('');
              }}
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {notasStats.filtered} de {notasStats.total} notas fiscais
              </span>
              {state.searchQuery && (
                <Badge variant="outline">
                  Filtrado: "{state.searchQuery}"
                </Badge>
              )}
              {state.selectedItems.length > 0 && (
                <Badge variant="secondary">
                  {state.selectedItems.length} selecionadas
                </Badge>
              )}
            </div>

            {/* Bulk Actions */}
            {allowBulkOperations && state.selectedItems.length > 0 && !readOnly && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actions.bulkApprove(state.selectedItems)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Aprovar Selecionadas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actions.bulkDelete(state.selectedItems)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Excluir Selecionadas
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards
            calculations={calculations}
            isLoading={notas.isLoading}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            {notas.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">Carregando notas fiscais...</span>
              </div>
            ) : notas.filteredData.length === 0 ? (
              <div className="text-center py-12">
                {state.searchQuery || 
                 state.statusFilter !== 'all' || 
                 state.tipoFilter !== 'all' || 
                 state.fornecedorFilter ||
                 state.dateRange.start || state.dateRange.end ? (
                  <div>
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma nota fiscal encontrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ajuste os filtros ou tente uma busca diferente.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        actions.search('');
                        actions.filterByStatus('all');
                        actions.filterByTipo('all');
                        actions.filterByFornecedor(null);
                        actions.filterByDateRange({});
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma nota fiscal cadastrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Comece criando uma nova nota ou importando arquivos XML.
                    </p>
                    {!readOnly && (
                      <div className="flex justify-center gap-2">
                        {showImportExport && (
                          <Button
                            onClick={actions.showImportDialog}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar XML
                          </Button>
                        )}
                        <Button
                          onClick={actions.showCreateForm}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Nota Fiscal
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <NotasList
                notas={notas.filteredData}
                isLoading={notas.isLoading}
                selectedNota={state.selectedNota}
                selectedItems={state.selectedItems}
                onNotaSelect={actions.selectNota}
                onNotaEdit={actions.showEditForm}
                onNotaDelete={actions.deleteNota}
                onItemToggle={actions.toggleItemSelection}
                onSelectAll={actions.selectAllItems}
                onClearSelection={actions.clearSelection}
                readOnly={readOnly}
              />
            )}
          </CardContent>
        </Card>

        {/* Forms and Modals */}
        {state.showForm && (
          <NotaFiscalForm
            nota={state.selectedNota || undefined}
            fornecedores={fornecedores.data}
            produtos={produtos.data}
            onSave={handleNotaSave}
            onCancel={actions.hideForm}
            isLoading={state.isSaving}
          />
        )}

        {state.showImportDialog && showImportExport && (
          <ImportDialog
            isOpen={state.showImportDialog}
            onImportXML={handleImportXML}
            onImportCSV={handleImportCSV}
            onClose={actions.hideImportDialog}
            isImporting={state.isImporting}
          />
        )}
      </div>
    </>
  );
};
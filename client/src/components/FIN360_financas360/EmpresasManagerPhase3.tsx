/**
 * Exemplo completo de manager com todas as funcionalidades da Fase 3
 * - Cache inteligente e otimizações
 * - Validação aprimorada
 * - Paginação automática
 * - Bulk actions
 * - Filtros avançados  
 * - Export/Import
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Hooks Phase 3
import { useEmpresasWithAdvancedFilters } from '@/hooks/financas360/useEmpresasManagerOptimized';
import { usePaginatedResource } from '@/hooks/usePaginatedResource';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useExportImport } from '@/hooks/useExportImport';
import { useFormValidation } from '@/hooks/useFormValidation';

// Components Phase 3
import { ManagerLayout } from '@/components/ui/manager/ManagerLayout';
import { BulkActionsBar, SelectableItemWrapper } from '@/components/ui/manager/BulkActionsBar';
import { AdvancedFilters, AdvancedFilter } from '@/components/ui/manager/AdvancedFilters';
import { ExportImportDialog } from '@/components/ui/manager/ExportImportDialog';
import { Pagination } from '@/components/ui/manager/Pagination';

// Existing components
import { FormDialog } from '@/components/ui/manager/FormDialog';
import { FilterBar } from '@/components/ui/manager/FilterBar';

import { Search, Plus, Building2, Settings, Download, Upload } from 'lucide-react';
import { EmpresaEntity } from '@/types/financas360';

export function EmpresasManagerPhase3() {
  // Manager principal com cache otimizado
  const manager = useEmpresasWithAdvancedFilters();

  // Paginação
  const pagination = usePaginatedResource({
    resource: 'empresas',
    pageSize: 20,
    enabled: !!manager.items
  });

  // Bulk actions
  const bulkActions = useBulkActions({
    items: manager.filteredItems,
    onDelete: async (ids) => {
      for (const id of ids) {
        await manager.deleteMutation.mutateAsync(id);
      }
    },
    onActivate: async (ids) => {
      for (const id of ids) {
        await manager.updateMutation.mutateAsync({
          id,
          data: { ativo: true }
        });
      }
    },
    onDeactivate: async (ids) => {
      for (const id of ids) {
        await manager.updateMutation.mutateAsync({
          id,
          data: { ativo: false }
        });
      }
    }
  });

  // Export/Import
  const exportImport = useExportImport({
    resource: 'empresas',
    exportFields: [
      { key: 'razao_social', label: 'Razão Social', type: 'string' },
      { key: 'nome_fantasia', label: 'Nome Fantasia', type: 'string' },
      { key: 'cnpj', label: 'CNPJ', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'telefone', label: 'Telefone', type: 'string' },
      { key: 'endereco', label: 'Endereço', type: 'string' },
      { key: 'cidade', label: 'Cidade', type: 'string' },
      { key: 'estado', label: 'Estado', type: 'string' },
      { key: 'cep', label: 'CEP', type: 'string' },
      { key: 'ativo', label: 'Ativo', type: 'boolean' }
    ],
    importFields: [
      { key: 'razao_social', label: 'Razão Social', required: true, type: 'string' },
      { key: 'nome_fantasia', label: 'Nome Fantasia', type: 'string' },
      { key: 'cnpj', label: 'CNPJ', required: true, type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'telefone', label: 'Telefone', type: 'string' },
      { key: 'endereco', label: 'Endereço', type: 'string' },
      { key: 'cidade', label: 'Cidade', type: 'string' },
      { key: 'estado', label: 'Estado', type: 'string' },
      { key: 'cep', label: 'CEP', type: 'string' },
      { key: 'ativo', label: 'Ativo', type: 'boolean' }
    ]
  });

  // Validação do formulário
  const formValidation = useFormValidation({
    razao_social: { required: true, minLength: 2 },
    cnpj: { required: true, cnpj: true },
    email: { email: true }
  });

  // Estados locais
  const [showExportImport, setShowExportImport] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>(
    manager.advancedFilters || []
  );

  // Dados paginados
  const paginatedItems = pagination.data?.data || manager.filteredItems;
  const totalPages = pagination.data?.totalPages || 1;
  const currentPage = pagination.currentPage;

  // Renderizar item da empresa
  const renderEmpresaCard = (empresa: EmpresaEntity) => (
    <SelectableItemWrapper
      key={empresa.id}
      isSelected={bulkActions.selectedItems.includes(empresa.id)}
      onToggle={() => bulkActions.toggleItem(empresa.id)}
      isSelectionMode={bulkActions.selectedItems.length > 0}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {empresa.razao_social}
              </CardTitle>
              {empresa.nome_fantasia && (
                <p className="text-sm text-gray-600 mt-1">
                  {empresa.nome_fantasia}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => manager.startEdit(empresa)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>CNPJ:</strong> {empresa.cnpj}</div>
            {empresa.email && (
              <div><strong>Email:</strong> {empresa.email}</div>
            )}
            {empresa.telefone && (
              <div><strong>Telefone:</strong> {empresa.telefone}</div>
            )}
            <div>
              <strong>Localização:</strong> {empresa.cidade}/{empresa.estado}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${empresa.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {empresa.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </SelectableItemWrapper>  
  );

  // Campos do formulário
  const formFields = [
    {
      name: 'razao_social',
      label: 'Razão Social',
      type: 'text' as const,
      required: true,
      error: formValidation.getError('razao_social')
    },
    {
      name: 'nome_fantasia',
      label: 'Nome Fantasia',
      type: 'text' as const
    },
    {
      name: 'cnpj',
      label: 'CNPJ',
      type: 'text' as const,
      required: true,
      error: formValidation.getError('cnpj')
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      error: formValidation.getError('email')
    },
    {
      name: 'telefone',
      label: 'Telefone',
      type: 'tel' as const
    },
    {
      name: 'endereco',
      label: 'Endereço',
      type: 'text' as const
    },
    {
      name: 'cidade',
      label: 'Cidade',
      type: 'text' as const
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'text' as const
    },
    {
      name: 'cep',
      label: 'CEP',
      type: 'text' as const
    },
    {
      name: 'ativo',
      label: 'Ativo',
      type: 'checkbox' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com cache info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Empresas (Phase 3)</h1>
          {manager.debugInfo && (
            <p className="text-sm text-gray-600">
              Cache: {manager.debugInfo.cacheStatus.itemsCount} items, 
              Last update: {manager.debugInfo.cacheStatus.lastUpdated}
              {manager.debugInfo.cacheStatus.isStale && ' (stale)'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportImport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export/Import
          </Button>
          <Button onClick={manager.openDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <FilterBar
            searchValue={manager.filters.search}
            onSearchChange={manager.updateFilters}
            placeholder="Buscar empresas..."
            showActiveFilter={true}
            activeFilter={manager.filters.ativo}
            onActiveFilterChange={(ativo) => manager.updateFilters({ ativo })}
          />
        </div>
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters(manager.advancedFilters || [])}
        />
      </div>

      {/* Manager Layout */}
      <ManagerLayout
        isLoading={manager.isLoading}
        error={manager.error}
        items={paginatedItems}
        totalCount={manager.filteredItems.length}
        emptyMessage="Nenhuma empresa encontrada"
        onRetry={manager.handleRetry}
        renderItem={renderEmpresaCard}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={pagination.setCurrentPage}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.setPageSize}
        totalItems={manager.filteredItems.length}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        isVisible={bulkActions.selectedItems.length > 0}
        selectedCount={bulkActions.selectedItems.length}
        totalCount={manager.filteredItems.length}
        isAllSelected={bulkActions.isAllSelected}
        isPartialSelected={bulkActions.isPartialSelected}
        onToggleAll={bulkActions.toggleAll}
        onClearSelection={bulkActions.clearSelection}
        onExecuteAction={bulkActions.executeAction}
        actions={[
          {
            id: 'delete',
            label: 'Excluir',
            icon: Settings,
            variant: 'destructive',
            requiresConfirmation: true
          },
          {
            id: 'activate',
            label: 'Ativar',
            icon: Settings,
            variant: 'default'
          },
          {
            id: 'export',
            label: 'Exportar Selecionados',
            icon: Download,
            variant: 'outline'
          }
        ]}
        isExecuting={bulkActions.isExecuting}
      />

      {/* Form Dialog */}
      <FormDialog
        isOpen={manager.isDialogOpen}
        onOpenChange={manager.setIsDialogOpen}
        title={manager.editingItem ? 'Editar Empresa' : 'Nova Empresa'}
        fields={formFields}
        formData={manager.formData}
        onFormDataChange={manager.updateFormData}
        onSubmit={manager.handleSubmit}
        onCancel={manager.closeDialog}
        isSubmitting={manager.isSubmitting}
      />

      {/* Export/Import Dialog */}
      <ExportImportDialog
        isOpen={showExportImport}
        onOpenChange={setShowExportImport}
        onExport={exportImport.exportData}
        onImport={exportImport.importFile}
        onDownloadTemplate={exportImport.downloadTemplate}
        onPreviewImport={exportImport.previewImport}
        isExporting={exportImport.isExporting}
        isImporting={exportImport.isImporting}
        importResult={exportImport.importResult}
        exportFields={exportImport.exportFields}
        importFields={exportImport.importFields}
        selectedCount={bulkActions.selectedItems.length}
        totalCount={manager.filteredItems.length}
      />
    </div>
  );
}
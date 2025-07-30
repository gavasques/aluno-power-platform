/**
 * PRESENTATION: ImportedProductSuppliersPresentation
 * Pure UI component for product suppliers management functionality
 * Extracted from ImportedProductSuppliersTab.tsx (641 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Package, TrendingUp, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SuppliersTable } from './components/SuppliersTable';
import { SupplierForm } from './components/SupplierForm';
import type { ProductSupplier, ImportedProductSuppliersState, ImportedProductSuppliersActions } from './types';

interface SuppliersStatsProps {
  suppliers: ProductSupplier[];
}

const SuppliersStats = memo<SuppliersStatsProps>(({ suppliers }) => {
  const mainSupplier = suppliers.find(s => s.isMainSupplier);
  const avgCost = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.costPrice, 0) / suppliers.length : 0;
  const avgLeadTime = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.leadTime, 0) / suppliers.length : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total Fornecedores</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Fornecedor Principal</p>
              <p className="text-lg font-bold truncate">
                {mainSupplier ? mainSupplier.supplier?.name || 'N/A' : 'Não definido'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
              <p className="text-2xl font-bold">{formatCurrency(avgCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Lead Time Médio</p>
              <p className="text-2xl font-bold">{Math.round(avgLeadTime)} dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

interface ImportedProductSuppliersPresentationProps {
  suppliers: ProductSupplier[];
  availableSuppliers: any[];
  loading: boolean;
  error: any;
  state: Omit<ImportedProductSuppliersState, 'suppliers' | 'availableSuppliers' | 'loading' | 'error'>;
  isUpdating: boolean;
  isDeleting: boolean;
  isSettingMain: boolean;
  actions: ImportedProductSuppliersActions;
}

export const ImportedProductSuppliersPresentation = memo<ImportedProductSuppliersPresentationProps>(({
  suppliers,
  availableSuppliers,
  loading,
  error,
  state,
  isUpdating,
  isDeleting,
  isSettingMain,
  actions
}) => {
  if (loading) {
    return <LoadingSpinner message="Carregando fornecedores..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fornecedores do Produto</h2>
          <p className="text-muted-foreground">
            Gerencie os fornecedores e suas condições comerciais
          </p>
        </div>
        <Button onClick={actions.handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Fornecedor
        </Button>
      </div>

      {/* Stats */}
      <SuppliersStats suppliers={suppliers} />

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, empresa ou país..."
              value={state.searchTerm}
              onChange={(e) => actions.updateSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SuppliersTable
            suppliers={suppliers}
            deletingId={state.deletingId}
            sortBy={state.sortBy}
            sortOrder={state.sortOrder}
            onEdit={actions.handleEdit}
            onDelete={actions.handleDelete}
            onSetMainSupplier={actions.handleSetMainSupplier}
            onSort={actions.updateSort}
            isDeleting={isDeleting}
            isSettingMain={isSettingMain}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <SupplierForm
        open={state.showForm}
        isEditing={!!state.editingId}
        formData={state.formData}
        availableSuppliers={availableSuppliers}
        isUpdating={isUpdating}
        onSave={actions.handleSave}
        onCancel={actions.handleCancel}
        onFieldChange={actions.updateFormField}
      />
    </div>
  );
});
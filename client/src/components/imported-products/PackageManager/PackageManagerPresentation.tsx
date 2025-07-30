/**
 * PRESENTATION: PackageManagerPresentation
 * Pure UI component for package management functionality
 * Extracted from PackageManager.tsx (654 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, TrendingUp, DollarSign } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PackageFilters } from './components/PackageFilters';
import { PackageTable } from './components/PackageTable';
import { PackageForm } from './components/PackageForm';
import type { ProductPackage, PackageManagerState, PackageManagerActions } from './types';

interface PackageStatsProps {
  packages: ProductPackage[];
}

const PackageStats = memo<PackageStatsProps>(({ packages }) => {
  const totalPackages = packages.length;
  const pendingPackages = packages.filter(p => p.status === 'pending').length;
  const inTransitPackages = packages.filter(p => ['shipped', 'transit', 'customs'].includes(p.status)).length;
  const totalValue = packages.reduce((sum, p) => sum + p.finalCost, 0);

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
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total de Pacotes</p>
              <p className="text-2xl font-bold">{totalPackages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{pendingPackages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Em Trânsito</p>
              <p className="text-2xl font-bold">{inTransitPackages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

interface PackageManagerPresentationProps {
  packages: ProductPackage[];
  loading: boolean;
  error: any;
  state: Omit<PackageManagerState, 'packages' | 'loading' | 'error'>;
  isUpdating: boolean;
  isDeleting: boolean;
  actions: PackageManagerActions;
}

export const PackageManagerPresentation = memo<PackageManagerPresentationProps>(({
  packages,
  loading,
  error,
  state,
  isUpdating,
  isDeleting,
  actions
}) => {
  if (loading) {
    return <LoadingSpinner message="Carregando pacotes..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Pacotes</h1>
          <p className="text-muted-foreground">
            Controle seus pacotes importados e acompanhe o status de entrega
          </p>
        </div>
        <Button onClick={actions.handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pacote
        </Button>
      </div>

      {/* Stats */}
      <PackageStats packages={packages} />

      {/* Filters */}
      <PackageFilters
        searchTerm={state.searchTerm}
        statusFilter={state.statusFilter}
        supplierFilter={state.supplierFilter}
        onSearchChange={actions.updateSearch}
        onStatusFilterChange={actions.updateStatusFilter}
        onSupplierFilterChange={actions.updateSupplierFilter}
        onRefresh={actions.refreshData}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacotes ({packages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <PackageTable
            packages={packages}
            deletingId={state.deletingId}
            onEdit={actions.handleEdit}
            onDelete={actions.handleDelete}
            onViewProducts={actions.handleViewProducts}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <PackageForm
        open={state.showForm}
        isEditing={!!state.editingId}
        formData={state.formData}
        isUpdating={isUpdating}
        onSave={actions.handleSave}
        onCancel={actions.handleCancel}
        onFieldChange={actions.updateFormField}
      />
    </div>
  );
});
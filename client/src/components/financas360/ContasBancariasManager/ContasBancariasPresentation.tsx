/**
 * PRESENTATION: ContasBancariasPresentation
 * Pure UI component for bank accounts management functionality
 * Extracted from ContasBancariasManager.tsx (666 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ContasBancariasFilters } from './components/ContasBancariasFilters';
import { ContasBancariasTable } from './components/ContasBancariasTable';
import { ContasBancariasForm } from './components/ContasBancariasForm';
import type { ContaBancaria, ContasBancariasState, ContasBancariasActions } from './types';

interface ContasBancariasStatsProps {
  contas: ContaBancaria[];
}

const ContasBancariasStats = memo<ContasBancariasStatsProps>(({ contas }) => {
  const activeCount = contas.filter(c => c.isActive).length;
  const totalBalance = contas.reduce((sum, c) => sum + c.initialBalance, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total de Contas</p>
              <p className="text-2xl font-bold">{contas.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Contas Ativas</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

interface ContasBancariosPresentationProps {
  contas: ContaBancaria[];
  empresas: any[];
  loading: boolean;
  error: any;
  state: Omit<ContasBancariasState, 'contas' | 'loading' | 'error'>;
  isUpdating: boolean;
  isDeleting: boolean;
  actions: ContasBancariasActions;
}

export const ContasBancariasPresentation = memo<ContasBancariosPresentationProps>(({
  contas,
  empresas,
  loading,
  error,
  state,
  isUpdating,
  isDeleting,
  actions
}) => {
  if (loading) {
    return <LoadingSpinner message="Carregando contas bancárias..." />;
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
          <h1 className="text-3xl font-bold">Contas Bancárias</h1>
          <p className="text-muted-foreground">
            Gerencie as contas bancárias das suas empresas
          </p>
        </div>
        <Button onClick={actions.handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Stats */}
      <ContasBancariasStats contas={contas} />

      {/* Filters */}
      <ContasBancariasFilters
        searchTerm={state.searchTerm}
        filterActive={state.filterActive}
        filterBank={state.filterBank}
        onSearchChange={actions.updateSearch}
        onActiveFilterChange={actions.updateFilter}
        onBankFilterChange={actions.updateBankFilter}
        onRefresh={actions.refreshData}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas ({contas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ContasBancariasTable
            contas={contas}
            deletingId={state.deletingId}
            onEdit={actions.handleEdit}
            onDelete={actions.handleDelete}
            isDeleting={isDeleting}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ContasBancariasForm
        open={state.showForm}
        isEditing={!!state.editingId}
        formData={state.formData}
        empresas={empresas}
        isUpdating={isUpdating}
        onSave={actions.handleSave}
        onCancel={actions.handleCancel}
        onFieldChange={actions.updateFormField}
      />
    </div>
  );
});
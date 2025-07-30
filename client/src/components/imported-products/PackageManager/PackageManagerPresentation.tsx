/**
 * PRESENTATION: PackageManagerPresentation
 * Pure UI component for package management functionality
 * Extracted from PackageManager.tsx (654 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Package, Plus, AlertTriangle, Box } from 'lucide-react';
import { PackageForm } from './components/PackageForm';
import { PackageCard } from './components/PackageCard';
import type { PackageManagerState, PackageManagerActions } from './types';

interface PackageManagerPresentationProps {
  state: PackageManagerState;
  actions: PackageManagerActions;
  productId: string;
}

export const PackageManagerPresentation = memo<PackageManagerPresentationProps>(({
  state,
  actions,
  productId
}) => {
  if (state.loading && state.packages.length === 0) {
    return <LoadingSpinner message="Carregando embalagens..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestão de Embalagens
          </h3>
          <p className="text-muted-foreground">
            Configure as embalagens e dimensões do produto
          </p>
        </div>
        <Button onClick={actions.startCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Embalagem
        </Button>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-red-600">{state.error}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(state.showAddForm || state.editingId) && (
        <PackageForm
          formData={state.formData}
          onUpdateField={actions.updateFormField}
          onSave={state.editingId ? actions.updatePackage : actions.createPackage}
          onCancel={actions.cancelForm}
          isEditing={!!state.editingId}
          loading={state.loading}
        />
      )}

      {/* Packages Grid */}
      {state.packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={actions.startEditing}
              onDelete={actions.deletePackage}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma embalagem configurada</h3>
            <p className="text-muted-foreground mb-4">
              Configure as embalagens do produto para controle de dimensões e peso.
            </p>
            <Button onClick={actions.startCreating}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Embalagem
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={state.showDeleteModal} onOpenChange={actions.cancelForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Tem certeza que deseja excluir a embalagem #{state.packageToDelete?.packageNumber}?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={actions.cancelForm}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={actions.confirmDelete}
                disabled={state.loading}
              >
                {state.loading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
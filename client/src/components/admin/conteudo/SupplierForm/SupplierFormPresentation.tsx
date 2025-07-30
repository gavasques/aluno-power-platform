/**
 * PRESENTATION: SupplierFormPresentation
 * Pure UI component for supplier form functionality
 * Extracted from SupplierForm.tsx (640 lines) for modularization
 */
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { BasicInfoForm } from './components/BasicInfoForm';
import type { SupplierFormState, SupplierFormActions } from './types';

interface SupplierFormPresentationProps {
  state: SupplierFormState;
  actions: SupplierFormActions;
  onCancel?: () => void;
}

export const SupplierFormPresentation = memo<SupplierFormPresentationProps>(({
  state,
  actions,
  onCancel
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {state.isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-muted-foreground">
            {state.isEditing ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      {/* Form */}
      <BasicInfoForm
        formData={state.formData}
        onFieldChange={actions.updateField}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={state.loading}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        )}
        <Button onClick={actions.handleSubmit} disabled={state.loading}>
          {state.loading ? (
            <ButtonLoader>Salvando...</ButtonLoader>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {state.isEditing ? 'Atualizar' : 'Criar'} Fornecedor
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
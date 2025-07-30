/**
 * PRESENTATION: SupplierInfoPresentation
 * Pure UI component for supplier information display functionality
 * Extracted from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React, { memo } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BasicInfoSection } from './components/BasicInfoSection';
import { ContactInfoSection } from './components/ContactInfoSection';
import { EDITABLE_SECTIONS, type SupplierInfoDisplayState, type SupplierInfoDisplayActions } from './types';

interface SupplierInfoPresentationProps {
  state: SupplierInfoDisplayState;
  actions: SupplierInfoDisplayActions;
  isUpdating: boolean;
}

export const SupplierInfoPresentation = memo<SupplierInfoPresentationProps>(({
  state,
  actions,
  isUpdating
}) => {
  if (state.loading) {
    return <LoadingSpinner message="Carregando informações do fornecedor..." />;
  }

  if (state.error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Erro ao carregar dados: {state.error}
        </div>
      </div>
    );
  }

  if (!state.supplier) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Fornecedor não encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{state.supplier.tradeName}</h2>
          <p className="text-muted-foreground">
            Informações detalhadas do fornecedor
          </p>
        </div>
      </div>

      {/* Basic Info Section */}
      <BasicInfoSection
        supplier={state.supplier}
        isEditing={state.editingSection === EDITABLE_SECTIONS.BASIC}
        formData={state.formData}
        onStartEditing={() => actions.startEditing(EDITABLE_SECTIONS.BASIC)}
        onCancelEditing={actions.cancelEditing}
        onSaveChanges={actions.saveChanges}
        onFieldChange={actions.updateFormField}
        isUpdating={isUpdating}
      />

      {/* Contact Info Section */}
      <ContactInfoSection
        supplier={state.supplier}
        isEditing={state.editingSection === EDITABLE_SECTIONS.CONTACT}
        formData={state.formData}
        onStartEditing={() => actions.startEditing(EDITABLE_SECTIONS.CONTACT)}
        onCancelEditing={actions.cancelEditing}
        onSaveChanges={actions.saveChanges}
        onFieldChange={actions.updateFormField}
        isUpdating={isUpdating}
      />

      {/* Commercial Terms Section - Placeholder */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Termos Comerciais</h3>
        <p className="text-muted-foreground">Seção em desenvolvimento...</p>
      </div>

      {/* Banking Info Section - Placeholder */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Dados Bancários</h3>
        <p className="text-muted-foreground">Seção em desenvolvimento...</p>
      </div>
    </div>
  );
});
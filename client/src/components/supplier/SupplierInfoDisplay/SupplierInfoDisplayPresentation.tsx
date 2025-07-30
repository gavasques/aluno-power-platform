/**
 * PRESENTATION: SupplierInfoDisplayPresentation
 * Pure UI component for supplier information display and editing
 * Extracted from SupplierInfoDisplay.tsx (675 lines) for modularization
 */
import React, { memo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { AddressSection } from './components/AddressSection';
import { CommercialSection } from './components/CommercialSection';
import { DescriptionSection } from './components/DescriptionSection';
import type { Supplier, SupplierInfoState, SupplierInfoActions } from './types';

interface SupplierInfoDisplayPresentationProps {
  supplier: Supplier;
  state: SupplierInfoState;
  actions: SupplierInfoActions;
}

export const SupplierInfoDisplayPresentation = memo<SupplierInfoDisplayPresentationProps>(({
  supplier,
  state,
  actions
}) => {
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <BasicInfoSection
        supplier={supplier}
        state={state}
        actions={actions}
      />

      {/* Address Information */}
      <AddressSection
        supplier={supplier}
        state={state}
        actions={actions}
      />

      {/* Commercial Terms */}
      <CommercialSection
        supplier={supplier}
        state={state}
        actions={actions}
      />

      {/* Description and Rating */}
      <DescriptionSection
        supplier={supplier}
        state={state}
        actions={actions}
      />
    </div>
  );
});
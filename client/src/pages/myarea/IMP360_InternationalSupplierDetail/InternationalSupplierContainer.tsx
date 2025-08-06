import React from 'react';
import { useParams } from 'wouter';
import { InternationalSupplierPresentation } from './InternationalSupplierPresentation.tsx';
import { useSupplierData } from './hooks/useSupplierData'; 
import { useSupplierActions } from './hooks/useSupplierActions';
import { useSupplierTabs } from './hooks/useSupplierTabs';
import { useSupplierModals } from './hooks/useSupplierModals';
import { useSupplierFilters } from './hooks/useSupplierFilters';

/**
 * INTERNATIONAL SUPPLIER CONTAINER - FASE 4 REFATORAÇÃO
 * 
 * Container Component seguindo padrão Container/Presentational
 * Responsabilidade única: Orquestrar hooks e gerenciar lógica de negócio
 * 
 * Antes: Lógica misturada no componente de 1.853 linhas
 * Depois: Container limpo focado apenas em coordenação de estado
 */
export function InternationalSupplierContainer() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ID do fornecedor não encontrado
          </h2>
          <p className="text-gray-600">
            Verifique a URL e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  // Inicializar todos os hooks especializados
  const supplierData = useSupplierData(id);
  const supplierActions = useSupplierActions(id);
  const tabsState = useSupplierTabs();
  const modalsState = useSupplierModals();
  const filtersState = useSupplierFilters();

  // Passar todos os props necessários para o componente de apresentação
  return (
    <InternationalSupplierPresentation
      supplierId={id}
      // Data hooks
      supplierData={supplierData}
      supplierActions={supplierActions}
      // UI state hooks
      tabsState={tabsState}
      modalsState={modalsState}
      filtersState={filtersState}
    />
  );
}
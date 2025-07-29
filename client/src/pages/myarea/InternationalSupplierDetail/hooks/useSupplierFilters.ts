import { useState } from 'react';
import type { FilterState, UseSupplierFiltersReturn } from '../types';

/**
 * HOOK DE GERENCIAMENTO DE FILTROS - FASE 4 REFATORAÇÃO
 * 
 * Responsabilidade única: Gerenciar filtros de busca e filtragem
 * Antes: Filtros misturados no componente de 1.853 linhas
 * Depois: Hook centralizado para todos os filtros
 */
export function useSupplierFilters(): UseSupplierFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    contacts: {
      department: '',
      isPrimary: undefined,
      search: ''
    },
    contracts: {
      type: '',
      status: '',
      search: ''
    },
    documents: {
      type: '',
      status: '',
      search: ''
    },
    communications: {
      type: '',
      direction: '',
      search: '',
      dateRange: undefined
    }
  });

  const updateContactsFilter = (filter: Partial<FilterState['contacts']>) => {
    setFilters(prev => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        ...filter
      }
    }));
  };

  const updateContractsFilter = (filter: Partial<FilterState['contracts']>) => {
    setFilters(prev => ({
      ...prev,
      contracts: {
        ...prev.contracts,
        ...filter
      }
    }));
  };

  const updateDocumentsFilter = (filter: Partial<FilterState['documents']>) => {
    setFilters(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        ...filter
      }
    }));
  };

  const updateCommunicationsFilter = (filter: Partial<FilterState['communications']>) => {
    setFilters(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        ...filter
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      contacts: {
        department: '',
        isPrimary: undefined,
        search: ''
      },
      contracts: {
        type: '',
        status: '',
        search: ''
      },
      documents: {
        type: '',
        status: '',
        search: ''
      },
      communications: {
        type: '',
        direction: '',
        search: '',
        dateRange: undefined
      }
    });
  };

  return {
    filters,
    updateContactsFilter,
    updateContractsFilter,
    updateDocumentsFilter,
    updateCommunicationsFilter,
    resetFilters
  };
}
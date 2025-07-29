/**
 * Hook para filtros e busca nos dados do fornecedor
 * Permite filtrar contratos, documentos e comunicações
 */

import { useState, useCallback, useMemo } from 'react';
import type { 
  Contract, 
  SupplierDocument, 
  Communication,
  SupplierFilters,
  UseSupplierFiltersReturn 
} from '../types/supplier.types';

export const useSupplierFilters = (
  contracts: Contract[],
  documents: SupplierDocument[],
  communications: Communication[]
): UseSupplierFiltersReturn => {
  const [filters, setFilters] = useState<SupplierFilters>({});

  const updateFilter = useCallback(<K extends keyof SupplierFilters>(
    key: K, 
    value: SupplierFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (filters.contractStatus && contract.status !== filters.contractStatus) {
        return false;
      }
      
      if (filters.dateRange) {
        const contractDate = new Date(contract.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (contractDate < startDate || contractDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [contracts, filters]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      if (filters.documentCategory && document.category !== filters.documentCategory) {
        return false;
      }
      
      if (filters.dateRange) {
        const documentDate = new Date(document.uploadedAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (documentDate < startDate || documentDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [documents, filters]);

  const filteredCommunications = useMemo(() => {
    return communications.filter(communication => {
      if (filters.communicationType && communication.type !== filters.communicationType) {
        return false;
      }
      
      if (filters.dateRange) {
        const communicationDate = new Date(communication.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (communicationDate < startDate || communicationDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [communications, filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredContracts,
    filteredDocuments,
    filteredCommunications
  };
};
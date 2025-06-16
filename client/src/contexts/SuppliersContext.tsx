import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Supplier as DbSupplier, InsertSupplier } from '@shared/schema';

interface SuppliersContextType {
  suppliers: DbSupplier[];
  loading: boolean;
  error: string | null;
  addSupplier: (supplier: InsertSupplier) => Promise<void>;
  updateSupplier: (id: number, supplier: Partial<InsertSupplier>) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  getSupplierById: (id: number) => DbSupplier | undefined;
  searchSuppliers: (query: string) => DbSupplier[];
  refetch: () => void;
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: suppliers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: () => apiRequest<DbSupplier[]>('/api/suppliers'),
  });

  const addSupplierMutation = useMutation({
    mutationFn: (supplier: InsertSupplier) =>
      apiRequest<DbSupplier>('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplier),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, supplier }: { id: number; supplier: Partial<InsertSupplier> }) =>
      apiRequest<DbSupplier>(`/api/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(supplier),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/suppliers/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
    },
  });

  const addSupplier = async (supplier: InsertSupplier): Promise<void> => {
    await addSupplierMutation.mutateAsync(supplier);
  };

  const updateSupplier = async (id: number, supplier: Partial<InsertSupplier>): Promise<void> => {
    await updateSupplierMutation.mutateAsync({ id, supplier });
  };

  const deleteSupplier = async (id: number): Promise<void> => {
    await deleteSupplierMutation.mutateAsync(id);
  };

  const getSupplierById = (id: number): DbSupplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const searchSuppliers = (query: string): DbSupplier[] => {
    if (!query) return suppliers;
    return suppliers.filter(supplier =>
      supplier.tradeName?.toLowerCase().includes(query.toLowerCase()) ||
      supplier.corporateName?.toLowerCase().includes(query.toLowerCase()) ||
      supplier.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value: SuppliersContextType = {
    suppliers,
    loading,
    error: error?.message || null,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    searchSuppliers,
    refetch,
  };

  return (
    <SuppliersContext.Provider value={value}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SuppliersProvider');
  }
  return context;
}
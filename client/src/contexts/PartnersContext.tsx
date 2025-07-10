import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Partner as DbPartner, InsertPartner } from '@shared/schema';

interface PartnersContextType {
  partners: DbPartner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: InsertPartner) => Promise<void>;
  updatePartner: (id: number, partner: Partial<InsertPartner>) => Promise<void>;
  deletePartner: (id: number) => Promise<void>;
  getPartnerById: (id: number) => DbPartner | undefined;
  searchPartners: (query: string) => DbPartner[];
  refetch: () => void;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: partners = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: () => apiRequest<DbPartner[]>('/api/partners'),
    staleTime: 60 * 60 * 1000, // 1 hour - partners are static data
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
    refetchOnWindowFocus: false, // Don't refetch on focus for static data
    refetchOnMount: false, // Use cache when available
    refetchOnReconnect: false, // Partners don't change on reconnect
    structuralSharing: true, // Optimize re-renders
  });

  const addPartnerMutation = useMutation({
    mutationFn: (partner: InsertPartner) =>
      apiRequest<DbPartner>('/api/partners', {
        method: 'POST',
        body: JSON.stringify(partner),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, partner }: { id: number; partner: Partial<InsertPartner> }) =>
      apiRequest<DbPartner>(`/api/partners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(partner),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/partners/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    },
  });

  const addPartner = async (partner: InsertPartner): Promise<void> => {
    await addPartnerMutation.mutateAsync(partner);
  };

  const updatePartner = async (id: number, partner: Partial<InsertPartner>): Promise<void> => {
    await updatePartnerMutation.mutateAsync({ id, partner });
  };

  const deletePartner = async (id: number): Promise<void> => {
    await deletePartnerMutation.mutateAsync(id);
  };

  const getPartnerById = (id: number): DbPartner | undefined => {
    return partners.find(partner => partner.id === id);
  };

  const searchPartners = (query: string): DbPartner[] => {
    if (!query) return partners;
    return partners.filter(partner =>
      partner.name?.toLowerCase().includes(query.toLowerCase()) ||
      partner.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value: PartnersContextType = {
    partners,
    loading,
    error: error?.message || null,
    addPartner,
    updatePartner,
    deletePartner,
    getPartnerById,
    searchPartners,
    refetch,
  };

  return (
    <PartnersContext.Provider value={value}>
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
}
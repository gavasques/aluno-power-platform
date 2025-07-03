import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { 
  Supplier, 
  SupplierContact, 
  SupplierBrand, 
  SupplierFile,
  SupplierConversation,
  InsertSupplierContact,
  InsertSupplierBrand,
  InsertSupplierConversation
} from '@shared/schema';

export const useSupplierDetail = (supplierId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const supplierQuery = useQuery({
    queryKey: [`/api/suppliers/${supplierId}`],
    queryFn: () => apiRequest<Supplier>(`/api/suppliers/${supplierId}`),
    enabled: !!supplierId,
  });

  const brandQuery = useQuery({
    queryKey: [`/api/suppliers/${supplierId}/brands`],
    queryFn: () => apiRequest<SupplierBrand[]>(`/api/suppliers/${supplierId}/brands`),
    enabled: !!supplierId,
  });

  const contactQuery = useQuery({
    queryKey: [`/api/suppliers/${supplierId}/contacts`],
    queryFn: () => apiRequest<SupplierContact[]>(`/api/suppliers/${supplierId}/contacts`),
    enabled: !!supplierId,
  });

  const conversationQuery = useQuery({
    queryKey: [`/api/suppliers/${supplierId}/conversations`],
    queryFn: () => apiRequest<SupplierConversation[]>(`/api/suppliers/${supplierId}/conversations`),
    enabled: !!supplierId,
  });

  const fileQuery = useQuery({
    queryKey: [`/api/suppliers/${supplierId}/files`],
    queryFn: () => apiRequest<SupplierFile[]>(`/api/suppliers/${supplierId}/files`),
    enabled: !!supplierId,
  });

  // Mutations
  const updateSupplierMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) =>
      apiRequest(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}`] });
      toast({
        title: "Sucesso",
        description: "Informações do fornecedor atualizadas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar informações do fornecedor",
        variant: "destructive",
      });
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: InsertSupplierBrand) =>
      apiRequest(`/api/suppliers/${supplierId}/brands`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/brands`] });
      toast({
        title: "Sucesso",
        description: "Marca adicionada com sucesso",
      });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (data: InsertSupplierContact) =>
      apiRequest(`/api/suppliers/${supplierId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/contacts`] });
      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: InsertSupplierConversation) =>
      apiRequest(`/api/suppliers/${supplierId}/conversations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/conversations`] });
      toast({
        title: "Sucesso",
        description: "Conversa adicionada com sucesso",
      });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId: number) =>
      apiRequest(`/api/supplier-brands/${brandId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/brands`] });
      toast({
        title: "Sucesso",
        description: "Marca removida com sucesso",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) =>
      apiRequest(`/api/supplier-contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplierId}/contacts`] });
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso",
      });
    },
  });

  return {
    // Data
    supplier: supplierQuery.data,
    brands: brandQuery.data || [],
    contacts: contactQuery.data || [],
    conversations: conversationQuery.data || [],
    files: fileQuery.data || [],
    
    // Loading states
    isLoading: supplierQuery.isLoading,
    isBrandsLoading: brandQuery.isLoading,
    isContactsLoading: contactQuery.isLoading,
    isConversationsLoading: conversationQuery.isLoading,
    isFilesLoading: fileQuery.isLoading,
    
    // Mutations
    updateSupplier: updateSupplierMutation.mutateAsync,
    createBrand: createBrandMutation.mutateAsync,
    createContact: createContactMutation.mutateAsync,
    createConversation: createConversationMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
    deleteContact: deleteContactMutation.mutateAsync,
    
    // Mutation states
    isUpdating: updateSupplierMutation.isPending,
    isCreatingBrand: createBrandMutation.isPending,
    isCreatingContact: createContactMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
  };
};
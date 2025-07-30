import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { SupplierInfo, SupplierContact, BankingInfo, SupplierInfoDisplayState } from '../types';

export const useSupplierInfo = (supplierId: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<SupplierInfoDisplayState, 'supplier' | 'contacts' | 'bankingInfo' | 'loading' | 'error'>>({
    editingSection: null,
    formData: {}
  });

  // Fetch supplier info
  const { data: supplier, isLoading: supplierLoading, error: supplierError } = useQuery<SupplierInfo>({
    queryKey: ['/api/suppliers', supplierId],
    queryFn: async () => {
      const response = await apiRequest(`/api/suppliers/${supplierId}`);
      return response.data;
    },
    enabled: !!supplierId
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<SupplierContact[]>({
    queryKey: ['/api/suppliers', supplierId, 'contacts'],
    queryFn: async () => {
      const response = await apiRequest(`/api/suppliers/${supplierId}/contacts`);
      return response.data;
    },
    enabled: !!supplierId
  });

  // Fetch banking info
  const { data: bankingInfo, isLoading: bankingLoading } = useQuery<BankingInfo>({
    queryKey: ['/api/suppliers', supplierId, 'banking'],
    queryFn: async () => {
      const response = await apiRequest(`/api/suppliers/${supplierId}/banking`);
      return response.data;
    },
    enabled: !!supplierId
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string, data: any }) => {
      switch (section) {
        case 'basic':
        case 'contact':
        case 'commercial':
          return apiRequest(`/api/suppliers/${supplierId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        case 'banking':
          return apiRequest(`/api/suppliers/${supplierId}/banking`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        default:
          throw new Error('Seção inválida');
      }
    },
    onSuccess: (_, { section }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId] });
      if (section === 'banking') {
        queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId, 'banking'] });
      }
      setState(prev => ({ ...prev, editingSection: null, formData: {} }));
      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar informações.",
        variant: "destructive",
      });
    },
  });

  const startEditing = useCallback((section: string) => {
    let initialData = {};
    
    switch (section) {
      case 'basic':
        initialData = {
          tradeName: supplier?.tradeName || '',
          corporateName: supplier?.corporateName || '',
          description: supplier?.description || '',
          country: supplier?.country || '',
          category: supplier?.category || ''
        };
        break;
      case 'contact':
        initialData = {
          commercialEmail: supplier?.commercialEmail || '',
          supportEmail: supplier?.supportEmail || '',
          whatsappNumber: supplier?.whatsappNumber || '',
          phone: supplier?.phone || '',
          website: supplier?.website || '',
          linkedin: supplier?.linkedin || '',
          instagram: supplier?.instagram || '',
          youtube: supplier?.youtube || ''
        };
        break;
      case 'commercial':
        initialData = {
          paymentTerms: supplier?.paymentTerms || '',
          minimumOrder: supplier?.minimumOrder || '',
          deliveryTime: supplier?.deliveryTime || '',
          certifications: supplier?.certifications || '',
          internalNotes: supplier?.internalNotes || ''
        };
        break;
      case 'banking':
        initialData = {
          bankName: bankingInfo?.bankName || '',
          accountHolder: bankingInfo?.accountHolder || '',
          accountNumber: bankingInfo?.accountNumber || '',
          routingNumber: bankingInfo?.routingNumber || '',
          swiftCode: bankingInfo?.swiftCode || '',
          address: bankingInfo?.address || ''
        };
        break;
    }

    setState(prev => ({
      ...prev,
      editingSection: section,
      formData: initialData
    }));
  }, [supplier, bankingInfo]);

  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      editingSection: null,
      formData: {}
    }));
  }, []);

  const saveChanges = useCallback(async () => {
    if (!state.editingSection) return;

    await updateMutation.mutateAsync({
      section: state.editingSection,
      data: state.formData
    });
  }, [state.editingSection, state.formData, updateMutation]);

  const updateFormField = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId] });
    queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId, 'contacts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplierId, 'banking'] });
  }, [queryClient, supplierId]);

  return {
    state: {
      ...state,
      supplier: supplier || null,
      contacts,
      bankingInfo: bankingInfo || null,
      loading: supplierLoading || contactsLoading || bankingLoading,
      error: supplierError?.message || null
    },
    actions: {
      startEditing,
      cancelEditing,
      saveChanges,
      updateFormField,
      refreshData
    },
    isUpdating: updateMutation.isPending
  };
};
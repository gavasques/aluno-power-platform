import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Supplier, Department } from '@shared/schema';
import type { SupplierEditState, SupplierFormData } from '../types';

export const useSupplierEdit = (supplier: Supplier) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editState, setEditState] = useState<SupplierEditState>({
    editingBasic: false,
    editingDescription: false,
    editingAdditionalInfo: false,
    editingCommercialTerms: false,
    editingBankingData: false,
  });

  const [formData, setFormData] = useState<SupplierFormData>({
    basic: {
      tradeName: supplier.tradeName || '',
      corporateName: supplier.corporateName || '',
      cnpj: supplier.cnpj || '',
      categoryId: supplier.categoryId || null,
      supplierType: supplier.supplierType || '',
      country: supplier.country || '',
      state: supplier.state || '',
      city: supplier.city || '',
      cep: supplier.cep || '',
      address: supplier.address || '',
      stateRegistration: supplier.stateRegistration || '',
      municipalRegistration: supplier.municipalRegistration || ''
    },
    description: {
      description: supplier.description || ''
    },
    additionalInfo: {
      additionalInfo: supplier.additionalInfo || ''
    },
    commercialTerms: {
      paymentTerm: supplier.paymentTerm || '',
      deliveryTerm: supplier.deliveryTerm || ''
    },
    bankingData: {
      bankingData: supplier.bankingData || ''
    }
  });

  // Load departments for category dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async (updateData: Partial<Supplier>) => {
      return apiRequest(`/api/suppliers/${supplier.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${supplier.id}`] });
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    },
  });

  const setEditingSection = useCallback((section: keyof SupplierEditState, value: boolean) => {
    setEditState(prev => ({ ...prev, [section]: value }));
  }, []);

  const updateFormData = useCallback((section: keyof SupplierFormData, data: any) => {
    setFormData(prev => ({ ...prev, [section]: data }));
  }, []);

  const saveSection = useCallback(async (section: keyof SupplierFormData) => {
    const sectionData = formData[section];
    await updateSupplierMutation.mutateAsync(sectionData);
    setEditingSection(`editing${section.charAt(0).toUpperCase() + section.slice(1)}` as keyof SupplierEditState, false);
  }, [formData, updateSupplierMutation, setEditingSection]);

  return {
    departments,
    editState,
    formData,
    isUpdating: updateSupplierMutation.isPending,
    actions: {
      setEditingSection,
      updateFormData,
      saveSection
    }
  };
};
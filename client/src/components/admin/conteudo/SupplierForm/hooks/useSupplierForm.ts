import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { SupplierFormData, SupplierFormState } from '../types';

const defaultFormData: SupplierFormData = {
  tradeName: '',
  corporateName: '',
  description: '',
  country: '',
  category: '',
  commercialEmail: '',
  whatsappNumber: '',
  phone: '',
  website: '',
  paymentTerms: '',
  minimumOrder: '',
  deliveryTime: '',
  certifications: '',
  qualityRating: 5,
  communicationRating: 5,
  deliveryRating: 5,
  priceRating: 5,
  overallRating: 5,
  internalNotes: '',
  isActive: true,
  isPremium: false,
  isVerified: false
};

export const useSupplierForm = (editingSupplier?: any, onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<SupplierFormState>({
    formData: defaultFormData,
    loading: false,
    error: null,
    isEditing: !!editingSupplier,
    supplierId: editingSupplier?.id || null
  });

  // Set editing data when editingSupplier changes
  useEffect(() => {
    if (editingSupplier) {
      setState(prev => ({
        ...prev,
        formData: {
          tradeName: editingSupplier.tradeName || '',
          corporateName: editingSupplier.corporateName || '',
          description: editingSupplier.description || '',
          country: editingSupplier.country || '',
          category: editingSupplier.category || '',
          commercialEmail: editingSupplier.commercialEmail || '',
          whatsappNumber: editingSupplier.whatsappNumber || '',
          phone: editingSupplier.phone || '',
          website: editingSupplier.website || '',
          paymentTerms: editingSupplier.paymentTerms || '',
          minimumOrder: editingSupplier.minimumOrder || '',
          deliveryTime: editingSupplier.deliveryTime || '',
          certifications: editingSupplier.certifications || '',
          qualityRating: editingSupplier.qualityRating || 5,
          communicationRating: editingSupplier.communicationRating || 5,
          deliveryRating: editingSupplier.deliveryRating || 5,
          priceRating: editingSupplier.priceRating || 5,
          overallRating: editingSupplier.overallRating || 5,
          internalNotes: editingSupplier.internalNotes || '',
          isActive: editingSupplier.isActive !== false,
          isPremium: editingSupplier.isPremium || false,
          isVerified: editingSupplier.isVerified || false
        },
        isEditing: true,
        supplierId: editingSupplier.id
      }));
    }
  }, [editingSupplier]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      // Calculate overall rating as average
      const overallRating = Math.round(
        (data.qualityRating + data.communicationRating + data.deliveryRating + data.priceRating) / 4
      );

      return apiRequest('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify({ ...data, overallRating }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso!",
      });
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, error: error.message }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar fornecedor.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      // Calculate overall rating as average
      const overallRating = Math.round(
        (data.qualityRating + data.communicationRating + data.deliveryRating + data.priceRating) / 4
      );

      return apiRequest(`/api/suppliers/${state.supplierId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, overallRating }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, error: error.message }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    },
  });

  const updateField = useCallback((field: keyof SupplierFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: null
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate required fields
      const { tradeName, commercialEmail, country, category } = state.formData;
      if (!tradeName || !commercialEmail || !country || !category) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      if (state.isEditing) {
        await updateMutation.mutateAsync(state.formData);
      } else {
        await createMutation.mutateAsync(state.formData);
      }

    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.formData, state.isEditing, createMutation, updateMutation]);

  const resetForm = useCallback(() => {
    setState({
      formData: defaultFormData,
      loading: false,
      error: null,
      isEditing: false,
      supplierId: null
    });
  }, []);

  const setEditMode = useCallback((supplier: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        tradeName: supplier.tradeName || '',
        corporateName: supplier.corporateName || '',
        description: supplier.description || '',
        country: supplier.country || '',
        category: supplier.category || '',
        commercialEmail: supplier.commercialEmail || '',
        whatsappNumber: supplier.whatsappNumber || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        paymentTerms: supplier.paymentTerms || '',
        minimumOrder: supplier.minimumOrder || '',
        deliveryTime: supplier.deliveryTime || '',
        certifications: supplier.certifications || '',
        qualityRating: supplier.qualityRating || 5,
        communicationRating: supplier.communicationRating || 5,
        deliveryRating: supplier.deliveryRating || 5,
        priceRating: supplier.priceRating || 5,
        overallRating: supplier.overallRating || 5,
        internalNotes: supplier.internalNotes || '',
        isActive: supplier.isActive !== false,
        isPremium: supplier.isPremium || false,
        isVerified: supplier.isVerified || false
      },
      isEditing: true,
      supplierId: supplier.id,
      error: null
    }));
  }, []);

  return {
    state: {
      ...state,
      loading: state.loading || createMutation.isPending || updateMutation.isPending
    },
    actions: {
      updateField,
      handleSubmit,
      resetForm,
      setEditMode
    }
  };
};
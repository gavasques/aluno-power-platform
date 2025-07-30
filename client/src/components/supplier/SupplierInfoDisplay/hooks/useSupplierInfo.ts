import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Supplier, SupplierInfoState, SupplierSection } from '../types';

export const useSupplierInfo = (supplier: Supplier) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<SupplierInfoState>({
    isEditing: false,
    editingSection: null,
    formData: {},
    hasChanges: false,
    isSubmitting: false,
    error: null
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      return apiRequest(`/api/suppliers/${supplier.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', supplier.id] });
      setState(prev => ({
        ...prev,
        isEditing: false,
        editingSection: null,
        formData: {},
        hasChanges: false,
        isSubmitting: false
      }));
      toast({
        title: "Sucesso",
        description: "Informações do fornecedor atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error.message
      }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    },
  });

  // Start editing a section
  const startEditing = useCallback((section: SupplierSection) => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      editingSection: section,
      formData: { ...supplier },
      error: null
    }));
  }, [supplier]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      editingSection: null,
      formData: {},
      hasChanges: false,
      error: null
    }));
  }, []);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!state.hasChanges) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await updateSupplierMutation.mutateAsync(state.formData);
    } catch (error) {
      // Error handled by mutation
    }
  }, [state.hasChanges, state.formData, updateSupplierMutation]);

  // Update form field
  const updateFormField = useCallback((field: keyof Supplier, value: any) => {
    setState(prev => {
      const newFormData = { ...prev.formData, [field]: value };
      return {
        ...prev,
        formData: newFormData,
        hasChanges: JSON.stringify(newFormData) !== JSON.stringify(supplier)
      };
    });
  }, [supplier]);

  // Update rating
  const updateRating = useCallback((rating: number) => {
    updateFormField('rating', rating);
  }, [updateFormField]);

  // Add tag
  const addTag = useCallback((tag: string) => {
    if (!tag.trim()) return;
    
    const currentTags = state.formData.tags || supplier.tags || [];
    if (!currentTags.includes(tag.trim())) {
      updateFormField('tags', [...currentTags, tag.trim()]);
    }
  }, [state.formData.tags, supplier.tags, updateFormField]);

  // Remove tag
  const removeTag = useCallback((tag: string) => {
    const currentTags = state.formData.tags || supplier.tags || [];
    updateFormField('tags', currentTags.filter(t => t !== tag));
  }, [state.formData.tags, supplier.tags, updateFormField]);

  return {
    state,
    actions: {
      startEditing,
      cancelEditing,
      saveChanges,
      updateFormField,
      updateRating,
      addTag,
      removeTag
    }
  };
};
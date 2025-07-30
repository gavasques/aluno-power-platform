import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { ProductPackage, PackageManagerState } from '../types';

const initialFormData: Partial<ProductPackage> = {
  packageNumber: 1,
  packageType: 'CAIXA',
  contentsDescription: '',
  packageEan: '',
  dimensionsLength: 0,
  dimensionsWidth: 0,
  dimensionsHeight: 0,
  weightGross: 0,
  weightNet: 0,
  unitsInPackage: 1,
  packagingMaterial: '',
  specialHandling: '',
};

export const usePackageManager = (productId: string) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<PackageManagerState>({
    packages: [],
    loading: false,
    showAddForm: false,
    editingId: null,
    showDeleteModal: false,
    packageToDelete: null,
    formData: { ...initialFormData },
    error: null,
  });

  // Calculate volume automatically when dimensions change
  const calculateVolume = useCallback(() => {
    const { dimensionsLength = 0, dimensionsWidth = 0, dimensionsHeight = 0 } = state.formData;
    const volumeCbm = (dimensionsLength * dimensionsWidth * dimensionsHeight) / 1000000; // cm³ to m³
    
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, volumeCbm }
    }));
  }, [state.formData.dimensionsLength, state.formData.dimensionsWidth, state.formData.dimensionsHeight]);

  // Load packages from API
  const loadPackages = useCallback(async () => {
    if (!productId || productId === '') return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/imported-products/${productId}/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar embalagens');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        packages: data.packages || [],
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [productId, token, toast]);

  // Create new package
  const createPackage = useCallback(async () => {
    if (!productId) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/imported-products/${productId}/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar embalagem');
      }

      await loadPackages();
      setState(prev => ({
        ...prev,
        showAddForm: false,
        formData: { ...initialFormData },
        loading: false
      }));

      toast({
        title: "Sucesso",
        description: "Embalagem criada com sucesso!",
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [productId, token, state.formData, loadPackages, toast]);

  // Update existing package
  const updatePackage = useCallback(async () => {
    if (!productId || !state.editingId) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/imported-products/${productId}/packages/${state.editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar embalagem');
      }

      await loadPackages();
      setState(prev => ({
        ...prev,
        editingId: null,
        formData: { ...initialFormData },
        loading: false
      }));

      toast({
        title: "Sucesso",
        description: "Embalagem atualizada com sucesso!",
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [productId, state.editingId, token, state.formData, loadPackages, toast]);

  // Delete package
  const deletePackage = useCallback((pkg: ProductPackage) => {
    setState(prev => ({
      ...prev,
      packageToDelete: pkg,
      showDeleteModal: true
    }));
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!productId || !state.packageToDelete) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/imported-products/${productId}/packages/${state.packageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir embalagem');
      }

      await loadPackages();
      setState(prev => ({
        ...prev,
        showDeleteModal: false,
        packageToDelete: null,
        loading: false
      }));

      toast({
        title: "Sucesso",
        description: "Embalagem excluída com sucesso!",
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [productId, state.packageToDelete, token, loadPackages, toast]);

  // Start editing
  const startEditing = useCallback((pkg: ProductPackage) => {
    setState(prev => ({
      ...prev,
      editingId: pkg.id,
      formData: { ...pkg },
      showAddForm: false
    }));
  }, []);

  // Start creating
  const startCreating = useCallback(() => {
    const nextPackageNumber = state.packages.length > 0 
      ? Math.max(...state.packages.map(p => p.packageNumber)) + 1 
      : 1;

    setState(prev => ({
      ...prev,
      showAddForm: true,
      editingId: null,
      formData: { ...initialFormData, packageNumber: nextPackageNumber }
    }));
  }, [state.packages]);

  // Cancel form
  const cancelForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAddForm: false,
      editingId: null,
      formData: { ...initialFormData },
      showDeleteModal: false,
      packageToDelete: null
    }));
  }, []);

  // Update form field
  const updateFormField = useCallback((field: keyof ProductPackage, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  // Load packages on mount and productId change
  useEffect(() => {
    if (productId && productId !== '') {
      loadPackages();
    }
  }, [productId, loadPackages]);

  // Auto-calculate volume when dimensions change
  useEffect(() => {
    if (state.formData.dimensionsLength || state.formData.dimensionsWidth || state.formData.dimensionsHeight) {
      calculateVolume();
    }
  }, [state.formData.dimensionsLength, state.formData.dimensionsWidth, state.formData.dimensionsHeight, calculateVolume]);

  return {
    state,
    actions: {
      loadPackages,
      createPackage,
      updatePackage,
      deletePackage,
      confirmDelete,
      startEditing,
      startCreating,
      cancelForm,
      updateFormField,
      calculateVolume
    }
  };
};
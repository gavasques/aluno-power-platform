import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { productFormSchema, type ProductFormData, type Product, type ProductEditState } from '../types';

export const useProductEdit = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<ProductEditState>({
    activeTab: 'basic',
    isSubmitting: false,
    hasChanges: false,
    photoFile: null,
    photoPreview: null,
    uploadingPhoto: false,
  });

  // Form setup
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      active: true,
    },
  });

  // Fetch product data
  const { data: product, isLoading: productLoading, error: productError } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await apiRequest('/api/suppliers');
      return response.data;
    },
  });

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await apiRequest('/api/brands');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('/api/categories');
      return response.data;
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      setState(prev => ({ ...prev, hasChanges: false, isSubmitting: false }));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, isSubmitting: false }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto.",
        variant: "destructive",
      });
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      return fetch(`/api/products/${id}/photo`, {
        method: 'POST',
        body: formData,
      }).then(response => response.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      setState(prev => ({
        ...prev,
        uploadingPhoto: false,
        photoFile: null,
        photoPreview: null
      }));
      toast({
        title: "Sucesso",
        description: "Foto do produto atualizada com sucesso!",
      });
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, uploadingPhoto: false }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    },
  });

  // Load product data into form when available
  const loadProductData = useCallback(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        sku: product.sku || '',
        freeCode: product.freeCode || '',
        supplierCode: product.supplierCode || '',
        internalCode: product.internalCode || '',
        ean: product.ean || '',
        brand: product.brand || '',
        category: product.category || '',
        supplierId: product.supplierId,
        ncm: product.ncm || '',
        costItem: product.costItem || 0,
        packCost: product.packCost || 0,
        taxPercent: product.taxPercent || 0,
        weight: product.weight || 0,
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        description: product.description || '',
        bulletPoints: product.bulletPoints || '',
        observations: product.observations || '',
        active: product.active ?? true,
      });
    }
  }, [product, form]);

  // Actions
  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handlePhotoUpload = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
      uploadingPhoto: true
    }));
    uploadPhotoMutation.mutate(file);
  }, [uploadPhotoMutation]);

  const removePhoto = useCallback(() => {
    setState(prev => ({
      ...prev,
      photoFile: null,
      photoPreview: null
    }));
  }, []);

  const submitForm = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    const formData = form.getValues();
    await updateProductMutation.mutateAsync(formData);
  }, [form, updateProductMutation]);

  const goBack = useCallback(() => {
    setLocation('/myarea/products');
  }, [setLocation]);

  // Track form changes
  const watchedValues = form.watch();
  const hasChanges = form.formState.isDirty;

  // Load product data when available
  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  return {
    // State
    state: {
      ...state,
      hasChanges,
    },
    
    // Data
    product,
    suppliers,
    brands,
    categories,
    
    // Loading states
    productLoading,
    productError,
    
    // Form
    form,
    
    // Actions
    actions: {
      setActiveTab,
      handlePhotoUpload,
      removePhoto,
      submitForm,
      goBack,
    },
  };
};
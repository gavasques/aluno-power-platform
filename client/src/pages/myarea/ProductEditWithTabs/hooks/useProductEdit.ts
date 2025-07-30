import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { productFormSchema, type ProductFormData, type Product, type ProductEditState } from '../types';

export const useProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<ProductEditState>({
    photoFile: null,
    photoPreview: null,
    activeTab: 'basic'
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      freeCode: '',
      supplierCode: '',
      internalCode: '',
      ean: '',
      brand: '',
      category: '',
      supplierId: undefined,
      ncm: '',
      costItem: 0,
      packCost: 0,
      taxPercent: 0,
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      description: '',
      bulletPoints: '',
      observations: '',
      active: true,
    },
  });

  // Load product data
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await apiRequest(`/api/products/${id}`) as { data: Product };
      return response.data;
    },
    enabled: !!id,
  });

  // Load suppliers for dropdown
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 60000,
  });

  // Update form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku || '',
        freeCode: product.freeCode || '',
        supplierCode: product.supplierCode || '',
        internalCode: product.internalCode || '',
        ean: product.ean || '',
        brand: product.brand || '',
        category: product.category || '',
        supplierId: product.supplierId,
        ncm: product.ncm || '',
        costItem: product.costItem,
        packCost: product.packCost,
        taxPercent: product.taxPercent,
        weight: product.weight,
        dimensions: product.dimensions || {
          length: undefined,
          width: undefined,
          height: undefined,
        },
        description: product.description || '',
        bulletPoints: product.bulletPoints || '',
        observations: product.observations || '',
        active: product.active,
      });

      if (product.photo) {
        setState(prev => ({ ...prev, photoPreview: product.photo || null }));
      }
    }
  }, [product, form]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updateData: ProductFormData) => {
      const formData = new FormData();
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dimensions' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (state.photoFile) {
        formData.append('photo', state.photoFile);
      }

      return apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', id] });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = useCallback((file: File | null) => {
    setState(prev => ({
      ...prev,
      photoFile: file,
      photoPreview: file ? URL.createObjectURL(file) : null
    }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const onSave = useCallback(async (data: ProductFormData) => {
    await updateProductMutation.mutateAsync(data);
  }, [updateProductMutation]);

  const onNavigateBack = useCallback(() => {
    setLocation('/myarea/products');
  }, [setLocation]);

  return {
    form,
    product,
    suppliers,
    state,
    isLoading,
    error,
    isUpdating: updateProductMutation.isPending,
    actions: {
      handlePhotoChange,
      setActiveTab,
      onSave,
      onNavigateBack
    }
  };
};
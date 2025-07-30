import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { ProductFormData, ProductEditState } from '../types';

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  category: '',
  brand: '',
  model: '',
  sku: '',
  costPrice: 0,
  sellingPrice: 0,
  discountPrice: 0,
  profitMargin: 0,
  stock: 0,
  minimumStock: 0,
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  tags: [],
  isActive: true,
  isFeatured: false,
  metaTitle: '',
  metaDescription: '',
  mainImage: '',
  additionalImages: []
};

export const useProductEdit = (productId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<Omit<ProductEditState, 'suppliers' | 'categories'>>({
    formData: defaultFormData,
    loading: false,
    saving: false,
    error: null,
    activeTab: 'basic',
    isDirty: false
  });

  // Fetch product data for editing
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await apiRequest(`/api/products/${productId}`);
      return response.data;
    },
    enabled: !!productId
  });

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await apiRequest('/api/suppliers');
      return response.data;
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('/api/categories');
      return response.data;
    }
  });

  // Load product data when available
  useEffect(() => {
    if (product) {
      setState(prev => ({
        ...prev,
        formData: {
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          brand: product.brand || '',
          model: product.model || '',
          sku: product.sku || '',
          costPrice: product.costPrice || 0,
          sellingPrice: product.sellingPrice || 0,
          discountPrice: product.discountPrice || 0,
          profitMargin: product.profitMargin || 0,
          stock: product.stock || 0,
          minimumStock: product.minimumStock || 0,
          weight: product.weight || 0,
          length: product.length || 0,
          width: product.width || 0,
          height: product.height || 0,
          tags: product.tags || [],
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured || false,
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          mainImage: product.mainImage || '',
          additionalImages: product.additionalImages || []
        },
        isDirty: false
      }));
    }
  }, [product]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (productId) {
        return apiRequest(`/api/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setState(prev => ({ ...prev, isDirty: false }));
      toast({
        title: "Sucesso",
        description: productId ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
      });
    },
    onError: (error: any) => {
      setState(prev => ({ ...prev, error: error.message }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto.",
        variant: "destructive",
      });
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      return response.data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    },
  });

  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      isDirty: true,
      error: null
    }));

    // Auto-calculate profit margin when prices change
    if (field === 'costPrice' || field === 'sellingPrice') {
      setState(prev => {
        const cost = field === 'costPrice' ? value : prev.formData.costPrice;
        const selling = field === 'sellingPrice' ? value : prev.formData.sellingPrice;
        const margin = cost > 0 ? ((selling - cost) / cost) * 100 : 0;
        
        return {
          ...prev,
          formData: { ...prev.formData, profitMargin: Math.round(margin * 100) / 100 }
        };
      });
    }
  }, []);

  const updateArrayField = useCallback((field: 'tags' | 'additionalImages', value: string[]) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      isDirty: true
    }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const saveProduct = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      await saveMutation.mutateAsync(state.formData);
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  }, [state.formData, saveMutation]);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: product ? {
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        brand: product.brand || '',
        model: product.model || '',
        sku: product.sku || '',
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        discountPrice: product.discountPrice || 0,
        profitMargin: product.profitMargin || 0,
        stock: product.stock || 0,
        minimumStock: product.minimumStock || 0,
        weight: product.weight || 0,
        length: product.length || 0,
        width: product.width || 0,
        height: product.height || 0,
        tags: product.tags || [],
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured || false,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        mainImage: product.mainImage || '',
        additionalImages: product.additionalImages || []
      } : defaultFormData,
      isDirty: false,
      error: null
    }));
  }, [product]);

  const uploadImage = useCallback(async (file: File, isMain = false): Promise<string> => {
    const imageUrl = await uploadImageMutation.mutateAsync(file);
    
    if (isMain) {
      updateField('mainImage', imageUrl);
    } else {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          additionalImages: [...prev.formData.additionalImages, imageUrl]
        },
        isDirty: true
      }));
    }
    
    return imageUrl;
  }, [updateField, uploadImageMutation]);

  const removeImage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        additionalImages: prev.formData.additionalImages.filter((_, i) => i !== index)
      },
      isDirty: true
    }));
  }, []);

  return {
    state: {
      ...state,
      loading: productLoading,
      suppliers,
      categories
    },
    actions: {
      updateField,
      updateArrayField,
      setActiveTab,
      saveProduct,
      resetForm,
      uploadImage,
      removeImage
    }
  };
};
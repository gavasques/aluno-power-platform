/**
 * HOOK: useProductBasicData
 * Gerencia estado e operações de dados básicos de produtos
 * Extraído de ProductBasicDataTab.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ProductBasicDataState, 
  UseProductBasicDataReturn,
  Product,
  ProductBasicDataFormData,
  ProductCategory,
  Brand,
  PreviewImage,
  ValidationError
} from '../types';

export const useProductBasicData = (productId?: number): UseProductBasicDataReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<ProductBasicDataState>({
    product: null,
    isLoading: false,
    isSaving: false,
    isUploadingImages: false,
    categories: [],
    brands: [],
    selectedCategory: null,
    selectedSubcategory: null,
    selectedBrand: null,
    formData: {
      name: '',
      description: '',
      categoryId: 0,
      subcategoryId: undefined,
      brandId: undefined,
      model: '',
      sku: '',
      barcode: '',
      status: 'draft',
      price: 0,
      costPrice: undefined,
      weight: undefined,
      dimensions: undefined,
      tags: [],
      attributes: []
    },
    errors: {},
    isDirty: false,
    validationErrors: [],
    uploadProgress: 0,
    previewImages: []
  });

  // ===== QUERIES =====
  const productQuery = useQuery({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
    staleTime: 30 * 1000,
    select: (data) => data || null
  });

  const categoriesQuery = useQuery({
    queryKey: ['/api/departments'],
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  const brandsQuery = useQuery({
    queryKey: ['/api/brands'],
    staleTime: 60 * 1000,
    select: (data) => data || []
  });

  // ===== MUTATIONS =====
  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductBasicDataFormData): Promise<Product> => {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: productId ? 'Produto atualizado' : 'Produto criado',
        description: `${data.name} foi ${productId ? 'atualizado' : 'criado'} com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setState(prev => ({ 
        ...prev, 
        product: data, 
        isDirty: false,
        errors: {},
        validationErrors: []
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar produto',
        description: error.message,
        variant: 'destructive'
      });
      if (error.validationErrors) {
        setState(prev => ({ 
          ...prev, 
          validationErrors: error.validationErrors,
          errors: error.fieldErrors || {}
        }));
      }
    }
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async (files: File[]): Promise<{ images: string[] }> => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
        formData.append(`alts`, `Image ${index + 1}`);
      });
      
      if (productId) {
        formData.append('productId', productId.toString());
      }

      const response = await fetch('/api/products/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Imagens enviadas',
        description: `${data.images.length} imagem(ns) enviada(s) com sucesso.`
      });
      setState(prev => ({
        ...prev,
        previewImages: [
          ...prev.previewImages,
          ...data.images.map((url, index) => ({
            url,
            alt: `Image ${prev.previewImages.length + index + 1}`,
            isMain: prev.previewImages.length === 0 && index === 0,
            order: prev.previewImages.length + index,
            isUploading: false
          }))
        ],
        uploadProgress: 0,
        isUploadingImages: false
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
      setState(prev => ({ 
        ...prev, 
        isUploadingImages: false, 
        uploadProgress: 0 
      }));
    }
  });

  const checkSKUMutation = useMutation({
    mutationFn: async (sku: string): Promise<{ available: boolean; suggestions?: string[] }> => {
      return apiRequest('/api/products/check-sku', {
        method: 'POST',
        body: JSON.stringify({ sku, excludeProductId: productId })
      });
    }
  });

  // ===== COMPUTED VALUES =====
  const categoryTree = useMemo(() => {
    const categories = categoriesQuery.data || [];
    const tree: ProductCategory[] = [];
    const categoryMap = new Map<number, ProductCategory>();

    // First pass: create map
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children!.push(category);
        }
      } else {
        tree.push(category);
      }
    });

    return tree;
  }, [categoriesQuery.data]);

  const isFormValid = useMemo(() => {
    const { name, sku, price, categoryId } = state.formData;
    return name.length >= 3 && 
           sku.length >= 3 && 
           price > 0 && 
           categoryId > 0 &&
           state.validationErrors.length === 0;
  }, [state.formData, state.validationErrors]);

  // ===== VALIDATION =====
  const validateField = useCallback((field: keyof ProductBasicDataFormData, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value || value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
        if (value.length > 200) return 'Nome deve ter no máximo 200 caracteres';
        break;
      case 'sku':
        if (!value || value.length < 3) return 'SKU deve ter pelo menos 3 caracteres';
        if (!/^[A-Z0-9\-\.]{3,20}$/.test(value)) return 'SKU deve conter apenas letras maiúsculas, números, hífen e ponto';
        break;
      case 'price':
        if (!value || value <= 0) return 'Preço deve ser maior que zero';
        if (value > 999999.99) return 'Preço deve ser menor que R$ 999.999,99';
        break;
      case 'categoryId':
        if (!value || value <= 0) return 'Categoria é obrigatória';
        break;
      case 'weight':
        if (value && (value <= 0 || value > 9999.999)) return 'Peso deve estar entre 0,001 e 9999,999 kg';
        break;
      default:
        break;
    }
    return null;
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const validationErrors: ValidationError[] = [];

    Object.keys(state.formData).forEach(key => {
      const field = key as keyof ProductBasicDataFormData;
      const value = state.formData[field];
      const error = validateField(field, value);
      
      if (error) {
        errors[field] = error;
        validationErrors.push({
          field,
          message: error,
          type: 'invalid'
        });
      }
    });

    setState(prev => ({ ...prev, errors, validationErrors }));
    return Object.keys(errors).length === 0;
  }, [state.formData, validateField]);

  // ===== ACTIONS =====
  const updateField = useCallback((field: keyof ProductBasicDataFormData, value: any) => {
    setState(prev => {
      const newFormData = { ...prev.formData, [field]: value };
      const fieldError = validateField(field, value);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }

      return {
        ...prev,
        formData: newFormData,
        errors: newErrors,
        isDirty: true,
        validationErrors: prev.validationErrors.filter(err => err.field !== field)
      };
    });
  }, [validateField]);

  const updateAttribute = useCallback((attributeId: number, value: any) => {
    setState(prev => {
      const attributes = [...prev.formData.attributes];
      const existingIndex = attributes.findIndex(attr => attr.attributeId === attributeId);
      
      if (existingIndex >= 0) {
        attributes[existingIndex] = { attributeId, value };
      } else {
        attributes.push({ attributeId, value });
      }

      return {
        ...prev,
        formData: { ...prev.formData, attributes },
        isDirty: true
      };
    });
  }, []);

  const addTag = useCallback((tag: string) => {
    setState(prev => {
      const tags = [...prev.formData.tags];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
      return {
        ...prev,
        formData: { ...prev.formData, tags },
        isDirty: true
      };
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        tags: prev.formData.tags.filter(t => t !== tag)
      },
      isDirty: true
    }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, tags },
      isDirty: true
    }));
  }, []);

  const selectCategory = useCallback((category: ProductCategory) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubcategory: null,
      formData: { 
        ...prev.formData, 
        categoryId: category.id,
        subcategoryId: undefined
      },
      isDirty: true
    }));
  }, []);

  const selectSubcategory = useCallback((subcategory: ProductCategory) => {
    setState(prev => ({
      ...prev,
      selectedSubcategory: subcategory,
      formData: { ...prev.formData, subcategoryId: subcategory.id },
      isDirty: true
    }));
  }, []);

  const selectBrand = useCallback((brand: Brand) => {
    setState(prev => ({
      ...prev,
      selectedBrand: brand,
      formData: { ...prev.formData, brandId: brand.id },
      isDirty: true
    }));
  }, []);

  const uploadImages = useCallback(async (files: File[]): Promise<void> => {
    setState(prev => ({ ...prev, isUploadingImages: true, uploadProgress: 0 }));
    
    // Create preview images immediately
    const previewImages: PreviewImage[] = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      alt: `Image ${index + 1}`,
      isMain: state.previewImages.length === 0 && index === 0,
      order: state.previewImages.length + index,
      isUploading: true
    }));

    setState(prev => ({
      ...prev,
      previewImages: [...prev.previewImages, ...previewImages]
    }));

    return uploadImagesMutation.mutateAsync(files);
  }, [uploadImagesMutation, state.previewImages.length]);

  const removeImage = useCallback((imageId: number) => {
    setState(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, index) => index !== imageId),
      isDirty: true
    }));
  }, []);

  const setMainImage = useCallback((imageId: number) => {
    setState(prev => ({
      ...prev,
      previewImages: prev.previewImages.map((img, index) => ({
        ...img,
        isMain: index === imageId
      })),
      isDirty: true
    }));
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const images = [...prev.previewImages];
      const [removed] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, removed);
      
      return {
        ...prev,
        previewImages: images.map((img, index) => ({ ...img, order: index })),
        isDirty: true
      };
    });
  }, []);

  const generateSKU = useCallback((): string => {
    const category = state.selectedCategory;
    const brand = state.selectedBrand;
    const timestamp = Date.now().toString().slice(-6);
    
    let sku = '';
    
    if (category) {
      sku += category.name.substring(0, 3).toUpperCase();
    }
    
    if (brand) {
      sku += '-' + brand.name.substring(0, 3).toUpperCase();
    }
    
    sku += '-' + timestamp;
    
    return sku;
  }, [state.selectedCategory, state.selectedBrand]);

  const checkSKUAvailability = useCallback(async (sku: string): Promise<boolean> => {
    try {
      const result = await checkSKUMutation.mutateAsync(sku);
      return result.available;
    } catch (error) {
      return false;
    }
  }, [checkSKUMutation]);

  const save = useCallback(async (): Promise<Product> => {
    if (!validate()) {
      throw new Error('Dados inválidos');
    }
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const result = await saveProductMutation.mutateAsync(state.formData);
      return result;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [validate, saveProductMutation, state.formData]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: {
        name: '',
        description: '',
        categoryId: 0,
        subcategoryId: undefined,
        brandId: undefined,
        model: '',
        sku: '',
        barcode: '',
        status: 'draft',
        price: 0,
        costPrice: undefined,
        weight: undefined,
        dimensions: undefined,
        tags: [],
        attributes: []
      },
      errors: {},
      isDirty: false,
      validationErrors: [],
      previewImages: [],
      selectedCategory: null,
      selectedSubcategory: null,
      selectedBrand: null
    }));
  }, []);

  const loadProduct = useCallback((product: Product) => {
    const category = categoriesQuery.data?.find(c => c.id === product.category);
    const brand = brandsQuery.data?.find(b => b.id === parseInt(product.brand || '0'));
    
    setState(prev => ({
      ...prev,
      product,
      formData: {
        name: product.name,
        description: product.description || '',
        categoryId: parseInt(product.category) || 0,
        subcategoryId: product.subcategory ? parseInt(product.subcategory) : undefined,
        brandId: product.brand ? parseInt(product.brand) : undefined,
        model: product.model || '',
        sku: product.sku,
        barcode: product.barcode || '',
        status: product.status,
        price: product.price,
        costPrice: product.costPrice,
        weight: product.weight,
        dimensions: product.dimensions,
        tags: product.tags || [],
        attributes: product.attributes?.map(attr => ({
          attributeId: attr.id,
          value: attr.value
        })) || []
      },
      previewImages: product.images?.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        isMain: img.isMain,
        order: img.order
      })) || [],
      selectedCategory: category || null,
      selectedBrand: brand || null,
      isDirty: false,
      errors: {},
      validationErrors: []
    }));
  }, [categoriesQuery.data, brandsQuery.data]);

  const duplicateProduct = useCallback(async (): Promise<Product> => {
    if (!state.product) throw new Error('Nenhum produto para duplicar');
    
    const duplicateData: ProductBasicDataFormData = {
      ...state.formData,
      name: `${state.formData.name} (Cópia)`,
      sku: generateSKU()
    };
    
    return saveProductMutation.mutateAsync(duplicateData);
  }, [state.product, state.formData, generateSKU, saveProductMutation]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (productQuery.data && !state.product) {
      loadProduct(productQuery.data);
    }
  }, [productQuery.data, state.product, loadProduct]);

  return {
    state,
    product: {
      data: productQuery.data || null,
      isLoading: productQuery.isLoading,
      error: productQuery.error?.message || null,
      refetch: productQuery.refetch
    },
    categories: {
      data: categoriesQuery.data || [],
      isLoading: categoriesQuery.isLoading,
      error: categoriesQuery.error?.message || null,
      tree: categoryTree
    },
    brands: {
      data: brandsQuery.data || [],
      isLoading: brandsQuery.isLoading,
      error: brandsQuery.error?.message || null
    },
    form: {
      data: state.formData,
      errors: state.errors,
      isDirty: state.isDirty,
      isValid: isFormValid,
      validationErrors: state.validationErrors
    },
    actions: {
      updateField,
      updateAttribute,
      addTag,
      removeTag,
      setTags,
      selectCategory,
      selectSubcategory,
      selectBrand,
      uploadImages,
      removeImage,
      setMainImage,
      reorderImages,
      validate,
      save,
      reset,
      loadProduct,
      generateSKU,
      checkSKUAvailability,
      duplicateProduct
    },
    images: {
      previews: state.previewImages,
      isUploading: state.isUploadingImages,
      progress: state.uploadProgress,
      errors: [] // TODO: implement image validation errors
    }
  };
};
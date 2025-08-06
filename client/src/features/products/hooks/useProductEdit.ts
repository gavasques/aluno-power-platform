/**
 * HOOK: useProductEdit
 * Gerencia estado e operações de edição de produtos
 * Extraído de ProductEdit.tsx para modularização
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ProductEditState,
  UseProductEditReturn,
  Product,
  Supplier,
  Brand,
  Category,
  ProductFormData,
  ProductValidationErrors,
  ProductDimensions,
  validateProductForm,
  validateProductPhoto,
  PRODUCT_FORM_DEFAULTS,
  PRODUCT_PHOTO_CONFIG
} from '../types/productEdit';

export const useProductEdit = (
  productId: string,
  onSuccess?: (product: Product) => void,
  onCancel?: () => void
): UseProductEditReturn => {
  // ===== EXTERNAL HOOKS =====
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [state, setState] = useState<ProductEditState>({
    // Data
    product: null,
    suppliers: [],
    brands: [],
    categories: [],
    
    // Loading states
    isLoading: false,
    isSaving: false,
    isLoadingSuppliers: false,
    isLoadingBrands: false,
    isLoadingCategories: false,
    
    // Form state
    formData: { ...PRODUCT_FORM_DEFAULTS },
    originalData: null,
    isDirty: false,
    
    // File handling
    photoFile: null,
    photoPreview: null,
    
    // Validation
    errors: {},
    validationErrors: [],
    
    // UI state
    activeTab: 'basic',
    showUnsavedChangesDialog: false,
    isSubmitting: false
  });

  // ===== QUERIES =====
  const productQuery = useQuery({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onSuccess: (product: Product) => {
      setState(prev => ({
        ...prev,
        product,
        formData: {
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
        },
        originalData: {
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
        },
        photoPreview: product.photo || null
      }));
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar produto',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const suppliersQuery = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data || [],
    onSuccess: (data) => {
      setState(prev => ({ ...prev, suppliers: data }));
    }
  });

  const brandsQuery = useQuery({
    queryKey: ['/api/brands'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data || [],
    onSuccess: (data) => {
      setState(prev => ({ ...prev, brands: data }));
    }
  });

  const categoriesQuery = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => data || [],
    onSuccess: (data) => {
      setState(prev => ({ ...prev, categories: data }));
    }
  });

  // ===== MUTATIONS =====
  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      setState(prev => ({ ...prev, isSaving: true, isSubmitting: true }));
      
      const formData = new FormData();
      
      // Add all form fields with proper naming
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'dimensions') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'supplierId' && value !== undefined) {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add photo if selected
      if (state.photoFile) {
        formData.append('photo', state.photoFile);
      }

      return apiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });
    },
    onSuccess: (updatedProduct) => {
      setState(prev => ({ 
        ...prev, 
        product: updatedProduct,
        originalData: { ...prev.formData },
        isDirty: false,
        photoFile: null
      }));
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: 'Produto atualizado',
        description: 'O produto foi atualizado com sucesso.',
      });
      
      if (onSuccess) {
        onSuccess(updatedProduct);
      } else {
        setLocation('/produtos-novo');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setState(prev => ({ ...prev, isSaving: false, isSubmitting: false }));
    }
  });

  // ===== COMPUTED VALUES =====
  const hasChanges = useMemo(() => {
    if (!state.originalData) return false;
    
    return JSON.stringify(state.formData) !== JSON.stringify(state.originalData) || 
           state.photoFile !== null;
  }, [state.formData, state.originalData, state.photoFile]);

  // Update isDirty when hasChanges changes
  useEffect(() => {
    setState(prev => ({ ...prev, isDirty: hasChanges }));
  }, [hasChanges]);

  // ===== SIDE EFFECTS =====
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: productQuery.isLoading }));
  }, [productQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingSuppliers: suppliersQuery.isLoading }));
  }, [suppliersQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingBrands: brandsQuery.isLoading }));
  }, [brandsQuery.isLoading]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoadingCategories: categoriesQuery.isLoading }));
  }, [categoriesQuery.isLoading]);

  // ===== ACTIONS =====
  const actions = {
    // Form actions
    updateFormData: useCallback((field: keyof ProductFormData, value: any) => {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value
        },
        // Clear field-specific error when user starts typing
        errors: {
          ...prev.errors,
          [field]: undefined
        }
      }));
    }, []),

    updateDimensions: useCallback((dimensions: Partial<ProductDimensions>) => {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          dimensions: {
            ...prev.formData.dimensions,
            ...dimensions
          }
        },
        errors: {
          ...prev.errors,
          dimensions: undefined
        }
      }));
    }, []),

    resetForm: useCallback(() => {
      if (state.originalData) {
        setState(prev => ({
          ...prev,
          formData: { ...prev.originalData! },
          photoFile: null,
          photoPreview: prev.product?.photo || null,
          errors: {},
          validationErrors: []
        }));
      }
    }, [state.originalData]),

    submitForm: useCallback(async () => {
      // Validate form
      const errors = validateProductForm(state.formData);
      
      if (Object.keys(errors).length > 0) {
        setState(prev => ({ ...prev, errors }));
        
        // Show first error in toast
        const firstErrorField = Object.keys(errors)[0];
        const firstError = errors[firstErrorField as keyof ProductValidationErrors];
        
        toast({
          title: 'Dados inválidos',
          description: typeof firstError === 'string' ? firstError : 'Verifique os campos obrigatórios',
          variant: 'destructive'
        });
        
        return;
      }
      
      // Validate photo if present
      if (state.photoFile) {
        const photoError = validateProductPhoto(state.photoFile);
        if (photoError) {
          setState(prev => ({ 
            ...prev, 
            errors: { ...prev.errors, photo: photoError }
          }));
          
          toast({
            title: 'Erro na imagem',
            description: photoError,
            variant: 'destructive'
          });
          
          return;
        }
      }
      
      // Clear errors and submit
      setState(prev => ({ ...prev, errors: {}, validationErrors: [] }));
      await updateMutation.mutateAsync(state.formData);
    }, [state.formData, state.photoFile, updateMutation, toast]),

    // File actions
    handlePhotoSelect: useCallback((file: File) => {
      const error = validateProductPhoto(file);
      
      if (error) {
        setState(prev => ({ 
          ...prev, 
          errors: { ...prev.errors, photo: error }
        }));
        
        toast({
          title: 'Erro na imagem',
          description: error,
          variant: 'destructive'
        });
        
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          photoFile: file,
          photoPreview: e.target?.result as string,
          errors: { ...prev.errors, photo: undefined }
        }));
      };
      reader.readAsDataURL(file);
    }, [toast]),

    removePhoto: useCallback(() => {
      setState(prev => ({
        ...prev,
        photoFile: null,
        photoPreview: null,
        errors: { ...prev.errors, photo: undefined }
      }));
    }, []),

    // Navigation and UI
    setActiveTab: useCallback((tab: string) => {
      setState(prev => ({ ...prev, activeTab: tab }));
    }, []),

    showUnsavedDialog: useCallback(() => {
      setState(prev => ({ ...prev, showUnsavedChangesDialog: true }));
    }, []),

    hideUnsavedDialog: useCallback(() => {
      setState(prev => ({ ...prev, showUnsavedChangesDialog: false }));
    }, []),

    navigateBack: useCallback(() => {
      if (hasChanges) {
        setState(prev => ({ ...prev, showUnsavedChangesDialog: true }));
      } else {
        if (onCancel) {
          onCancel();
        } else {
          setLocation('/produtos-novo');
        }
      }
    }, [hasChanges, onCancel, setLocation]),

    // Validation
    validateForm: useCallback((): boolean => {
      const errors = validateProductForm(state.formData);
      setState(prev => ({ ...prev, errors }));
      return Object.keys(errors).length === 0;
    }, [state.formData]),

    validateField: useCallback((field: keyof ProductFormData, value: any): string | null => {
      const tempData = { ...state.formData, [field]: value };
      const errors = validateProductForm(tempData);
      return errors[field] as string || null;
    }, [state.formData]),

    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {}, validationErrors: [] }));
    }, []),

    // Data refresh
    refreshSuppliers: useCallback(() => {
      suppliersQuery.refetch();
    }, [suppliersQuery]),

    refreshBrands: useCallback(() => {
      brandsQuery.refetch();
    }, [brandsQuery]),

    refreshCategories: useCallback(() => {
      categoriesQuery.refetch();
    }, [categoriesQuery])
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    // Formatting
    formatCurrency: useCallback((value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }, []),

    formatWeight: useCallback((value: number): string => {
      return `${value.toFixed(3)} kg`;
    }, []),

    formatDimensions: useCallback((dimensions: ProductDimensions): string => {
      const { length, width, height } = dimensions;
      if (!length && !width && !height) return 'Não informado';
      
      const parts = [];
      if (length) parts.push(`${length}cm`);
      if (width) parts.push(`${width}cm`);
      if (height) parts.push(`${height}cm`);
      
      return parts.join(' × ') || 'Não informado';
    }, []),

    formatPercentage: useCallback((value: number): string => {
      return `${value.toFixed(2)}%`;
    }, []),

    // Validation helpers
    isValidEAN: useCallback((ean: string): boolean => {
      if (!ean) return true; // Optional field
      return /^[0-9]{8}$|^[0-9]{13}$|^[0-9]{14}$/.test(ean);
    }, []),

    isValidNCM: useCallback((ncm: string): boolean => {
      if (!ncm) return true; // Optional field
      return /^[0-9]{8}$/.test(ncm);
    }, []),

    isValidSKU: useCallback((sku: string): boolean => {
      if (!sku) return true; // Optional field
      return /^[A-Za-z0-9-_]+$/.test(sku) && sku.length <= 100;
    }, []),

    // File helpers
    getFileSize: useCallback((file: File): string => {
      const bytes = file.size;
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []),

    isValidImageType: useCallback((file: File): boolean => {
      return PRODUCT_PHOTO_CONFIG.allowedTypes.includes(file.type);
    }, []),

    createImagePreview: useCallback((file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
      });
    }, []),

    // Form helpers
    hasChanges: useCallback((): boolean => {
      return hasChanges;
    }, [hasChanges]),

    getChangedFields: useCallback((): string[] => {
      if (!state.originalData) return [];
      
      const changedFields: string[] = [];
      
      Object.keys(state.formData).forEach(key => {
        const currentValue = state.formData[key as keyof ProductFormData];
        const originalValue = state.originalData![key as keyof ProductFormData];
        
        if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
          changedFields.push(key);
        }
      });
      
      if (state.photoFile) {
        changedFields.push('photo');
      }
      
      return changedFields;
    }, [state.formData, state.originalData, state.photoFile]),

    calculateVolume: useCallback((dimensions: ProductDimensions): number => {
      const { length, width, height } = dimensions;
      if (!length || !width || !height) return 0;
      return (length * width * height) / 1000000; // Convert to cubic meters
    }, []),

    // Product helpers
    getProductDisplayName: useCallback((product: Product): string => {
      return product.name || 'Produto sem nome';
    }, []),

    getProductStatus: useCallback((product: Product): 'active' | 'inactive' => {
      return product.active ? 'active' : 'inactive';
    }, []),

    getSupplierName: useCallback((supplierId: number): string => {
      const supplier = state.suppliers.find(s => s.id === supplierId);
      return supplier?.tradeName || 'Fornecedor não encontrado';
    }, [state.suppliers]),

    getBrandName: useCallback((brandId: string): string => {
      const brand = state.brands.find(b => b.id.toString() === brandId);
      return brand?.name || 'Marca não encontrada';
    }, [state.brands]),

    getCategoryName: useCallback((categoryId: string): string => {
      const category = state.categories.find(c => c.id.toString() === categoryId);
      return category?.name || 'Categoria não encontrada';
    }, [state.categories])
  };

  // ===== RETURN OBJECT =====
  return {
    state,
    productData: {
      data: state.product,
      isLoading: productQuery.isLoading,
      error: productQuery.error?.message || null,
      refetch: productQuery.refetch
    },
    suppliersData: {
      data: state.suppliers,
      isLoading: suppliersQuery.isLoading,
      error: suppliersQuery.error?.message || null
    },
    brandsData: {
      data: state.brands,
      isLoading: brandsQuery.isLoading,
      error: brandsQuery.error?.message || null
    },
    categoriesData: {
      data: state.categories,
      isLoading: categoriesQuery.isLoading,
      error: categoriesQuery.error?.message || null
    },
    actions,
    utils
  };
};
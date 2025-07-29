/**
 * HOOK: useImportedProductForm
 * Gerencia estado e operações do formulário de produtos importados
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  ImportedProductFormData, 
  ImportedProductState, 
  UseImportedProductFormReturn,
  ImportedProductErrors,
  ValidationResults,
  ProductVariation,
  FORM_STEPS,
  VALIDATION_MESSAGES
} from '../types';
import { useProductSteps } from './useProductSteps';
import { useProductValidation } from './useProductValidation';
import { useProductImages } from './useProductImages';

// ===== VALIDATION SCHEMA =====
const importedProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  cost: z.number().min(0, 'Custo deve ser positivo'),
  sellingPrice: z.number().min(0, 'Preço deve ser positivo'),
  weight: z.number().min(0, 'Peso deve ser positivo'),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0)
  }),
  images: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
  specifications: z.record(z.string()).optional(),
  variations: z.array(z.any()).optional(),
  inventory: z.object({
    quantity: z.number().int().min(0),
    minStock: z.number().int().min(0),
    maxStock: z.number().int().min(0),
    location: z.string().optional()
  }),
  shipping: z.object({
    freeShipping: z.boolean().default(false),
    shippingCost: z.number().min(0).optional(),
    estimatedDelivery: z.number().int().min(1).optional(),
    restrictions: z.array(z.string()).optional()
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }),
  compliance: z.object({
    certifications: z.array(z.string()).optional(),
    documents: z.array(z.any()).optional(),
    regulations: z.array(z.string()).optional()
  })
});

export const useImportedProductForm = (
  productId?: string,
  mode: 'create' | 'edit' | 'duplicate' = 'create'
): UseImportedProductFormReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // ===== INTERNAL HOOKS =====
  const steps = useProductSteps();
  const validation = useProductValidation();
  const images = useProductImages();

  // ===== FORM SETUP =====
  const form = useForm<ImportedProductFormData>({
    resolver: zodResolver(importedProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      supplier: '',
      cost: 0,
      sellingPrice: 0,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      images: [],
      tags: [],
      status: 'draft',
      specifications: {},
      variations: [],
      inventory: {
        quantity: 0,
        minStock: 0,
        maxStock: 0,
        location: ''
      },
      shipping: {
        freeShipping: false,
        shippingCost: 0,
        estimatedDelivery: 1,
        restrictions: []
      },
      seo: {
        title: '',
        description: '',
        keywords: []
      },
      compliance: {
        certifications: [],
        documents: [],
        regulations: []
      }
    }
  });

  // ===== STATE =====
  const [state, setState] = useState<ImportedProductState>({
    formData: form.getValues(),
    isLoading: false,
    isSaving: false,
    isDirty: false,
    currentStep: 1,
    totalSteps: FORM_STEPS.length,
    errors: {},
    validationResults: {
      isValid: false,
      completeness: 0,
      score: 0,
      suggestions: [],
      warnings: [],
      criticalIssues: []
    },
    previewMode: false,
    autoSave: true
  });

  // ===== MUTATIONS =====
  const saveProductMutation = useMutation({
    mutationFn: async (data: { product: ImportedProductFormData; isDraft: boolean }) => {
      const response = await fetch('/api/imported-products', {
        method: productId && mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data.product,
          id: productId && mode === 'edit' ? productId : undefined,
          isDraft: data.isDraft
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar produto');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Produto salvo com sucesso",
        description: `Produto ${data.isDraft ? 'salvo como rascunho' : 'publicado'} com sucesso.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['imported-products'] });
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }));
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isSaving: false }));
    }
  });

  const loadProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/imported-products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar produto');
      }

      return response.json();
    },
    onSuccess: (data) => {
      form.reset(data.product);
      setState(prev => ({ ...prev, formData: data.product, isLoading: false }));
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao carregar produto",
        description: error.message,
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  });

  // ===== FORM ACTIONS =====
  const updateField = useCallback((field: keyof ImportedProductFormData, value: any) => {
    form.setValue(field, value);
    const formData = form.getValues();
    setState(prev => ({ 
      ...prev, 
      formData, 
      isDirty: true 
    }));
    
    // Clear field error when value changes
    validation.clearFieldError(field as string);
  }, [form, validation]);

  const updateNestedField = useCallback((path: string, value: any) => {
    const fields = path.split('.');
    const currentData = form.getValues();
    
    // Update nested field
    let target = currentData as any;
    for (let i = 0; i < fields.length - 1; i++) {
      target = target[fields[i]];
    }
    target[fields[fields.length - 1]] = value;
    
    form.reset(currentData);
    setState(prev => ({ 
      ...prev, 
      formData: currentData, 
      isDirty: true 
    }));
  }, [form]);

  const addVariation = useCallback((variation: ProductVariation) => {
    const currentVariations = form.getValues('variations') || [];
    const newVariations = [...currentVariations, variation];
    updateField('variations', newVariations);
  }, [updateField, form]);

  const updateVariation = useCallback((index: number, variation: ProductVariation) => {
    const currentVariations = form.getValues('variations') || [];
    const newVariations = [...currentVariations];
    newVariations[index] = variation;
    updateField('variations', newVariations);
  }, [updateField, form]);

  const removeVariation = useCallback((index: number) => {
    const currentVariations = form.getValues('variations') || [];
    const newVariations = currentVariations.filter((_, i) => i !== index);
    updateField('variations', newVariations);
  }, [updateField, form]);

  const addImage = useCallback((file: File, variationIndex?: number) => {
    if (variationIndex !== undefined) {
      // Add to variation
      const variations = form.getValues('variations') || [];
      if (variations[variationIndex]) {
        const variationImages = variations[variationIndex].images || [];
        variations[variationIndex].images = [...variationImages, file];
        updateField('variations', variations);
      }
    } else {
      // Add to main product
      images.addImages([file]);
      updateField('images', images.images);
    }
  }, [form, images, updateField]);

  const removeImage = useCallback((index: number, variationIndex?: number) => {
    if (variationIndex !== undefined) {
      // Remove from variation
      const variations = form.getValues('variations') || [];
      if (variations[variationIndex]) {
        const variationImages = variations[variationIndex].images || [];
        variations[variationIndex].images = variationImages.filter((_, i) => i !== index);
        updateField('variations', variations);
      }
    } else {
      // Remove from main product
      images.removeImage(index);
      updateField('images', images.images);
    }
  }, [form, images, updateField]);

  const addTag = useCallback((tag: string) => {
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tag)) {
      updateField('tags', [...currentTags, tag]);
    }
  }, [form, updateField]);

  const removeTag = useCallback((index: number) => {
    const currentTags = form.getValues('tags') || [];
    const newTags = currentTags.filter((_, i) => i !== index);
    updateField('tags', newTags);
  }, [form, updateField]);

  const updateSpecification = useCallback((key: string, value: string) => {
    const currentSpecs = form.getValues('specifications') || {};
    updateField('specifications', { ...currentSpecs, [key]: value });
  }, [form, updateField]);

  const removeSpecification = useCallback((key: string) => {
    const currentSpecs = form.getValues('specifications') || {};
    const newSpecs = { ...currentSpecs };
    delete newSpecs[key];
    updateField('specifications', newSpecs);
  }, [form, updateField]);

  const validateForm = useCallback(async (): Promise<ValidationResults> => {
    const formData = form.getValues();
    return validation.validateForm();
  }, [form, validation]);

  const saveProduct = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const formData = form.getValues();
      const validationResults = await validateForm();
      
      if (!validationResults.isValid) {
        toast({
          title: "Formulário inválido",
          description: "Corrija os erros antes de salvar.",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isSaving: false }));
        return false;
      }
      
      await saveProductMutation.mutateAsync({ product: formData, isDraft: false });
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      return false;
    }
  }, [form, validateForm, saveProductMutation, toast]);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const formData = form.getValues();
      await saveProductMutation.mutateAsync({ product: formData, isDraft: true });
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      return false;
    }
  }, [form, saveProductMutation]);

  const resetForm = useCallback(() => {
    form.reset();
    validation.clearErrors();
    images.addImages([]);
    steps.goToStep(1);
    setState(prev => ({ 
      ...prev, 
      formData: form.getValues(),
      isDirty: false,
      currentStep: 1 
    }));
  }, [form, validation, images, steps]);

  const loadProduct = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    await loadProductMutation.mutateAsync(id);
  }, [loadProductMutation]);

  const duplicateProduct = useCallback(() => {
    const formData = form.getValues();
    const duplicatedData = {
      ...formData,
      name: `${formData.name} (Cópia)`,
      sku: `${formData.sku}-copy-${Date.now()}`,
      status: 'draft' as const
    };
    form.reset(duplicatedData);
    setState(prev => ({ 
      ...prev, 
      formData: duplicatedData, 
      isDirty: true 
    }));
  }, [form]);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, previewMode: !prev.previewMode }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setState(prev => ({ ...prev, autoSave: !prev.autoSave }));
  }, []);

  // ===== NAVIGATION ACTIONS =====
  const nextStep = useCallback(() => {
    if (steps.canGoNext) {
      steps.nextStep();
      setState(prev => ({ ...prev, currentStep: steps.currentStep + 1 }));
    }
  }, [steps]);

  const previousStep = useCallback(() => {
    if (steps.canGoPrevious) {
      steps.previousStep();
      setState(prev => ({ ...prev, currentStep: steps.currentStep - 1 }));
    }
  }, [steps]);

  const goToStep = useCallback((step: number) => {
    steps.goToStep(step);
    setState(prev => ({ ...prev, currentStep: step }));
  }, [steps]);

  // ===== AUTO SAVE EFFECT =====
  useEffect(() => {
    if (state.autoSave && state.isDirty) {
      const autoSaveTimer = setTimeout(() => {
        saveDraft();
      }, 30000); // Auto save after 30 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.autoSave, state.isDirty, saveDraft]);

  // ===== LOAD PRODUCT ON MOUNT =====
  useEffect(() => {
    if (productId && mode === 'edit') {
      loadProduct(productId);
    } else if (productId && mode === 'duplicate') {
      loadProduct(productId).then(() => {
        duplicateProduct();
      });
    }
  }, [productId, mode, loadProduct, duplicateProduct]);

  return {
    state: {
      ...state,
      currentStep: steps.currentStep,
      totalSteps: steps.totalSteps
    },
    actions: {
      updateField,
      updateNestedField,
      addVariation,
      updateVariation,
      removeVariation,
      addImage,
      removeImage,
      addTag,
      removeTag,
      updateSpecification,
      removeSpecification,
      validateForm,
      saveProduct,
      saveDraft,
      resetForm,
      loadProduct,
      duplicateProduct,
      togglePreview,
      toggleAutoSave,
      nextStep,
      previousStep,
      goToStep
    },
    validation: {
      errors: validation.errors,
      results: validation.results,
      isValid: validation.isValid,
      validateField: validation.validateField,
      clearErrors: validation.clearErrors,
      clearFieldError: validation.clearFieldError
    },
    navigation: {
      currentStep: steps.currentStep,
      totalSteps: steps.totalSteps,
      canGoNext: steps.canGoNext,
      canGoPrevious: steps.canGoPrevious,
      stepTitles: FORM_STEPS.map(step => step.title),
      completedSteps: []
    }
  };
};
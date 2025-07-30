/**
 * Hooks personalizados para AdvancedInfographicGenerator
 * Separando lógica de negócio da UI
 */

import { useReducer, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useQuery } from '@tanstack/react-query';

import { infographicReducer, initialInfographicState } from './reducer';
import type { ProductData } from './types';

export const useInfographicGenerator = () => {
  const [state, dispatch] = useReducer(infographicReducer, initialInfographicState);
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  const FEATURE_CODE = 'agents.infographic_generator';

  // Fetch categories for dropdown - memoized
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Memoized departments options
  const departmentOptions = useMemo(() => 
    departments.map(dept => ({ value: dept.name, label: dept.name })),
    [departments]
  );

  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('token') || 
           localStorage.getItem('authToken') || '';
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 25MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        dispatch({ 
          type: 'SET_UPLOAD', 
          payload: { file, preview } 
        });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  // Remove uploaded image
  const removeImage = useCallback(() => {
    dispatch({ 
      type: 'SET_UPLOAD', 
      payload: { file: null, preview: null } 
    });
  }, []);

  // Update form field
  const updateFormField = useCallback((field: keyof typeof state.form, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', field, value });
  }, []);

  // Analyze product and generate concepts
  const analyzeProduct = useCallback(async (productData: ProductData) => {
    // Check credits first
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    toast({
      title: "Analisando produto...",
      description: "Aguarde, estamos analisando os dados e a foto do produto com IA"
    });
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));
      
      if (state.upload.file) {
        formData.append('productImage', state.upload.file);
      }

      const response = await fetch('/api/agents/analyze-product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar produto');
      }

      const result = await response.json();
      
      if (result.success) {
        dispatch({ 
          type: 'UPDATE_SESSION', 
          payload: { 
            analysisId: result.data.analysisId,
            concepts: result.data.concepts,
            productData 
          } 
        });
        dispatch({ type: 'ADVANCE_STEP', payload: 'concepts' });
        
        toast({
          title: "Análise concluída!",
          description: `${result.data.concepts.length} conceitos foram gerados para seu produto`
        });
      } else {
        throw new Error(result.error || 'Erro na análise do produto');
      }

    } catch (error: any) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.upload.file, checkCredits, showInsufficientCreditsToast, getAuthToken, toast]);

  // Reset to initial state
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  // Memoized actions to prevent re-renders
  const actions = useMemo(() => ({
    handleImageUpload,
    removeImage,
    updateFormField,
    analyzeProduct,
    resetForm,
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setShowProcessingModal: (show: boolean) => dispatch({ type: 'SET_SHOW_PROCESSING_MODAL', payload: show }),
    advanceStep: (step: typeof state.session.step) => dispatch({ type: 'ADVANCE_STEP', payload: step }),
  }), [handleImageUpload, removeImage, updateFormField, analyzeProduct, resetForm]);

  return {
    state,
    departments,
    departmentOptions,
    actions
  };
};
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { AdvancedInfographicState, ProductInfo, ConceptInfo } from '../types';

const initialProductInfo: ProductInfo = {
  productName: '',
  category: '',
  description: '',
  targetAudience: '',
  keyFeatures: [],
  price: '',
  benefits: []
};

const initialConceptInfo: ConceptInfo = {
  title: '',
  description: '',
  style: '',
  colorScheme: '',
  layout: '',
  elements: []
};

export const useAdvancedInfographic = () => {
  const { toast } = useToast();

  const [state, setState] = useState<AdvancedInfographicState>({
    currentStep: 'product',
    productInfo: initialProductInfo,
    conceptInfo: initialConceptInfo,
    generatedContent: null,
    generatedImageUrl: null,
    loading: false,
    error: null,
    progress: 0
  });

  // Generation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { productInfo: ProductInfo; conceptInfo: ConceptInfo }) => {
      return apiRequest('/api/agents/advanced-infographic/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      setState(prev => ({
        ...prev,
        generatedContent: response.data?.content || null,
        generatedImageUrl: response.data?.imageUrl || null,
        currentStep: 'preview',
        loading: false,
        progress: 100
      }));
      toast({
        title: "Sucesso!",
        description: "Infográfico gerado com sucesso!",
      });
    },
    onError: (error: any) => {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        progress: 0
      }));
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar infográfico.",
        variant: "destructive",
      });
    },
  });

  const updateProductInfo = useCallback((field: keyof ProductInfo, value: any) => {
    setState(prev => ({
      ...prev,
      productInfo: { ...prev.productInfo, [field]: value },
      error: null
    }));
  }, []);

  const updateConceptInfo = useCallback((field: keyof ConceptInfo, value: any) => {
    setState(prev => ({
      ...prev,
      conceptInfo: { ...prev.conceptInfo, [field]: value },
      error: null
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const steps: AdvancedInfographicState['currentStep'][] = ['product', 'concept', 'generation', 'preview'];
      const currentIndex = steps.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      return { ...prev, currentStep: steps[nextIndex], error: null };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => {
      const steps: AdvancedInfographicState['currentStep'][] = ['product', 'concept', 'generation', 'preview'];
      const currentIndex = steps.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, currentStep: steps[prevIndex], error: null };
    });
  }, []);

  const goToStep = useCallback((step: AdvancedInfographicState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const generateInfographic = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: 0,
      currentStep: 'generation'
    }));

    // Simulate progress
    const progressInterval = setInterval(() => {
      setState(prev => {
        if (prev.progress < 90) {
          return { ...prev, progress: prev.progress + 10 };
        }
        return prev;
      });
    }, 500);

    try {
      await generateMutation.mutateAsync({
        productInfo: state.productInfo,
        conceptInfo: state.conceptInfo
      });
    } finally {
      clearInterval(progressInterval);
    }
  }, [state.productInfo, state.conceptInfo, generateMutation]);

  const downloadInfographic = useCallback(() => {
    if (!state.generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = state.generatedImageUrl;
    link.download = `infografico-${state.productInfo.productName || 'produto'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "O infográfico está sendo baixado.",
    });
  }, [state.generatedImageUrl, state.productInfo.productName, toast]);

  const resetGenerator = useCallback(() => {
    setState({
      currentStep: 'product',
      productInfo: initialProductInfo,
      conceptInfo: initialConceptInfo,
      generatedContent: null,
      generatedImageUrl: null,
      loading: false,
      error: null,
      progress: 0
    });
  }, []);

  return {
    state,
    actions: {
      updateProductInfo,
      updateConceptInfo,
      nextStep,
      previousStep,
      goToStep,
      generateInfographic,
      downloadInfographic,
      resetGenerator
    },
    isGenerating: generateMutation.isPending
  };
};
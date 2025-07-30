import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InfographicFormData, InfographicGeneratorState, InfographicData } from '../types';

const defaultFormData: InfographicFormData = {
  productName: '',
  category: '',
  keyFeatures: '',
  benefits: '',
  targetAudience: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#F59E0B',
  layout: 'vertical',
  style: 'modern'
};

export const useInfographicGenerator = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<InfographicGeneratorState>({
    formData: defaultFormData,
    loading: false,
    error: null,
    generatedImageUrl: null,
    showPreview: false,
    step: 'form'
  });

  const updateFormField = useCallback((field: keyof InfographicFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, []);

  const generateInfographic = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, step: 'generating' }));

      // Validate form data
      const { productName, category, keyFeatures, benefits, targetAudience } = state.formData;
      if (!productName || !category || !keyFeatures || !benefits || !targetAudience) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Prepare data for API
      const infographicData: InfographicData = {
        productName: state.formData.productName,
        category: state.formData.category,
        keyFeatures: state.formData.keyFeatures.split('\n').filter(f => f.trim()),
        benefits: state.formData.benefits.split('\n').filter(b => b.trim()),
        targetAudience: state.formData.targetAudience,
        brandColors: {
          primary: state.formData.primaryColor,
          secondary: state.formData.secondaryColor,
          accent: state.formData.accentColor
        },
        layout: state.formData.layout as 'vertical' | 'horizontal' | 'grid',
        style: state.formData.style as 'modern' | 'minimalist' | 'bold' | 'professional'
      };

      const response = await apiRequest('/api/agents/infographic-generator', {
        method: 'POST',
        body: JSON.stringify(infographicData)
      });

      if (response.success && response.data?.imageUrl) {
        setState(prev => ({
          ...prev,
          loading: false,
          generatedImageUrl: response.data.imageUrl,
          step: 'preview',
          showPreview: true
        }));

        toast({
          title: "Sucesso",
          description: "Infográfico gerado com sucesso!",
        });
      } else {
        throw new Error(response.message || 'Erro ao gerar infográfico');
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        step: 'form'
      }));

      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar infográfico.",
        variant: "destructive",
      });
    }
  }, [state.formData, toast]);

  const downloadImage = useCallback(() => {
    if (state.generatedImageUrl) {
      const link = document.createElement('a');
      link.href = state.generatedImageUrl;
      link.download = `infografico-${state.formData.productName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: "O infográfico está sendo baixado.",
      });
    }
  }, [state.generatedImageUrl, state.formData.productName, toast]);

  const resetForm = useCallback(() => {
    setState({
      formData: defaultFormData,
      loading: false,
      error: null,
      generatedImageUrl: null,
      showPreview: false,
      step: 'form'
    });
  }, []);

  const goToStep = useCallback((step: 'form' | 'generating' | 'preview') => {
    setState(prev => ({ ...prev, step }));
  }, []);

  return {
    state,
    actions: {
      updateFormField,
      generateInfographic,
      downloadImage,
      resetForm,
      goToStep
    }
  };
};
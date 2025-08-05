import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { apiRequest } from '@/lib/queryClient';
import type { InfographicSession, InfographicState, ProductData, ConceptData } from '../types';

const FEATURE_CODE = 'agents.advanced_infographic';

export const useInfographicGenerator = () => {
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  const [state, setState] = useState<InfographicState>({
    session: { step: 'input' },
    loading: false,
    uploadedImage: null,
    imagePreview: null,
    showProcessingModal: false,
    formData: {
      productName: '',
      description: '',
      category: '',
      targetAudience: ''
    }
  });

  // Fetch categories for dropdown
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments'],
    enabled: true
  });

  const updateState = useCallback((updater: (prev: InfographicState) => InfographicState) => {
    setState(updater);
  }, []);

  const updateFormField = useCallback((field: keyof InfographicState['formData'], value: string) => {
    updateState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
    }));
  }, [updateState]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateState(prev => ({
        ...prev,
        uploadedImage: file,
        imagePreview: reader.result as string,
        session: { ...prev.session, imageFile: file }
      }));
    };
    reader.readAsDataURL(file);
  }, [toast, updateState]);

  const handleFormSubmit = useCallback(async () => {
    const { productName, description, category, targetAudience } = state.formData;
    
    if (!productName || !description || !category || !targetAudience) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!state.uploadedImage) {
      toast({
        title: "Imagem necessária",
        description: "Faça upload de uma imagem do produto.",
        variant: "destructive",
      });
      return;
    }

    if (!checkCredits(FEATURE_CODE)) {
      showInsufficientCreditsToast();
      return;
    }

    updateState(prev => ({ ...prev, loading: true }));

    try {
      const productData: ProductData = {
        name: productName,
        description,
        category,
        targetAudience,
        effortLevel: 'high'
      };

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));
      formData.append('image', state.uploadedImage);

      const response = await apiRequest('/api/agents/infographic/analyze', {
        method: 'POST',
        body: formData
      });

      updateState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          step: 'concepts',
          productData,
          analysisId: response.analysisId,
          concepts: response.concepts || []
        },
        loading: false
      }));

      await logAIGeneration(FEATURE_CODE, 'concept_analysis', 50);

    } catch (error: any) {
      toast({
        title: "Erro na análise",
        description: error.message || "Erro ao analisar o produto.",
        variant: "destructive",
      });
      updateState(prev => ({ ...prev, loading: false }));
    }
  }, [state.formData, state.uploadedImage, checkCredits, showInsufficientCreditsToast, logAIGeneration, toast, updateState]);

  const handleConceptSelect = useCallback((conceptId: string) => {
    updateState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        selectedConceptId: conceptId,
        step: 'prompt'
      }
    }));
  }, [updateState]);

  const generateInfographic = useCallback(async () => {
    if (!state.session.selectedConceptId || !state.session.analysisId) return;

    if (!checkCredits(FEATURE_CODE)) {
      showInsufficientCreditsToast();
      return;
    }

    updateState(prev => ({
      ...prev,
      loading: true,
      session: { ...prev.session, step: 'generating' },
      showProcessingModal: true
    }));

    try {
      const response = await apiRequest('/api/agents/infographic/generate', {
        method: 'POST',
        body: JSON.stringify({
          analysisId: state.session.analysisId,
          conceptId: state.session.selectedConceptId
        })
      });

      updateState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          step: 'completed',
          generationId: response.generationId,
          finalImageUrl: response.imageUrl
        },
        loading: false,
        showProcessingModal: false
      }));

      await logAIGeneration(FEATURE_CODE, 'infographic_generation', 100);

      toast({
        title: "Sucesso!",
        description: "Infográfico gerado com sucesso!",
      });

    } catch (error: any) {
      toast({
        title: "Erro na geração",
        description: error.message || "Erro ao gerar infográfico.",
        variant: "destructive",
      });
      updateState(prev => ({
        ...prev,
        loading: false,
        showProcessingModal: false,
        session: { ...prev.session, step: 'prompt' }
      }));
    }
  }, [state.session, checkCredits, showInsufficientCreditsToast, logAIGeneration, toast, updateState]);

  const downloadImage = useCallback(() => {
    if (!state.session.finalImageUrl) return;

    const link = document.createElement('a');
    link.href = state.session.finalImageUrl;
    link.download = `infografico-${state.formData.productName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.session.finalImageUrl, state.formData.productName]);

  const resetSession = useCallback(() => {
    updateState(prev => ({
      ...prev,
      session: { step: 'input' },
      uploadedImage: null,
      imagePreview: null,
      showProcessingModal: false,
      formData: {
        productName: '',
        description: '',
        category: '',
        targetAudience: ''
      }
    }));
  }, [updateState]);

  return {
    state,
    departments,
    actions: {
      handleImageUpload,
      handleFormSubmit,
      handleConceptSelect,
      generateInfographic,
      resetSession,
      updateFormField,
      downloadImage
    }
  };
};
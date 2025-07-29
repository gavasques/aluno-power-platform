/**
 * HOOK: useProductSteps
 * Gerencia navegação entre etapas do formulário
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { Package, DollarSign, Ruler, ImageIcon, Warehouse, Palette, Truck, Search, Shield, Eye } from 'lucide-react';
import { UseProductStepsReturn, StepData, FORM_STEPS } from '../types';

export const useProductSteps = (): UseProductStepsReturn => {
  // ===== STATE =====
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // ===== STEP CONFIGURATION =====
  const stepData: StepData[] = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Nome, categoria, marca e descrição',
      icon: <Package className="h-5 w-5" />,
      isCompleted: completedSteps.includes(1),
      isActive: currentStep === 1,
      canNavigate: true,
      requiredFields: ['name', 'sku', 'category'],
      validationRules: []
    },
    {
      id: 2,
      title: 'Precificação',
      description: 'Custos, preços e margens',
      icon: <DollarSign className="h-5 w-5" />,
      isCompleted: completedSteps.includes(2),
      isActive: currentStep === 2,
      canNavigate: completedSteps.includes(1),
      requiredFields: ['cost', 'sellingPrice'],
      validationRules: []
    },
    {
      id: 3,
      title: 'Especificações',
      description: 'Dimensões, peso e características',
      icon: <Ruler className="h-5 w-5" />,
      isCompleted: completedSteps.includes(3),
      isActive: currentStep === 3,
      canNavigate: completedSteps.includes(2),
      requiredFields: ['weight', 'dimensions'],
      validationRules: []
    },
    {
      id: 4,
      title: 'Imagens',
      description: 'Fotos e mídia do produto',
      icon: <ImageIcon className="h-5 w-5" />,
      isCompleted: completedSteps.includes(4),
      isActive: currentStep === 4,
      canNavigate: completedSteps.includes(3),
      requiredFields: ['images'],
      validationRules: []
    },
    {
      id: 5,
      title: 'Inventário',
      description: 'Estoque e localização',
      icon: <Warehouse className="h-5 w-5" />,
      isCompleted: completedSteps.includes(5),
      isActive: currentStep === 5,
      canNavigate: completedSteps.includes(4),
      requiredFields: ['inventory.quantity'],
      validationRules: []
    },
    {
      id: 6,
      title: 'Variações',
      description: 'Cores, tamanhos e modelos',
      icon: <Palette className="h-5 w-5" />,
      isCompleted: completedSteps.includes(6),
      isActive: currentStep === 6,
      canNavigate: completedSteps.includes(5),
      requiredFields: [],
      validationRules: []
    },
    {
      id: 7,
      title: 'Envio',
      description: 'Custos e políticas de entrega',
      icon: <Truck className="h-5 w-5" />,
      isCompleted: completedSteps.includes(7),
      isActive: currentStep === 7,
      canNavigate: completedSteps.includes(6),
      requiredFields: ['shipping'],
      validationRules: []
    },
    {
      id: 8,
      title: 'SEO',
      description: 'Otimização para buscas',
      icon: <Search className="h-5 w-5" />,
      isCompleted: completedSteps.includes(8),
      isActive: currentStep === 8,
      canNavigate: completedSteps.includes(7),
      requiredFields: [],
      validationRules: []
    },
    {
      id: 9,
      title: 'Conformidade',
      description: 'Certificações e documentos',
      icon: <Shield className="h-5 w-5" />,
      isCompleted: completedSteps.includes(9),
      isActive: currentStep === 9,
      canNavigate: completedSteps.includes(8),
      requiredFields: [],
      validationRules: []
    },
    {
      id: 10,
      title: 'Prévia',
      description: 'Revisão final antes de salvar',
      icon: <Eye className="h-5 w-5" />,
      isCompleted: completedSteps.includes(10),
      isActive: currentStep === 10,
      canNavigate: completedSteps.includes(9),
      requiredFields: [],
      validationRules: []
    }
  ];

  const totalSteps = stepData.length;

  // ===== COMPUTED PROPERTIES =====
  const canGoNext = currentStep < totalSteps;
  const canGoPrevious = currentStep > 1;

  // ===== ACTIONS =====
  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canGoNext]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      setCurrentStep(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      const targetStep = stepData.find(s => s.id === step);
      if (targetStep?.canNavigate) {
        setCurrentStep(step);
      }
    }
  }, [totalSteps, stepData]);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(step)) {
        return [...prev, step].sort((a, b) => a - b);
      }
      return prev;
    });
  }, []);

  const getStepValidation = useCallback((step: number): boolean => {
    const stepInfo = stepData.find(s => s.id === step);
    return stepInfo?.isCompleted || false;
  }, [stepData]);

  return {
    currentStep,
    totalSteps,
    stepData,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    goToStep,
    markStepCompleted,
    getStepValidation
  };
};
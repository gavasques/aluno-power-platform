/**
 * Hook personalizado para wizards multi-etapa
 * Centraliza lógica de navegação entre steps
 */

import { useState, useCallback } from 'react';

interface UseMultiStepOptions<T extends string = string> {
  steps: T[];
  initialStep?: T;
  onStepChange?: (currentStep: T, previousStep: T) => void;
  canAdvance?: (currentStep: T) => boolean;
  canGoBack?: (currentStep: T) => boolean;
}

export const useMultiStep = <T extends string = string>(
  options: UseMultiStepOptions<T>
) => {
  const { 
    steps, 
    initialStep = steps[0], 
    onStepChange,
    canAdvance,
    canGoBack 
  } = options;

  const [currentStep, setCurrentStep] = useState<T>(initialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<T>>(new Set([initialStep]));
  const [stepData, setStepData] = useState<Record<T, any>>({} as Record<T, any>);

  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToStep = useCallback((step: T) => {
    if (!steps.includes(step)) {
      console.warn(`Step "${step}" is not valid. Available steps:`, steps);
      return false;
    }

    const previousStep = currentStep;
    setCurrentStep(step);
    setVisitedSteps(prev => new Set([...prev, step]));
    
    onStepChange?.(step, previousStep);
    return true;
  }, [currentStep, steps, onStepChange]);

  const nextStep = useCallback(() => {
    if (isLastStep) return false;
    
    if (canAdvance && !canAdvance(currentStep)) {
      return false;
    }

    const nextIndex = currentStepIndex + 1;
    const nextStepValue = steps[nextIndex];
    return goToStep(nextStepValue);
  }, [isLastStep, canAdvance, currentStep, currentStepIndex, steps, goToStep]);

  const previousStep = useCallback(() => {
    if (isFirstStep) return false;
    
    if (canGoBack && !canGoBack(currentStep)) {
      return false;
    }

    const prevIndex = currentStepIndex - 1;
    const prevStepValue = steps[prevIndex];
    return goToStep(prevStepValue);
  }, [isFirstStep, canGoBack, currentStep, currentStepIndex, steps, goToStep]);

  const resetToStep = useCallback((step: T) => {
    setCurrentStep(step);
    setVisitedSteps(new Set([step]));
    setStepData({} as Record<T, any>);
  }, []);

  const resetToFirst = useCallback(() => {
    resetToStep(steps[0]);
  }, [steps, resetToStep]);

  const setDataForStep = useCallback((step: T, data: any) => {
    setStepData(prev => ({ ...prev, [step]: data }));
  }, []);

  const getDataForStep = useCallback((step: T) => {
    return stepData[step];
  }, [stepData]);

  const setDataForCurrentStep = useCallback((data: any) => {
    setDataForStep(currentStep, data);
  }, [currentStep, setDataForStep]);

  const getDataForCurrentStep = useCallback(() => {
    return getDataForStep(currentStep);
  }, [currentStep, getDataForStep]);

  const hasVisitedStep = useCallback((step: T) => {
    return visitedSteps.has(step);
  }, [visitedSteps]);

  const getProgress = useCallback(() => {
    return ((currentStepIndex + 1) / steps.length) * 100;
  }, [currentStepIndex, steps.length]);

  const getStepStatus = useCallback((step: T) => {
    const stepIndex = steps.indexOf(step);
    const currentIndex = currentStepIndex;

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    if (visitedSteps.has(step)) return 'visited';
    return 'pending';
  }, [steps, currentStepIndex, visitedSteps]);

  const canAdvanceFromCurrent = canAdvance ? canAdvance(currentStep) : true;
  const canGoBackFromCurrent = canGoBack ? canGoBack(currentStep) : true;

  return {
    // Current state
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    visitedSteps: Array.from(visitedSteps),
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    resetToFirst,
    resetToStep,
    
    // Data management
    stepData,
    setDataForStep,
    getDataForStep,
    setDataForCurrentStep,
    getDataForCurrentStep,
    
    // Utility functions
    hasVisitedStep,
    getProgress,
    getStepStatus,
    
    // Permissions
    canAdvanceFromCurrent,
    canGoBackFromCurrent,
    
    // Computed properties
    completedSteps: steps.slice(0, currentStepIndex),
    remainingSteps: steps.slice(currentStepIndex + 1),
    totalSteps: steps.length,
  };
};
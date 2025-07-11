// Unified Provider Configuration Hook - Centralized state management for all provider configurations

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  ProviderConfiguration, 
  ProviderWorkflow, 
  ProviderStep, 
  TestConfiguration, 
  TestResult,
  ProviderConfigurationHookReturn 
} from '../types';
import { DEFAULT_CONFIGURATION, DEFAULT_WORKFLOW, QUERY_CONFIG } from '../constants';

export function useUnifiedProviderConfig(
  initialWorkflow?: ProviderWorkflow,
  initialConfiguration?: ProviderConfiguration
): ProviderConfigurationHookReturn {
  const [workflow, setWorkflow] = useState<ProviderWorkflow>(
    initialWorkflow || { ...DEFAULT_WORKFLOW }
  );
  const [configuration, setConfiguration] = useState<ProviderConfiguration>(
    initialConfiguration || { ...DEFAULT_CONFIGURATION }
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API queries with optimized caching
  const { data: models = [] } = useQuery({
    queryKey: ['/api/ai-providers/models'],
    ...QUERY_CONFIG
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    ...QUERY_CONFIG,
    enabled: configuration.enableRetrieval
  });

  // Update configuration function
  const updateConfiguration = useCallback((updates: Partial<ProviderConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  }, []);

  // Update specific step in workflow
  const updateStep = useCallback((stepIndex: number, updates: Partial<ProviderStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, ...updates } : step
      )
    }));
  }, []);

  // Add new step to workflow
  const addStep = useCallback(() => {
    const newStep: ProviderStep = {
      stepNumber: workflow.steps.length + 1,
      stepName: `Etapa ${workflow.steps.length + 1}`,
      stepDescription: '',
      configuration: { ...DEFAULT_CONFIGURATION },
      outputFormat: 'text',
      passOutputToNext: true
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      isMultiStep: prev.steps.length + 1 > 1
    }));
  }, [workflow.steps.length]);

  // Remove step from workflow
  const removeStep = useCallback((stepIndex: number) => {
    setWorkflow(prev => {
      const newSteps = prev.steps.filter((_, index) => index !== stepIndex);
      // Renumber steps
      const renumberedSteps = newSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
        stepName: step.stepName.includes('Etapa') ? `Etapa ${index + 1}` : step.stepName
      }));

      return {
        ...prev,
        steps: renumberedSteps,
        isMultiStep: renumberedSteps.length > 1
      };
    });
  }, []);

  // Test configuration mutation
  const testMutation = useMutation({
    mutationFn: async (testConfig: TestConfiguration): Promise<TestResult> => {
      const startTime = Date.now();
      
      try {
        const formData = new FormData();
        formData.append('prompt', testConfig.prompt);
        formData.append('provider', configuration.provider);
        formData.append('model', configuration.model);
        formData.append('temperature', configuration.temperature.toString());
        formData.append('maxTokens', configuration.maxTokens.toString());
        
        // Add advanced settings
        if (configuration.reasoning_effort) {
          formData.append('reasoning_effort', configuration.reasoning_effort);
        }
        if (configuration.responseFormat) {
          formData.append('responseFormat', configuration.responseFormat);
        }
        if (configuration.enableCodeInterpreter) {
          formData.append('enableCodeInterpreter', 'true');
        }
        if (configuration.enableRetrieval) {
          formData.append('enableRetrieval', 'true');
          if (configuration.selectedCollections?.length) {
            formData.append('selectedCollections', JSON.stringify(configuration.selectedCollections));
          }
        }
        if (configuration.enableSearch) {
          formData.append('enableSearch', 'true');
        }
        if (configuration.enableImageUnderstanding) {
          formData.append('enableImageUnderstanding', 'true');
        }
        if (configuration.enableExtendedThinking) {
          formData.append('enableExtendedThinking', 'true');
          formData.append('thinkingBudgetTokens', configuration.thinkingBudgetTokens?.toString() || '10000');
        }

        // Add placeholder values
        if (testConfig.placeholderValues) {
          formData.append('placeholderValues', JSON.stringify(testConfig.placeholderValues));
        }

        // Add reference images
        if (testConfig.referenceImages?.length) {
          testConfig.referenceImages.forEach((file, index) => {
            formData.append(`referenceImage${index}`, file);
          });
        }

        const response = await fetch('/api/ai-providers/test', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        const executionTime = Date.now() - startTime;

        return {
          success: true,
          response: result.response,
          usage: result.usage,
          cost: result.cost,
          executionTime
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          executionTime
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Teste realizado com sucesso",
          description: `Resposta gerada em ${result.executionTime}ms`
        });
      } else {
        toast({
          title: "Erro no teste",
          description: result.error,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  });

  // Save workflow mutation
  const saveWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (workflow.isMultiStep) {
        // Save multi-step workflow
        return apiRequest('/api/agent-workflows', {
          method: 'POST',
          body: JSON.stringify(workflow)
        });
      } else {
        // Save single configuration
        return apiRequest('/api/provider-configurations', {
          method: 'POST',
          body: JSON.stringify(configuration)
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva",
        description: "A configuração foi salva com sucesso"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/provider-configurations'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  });

  // Test configuration function
  const testConfiguration = useCallback(async (testConfig: TestConfiguration): Promise<TestResult> => {
    return testMutation.mutateAsync(testConfig);
  }, [testMutation]);

  // Save workflow function
  const saveWorkflow = useCallback(async (): Promise<void> => {
    return saveWorkflowMutation.mutateAsync();
  }, [saveWorkflowMutation]);

  const isLoading = testMutation.isPending || saveWorkflowMutation.isPending;

  return {
    configuration,
    workflow,
    updateConfiguration,
    updateStep,
    addStep,
    removeStep,
    testConfiguration,
    saveWorkflow,
    isLoading
  };
}
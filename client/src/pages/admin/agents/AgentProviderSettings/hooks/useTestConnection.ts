import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { TestConnectionData, TestState, UseTestConnectionReturn } from '../types';

/**
 * USE TEST CONNECTION HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para teste de conexão com provedores
 * Responsabilidade única: Gerenciar estado e execução de testes
 */
export function useTestConnection(): UseTestConnectionReturn {
  const { toast } = useToast();

  // Test state
  const [testState, setTestState] = useState<TestState>({
    prompt: 'Olá! Como você está hoje?',
    response: '',
    requestSent: '',
    responseReceived: '',
    isLoading: false
  });

  // Update test state function
  const updateTestState = <K extends keyof TestState>(
    key: K, 
    value: TestState[K]
  ) => {
    setTestState(prev => ({ ...prev, [key]: value }));
  };

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (data: TestConnectionData) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Teste de conexão falhou');
      }
      
      return response.json();
    },
    onMutate: () => {
      setTestState(prev => ({ ...prev, isLoading: true }));
    },
    onSuccess: (data) => {
      setTestState(prev => ({
        ...prev,
        response: data.response || 'Teste realizado com sucesso!',
        requestSent: data.requestSent || '',
        responseReceived: data.responseReceived || '',
        isLoading: false
      }));
      
      toast({
        title: "Conexão testada",
        description: "A conexão com o provedor foi testada com sucesso."
      });
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : "Falha no teste de conexão";
      
      setTestState(prev => ({
        ...prev,
        response: `Erro: ${errorMsg}`,
        requestSent: '',
        responseReceived: '',
        isLoading: false
      }));
      
      toast({
        title: "Erro no teste",
        description: errorMsg,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setTestState(prev => ({ ...prev, isLoading: false }));
    }
  });

  // Run test function
  const runTest = async (data: TestConnectionData): Promise<void> => {
    return testConnectionMutation.mutateAsync(data);
  };

  // Clear test results
  const clearTest = () => {
    setTestState(prev => ({
      ...prev,
      response: '',
      requestSent: '',
      responseReceived: ''
    }));
  };

  return {
    // Test state
    testState,
    updateTestState,
    
    // Actions
    runTest,
    clearTest,
    isLoading: testConnectionMutation.isPending || testState.isLoading
  };
}
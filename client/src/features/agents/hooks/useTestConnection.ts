/**
 * Hook para teste de conexão com providers de IA
 * Gerencia o estado e execução de testes de conectividade
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { TestConnection, TestConnectionResult } from '../types/agent.types';

export const useTestConnection = () => {
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);

  // Mutation para teste de conexão
  const testConnectionMutation = useMutation({
    mutationFn: async (testData: TestConnection): Promise<TestConnectionResult> => {
      setTestStartTime(Date.now());
      setTestResult(null);

      const response = await fetch('/api/agents/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha no teste de conexão');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (result) => {
      const duration = testStartTime ? Date.now() - testStartTime : 0;
      const finalResult = { ...result, duration };
      
      setTestResult(finalResult);
      setTestStartTime(null);

      if (result.success) {
        toast({
          title: "Conexão bem-sucedida",
          description: `Teste concluído em ${duration}ms`
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: result.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      const duration = testStartTime ? Date.now() - testStartTime : 0;
      const failureResult: TestConnectionResult = {
        success: false,
        error: error.message,
        duration
      };
      
      setTestResult(failureResult);
      setTestStartTime(null);

      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Função para executar teste
  const runTest = async (testData: TestConnection): Promise<TestConnectionResult> => {
    try {
      const result = await testConnectionMutation.mutateAsync(testData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Limpar resultado do teste
  const clearTestResult = () => {
    setTestResult(null);
    setTestStartTime(null);
  };

  return {
    // Estado
    testResult,
    isTestingConnection: testConnectionMutation.isPending,
    testError: testConnectionMutation.error,
    
    // Ações
    runTest,
    clearTestResult,
    
    // Dados calculados
    testDuration: testStartTime ? Date.now() - testStartTime : 0
  };
};
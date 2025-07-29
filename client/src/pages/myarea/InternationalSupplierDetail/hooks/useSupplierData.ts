import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Supplier, SupplierFormData, UseSupplierDataReturn } from '../types';

/**
 * HOOK DE DADOS DO FORNECEDOR - FASE 4 REFATORAÇÃO
 * 
 * Responsabilidade única: Gerenciar estado e dados do fornecedor principal
 * Antes: Parte do componente de 1.853 linhas
 * Depois: Hook isolado e reutilizável
 */
export function useSupplierData(supplierId: string): UseSupplierDataReturn {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch supplier data
  const { 
    data: supplier, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['international-supplier', supplierId],
    queryFn: async (): Promise<Supplier> => {
      const response = await fetch(`/api/international-suppliers/${supplierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do fornecedor');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!token && !!supplierId
  });

  // Update supplier mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SupplierFormData>) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar fornecedor');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['international-supplier', supplierId] });
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  const updateSupplier = async (data: Partial<SupplierFormData>) => {
    return updateMutation.mutateAsync(data);
  };

  return {
    supplier: supplier || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    updateSupplier
  };
}
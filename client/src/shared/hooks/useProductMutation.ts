import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProductFormData } from "@/shared/types/product";

/**
 * Hook for product update operations
 * Handles success/error states and cache invalidation
 */
export function useProductMutation(productId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<ProductFormData>) => {
      return apiRequest(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for product deletion
 */
export function useProductDeleteMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest(`/api/products/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir produto",
        variant: "destructive",
      });
    },
  });
}
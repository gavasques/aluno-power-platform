import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "/api/products";

export const useProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error
  } = useQuery({
    queryKey: [API_BASE],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Falha ao carregar produtos');
      }
      return response.json();
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_BASE}/${id}/toggle-status`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        throw new Error('Falha ao alterar status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
      toast({
        title: "Sucesso",
        description: "Status do produto alterado com sucesso"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do produto",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Falha ao deletar produto');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
      toast({
        title: "Sucesso",
        description: "Produto deletado com sucesso"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao deletar produto",
        variant: "destructive"
      });
    }
  });

  return {
    products,
    isLoading,
    error,
    toggleStatus: toggleStatusMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
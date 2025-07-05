import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { productService } from "@/services/productService";
import { Product, InsertProduct } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useMemo } from "react";

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { toast } = useToast();
  const { enabled = true } = options;

  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/products"],
    queryFn: productService.getAll,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto criado",
        description: "Produto criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduct> }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: productService.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Status atualizado",
        description: "Status do produto atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createProduct = useCallback(
    (data: InsertProduct) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const updateProduct = useCallback(
    (id: number, data: Partial<InsertProduct>) => 
      updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteProduct = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const toggleProductStatus = useCallback(
    (id: number) => toggleStatusMutation.mutateAsync(id),
    [toggleStatusMutation]
  );

  const getProductById = useCallback(
    (id: number) => products.find((p: Product) => p.id === id),
    [products]
  );

  const activeProducts = useMemo(
    () => products.filter((p: Product) => p.active),
    [products]
  );

  const inactiveProducts = useMemo(
    () => products.filter((p: Product) => !p.active),
    [products]
  );

  return {
    products,
    activeProducts,
    inactiveProducts,
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for single product
export function useProduct(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: () => id ? productService.getById(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: data,
    isLoading,
    error,
  };
}
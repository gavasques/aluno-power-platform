import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  } = useQuery<Product[], Error>({
    queryKey: ["/api/products"],
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createMutation = useMutation<Product, Error, InsertProduct>({
    mutationFn: (data: InsertProduct) => 
      apiRequest<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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

  const updateMutation = useMutation<Product, Error, { id: number; data: Partial<InsertProduct> }>({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduct> }) =>
      apiRequest<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
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

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => 
      apiRequest(`/api/products/${id}`, {
        method: "DELETE",
      }),
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

  const toggleStatusMutation = useMutation<Product, Error, number>({
    mutationFn: (id: number) => 
      apiRequest<Product>(`/api/products/${id}/toggle-status`, {
        method: "PATCH",
      }),
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
    async (data: InsertProduct): Promise<Product> => {
      return await createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const updateProduct = useCallback(
    async (id: number, data: Partial<InsertProduct>): Promise<Product> => {
      return await updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const deleteProduct = useCallback(
    async (id: number): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const toggleProductStatus = useCallback(
    async (id: number): Promise<Product> => {
      return await toggleStatusMutation.mutateAsync(id);
    },
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
  const { data, isLoading, error } = useQuery<Product | null, Error>({
    queryKey: ["/api/products", id],
    queryFn: () => id ? apiRequest<Product>(`/api/products/${id}`) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: data,
    isLoading,
    error,
  };
}
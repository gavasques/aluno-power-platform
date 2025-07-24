import { useMutation } from "@tanstack/react-query";
import { Product, InsertProduct } from "@shared/schema";
import { useCallback, useMemo } from "react";
import { useCrudQuery } from "./useCrudQuery";
import { productService } from "@/services/productService";
import { toast } from "@/hooks/use-toast";

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { enabled = true } = options;

  const crud = useCrudQuery('produtos', productService, {
    defaultQueryOptions: { 
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 2,
    },
    successMessages: {
      create: "Produto criado com sucesso",
      update: "Produto atualizado com sucesso", 
      delete: "Produto excluído com sucesso"
    },
    errorMessages: {
      create: "Erro ao criar produto",
      update: "Erro ao atualizar produto",
      delete: "Erro ao excluir produto"
    }
  });

  const { data: products = [], isLoading, error, refetch } = crud.useGetAll();

  const createMutation = crud.useCreate();
  const updateMutation = crud.useUpdate();
  const deleteMutation = crud.useDelete();

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => productService.toggleStatus(id),
    onSuccess: () => {
      crud.invalidateQueries();
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
  const crud = useCrudQuery('produtos', productService);
  const { data: product, isLoading, error } = crud.useGetById(id || undefined, {
    enabled: !!id,
  });

  return {
    product,
    isLoading,
    error,
  };
}
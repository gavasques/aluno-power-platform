import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { supplierService } from "@/services/supplierService";
import { Supplier, InsertSupplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

interface UseSuppliersOptions {
  enabled?: boolean;
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { toast } = useToast();
  const { enabled = true } = options;

  const {
    data: suppliers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: supplierService.getAll,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fornecedor criado",
        description: "Fornecedor criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertSupplier> }) =>
      supplierService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fornecedor atualizado",
        description: "Fornecedor atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fornecedor excluído",
        description: "Fornecedor excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir fornecedor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: supplierService.toggleVerified,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Status atualizado",
        description: "Status de verificação atualizado",
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

  const createSupplier = useCallback(
    (data: InsertSupplier) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const updateSupplier = useCallback(
    (id: number, data: Partial<InsertSupplier>) => 
      updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteSupplier = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const toggleVerified = useCallback(
    (id: number) => toggleVerifiedMutation.mutateAsync(id),
    [toggleVerifiedMutation]
  );

  const getSupplierById = useCallback(
    (id: number) => suppliers.find(s => s.id === id),
    [suppliers]
  );

  const verifiedSuppliers = suppliers.filter(s => s.isVerified);
  const unverifiedSuppliers = suppliers.filter(s => !s.isVerified);

  return {
    suppliers,
    verifiedSuppliers,
    unverifiedSuppliers,
    isLoading,
    error,
    refetch,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleVerified,
    getSupplierById,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for single supplier
export function useSupplier(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/suppliers", id],
    queryFn: () => id ? supplierService.getById(id) : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    supplier: data,
    isLoading,
    error,
  };
}
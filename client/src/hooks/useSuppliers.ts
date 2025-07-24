import { useMutation } from "@tanstack/react-query";
import { supplierService } from "@/services/supplierService";
import { Supplier, InsertSupplier } from "@shared/schema";
import { useCallback } from "react";
import { useCrudQuery } from "./useCrudQuery";
import { toast } from "@/hooks/use-toast";

interface UseSuppliersOptions {
  enabled?: boolean;
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { enabled = true } = options;

  const crud = useCrudQuery('fornecedores', supplierService, {
    defaultQueryOptions: { 
      enabled,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    successMessages: {
      create: "Fornecedor criado com sucesso",
      update: "Fornecedor atualizado com sucesso", 
      delete: "Fornecedor excluído com sucesso"
    },
    errorMessages: {
      create: "Erro ao criar fornecedor",
      update: "Erro ao atualizar fornecedor",
      delete: "Erro ao excluir fornecedor"
    }
  });

  const { data: suppliers = [], isLoading, error, refetch } = crud.useGetAll();

  const createMutation = crud.useCreate();
  const updateMutation = crud.useUpdate();
  const deleteMutation = crud.useDelete();

  const toggleVerifiedMutation = useMutation({
    mutationFn: supplierService.toggleVerified,
    onSuccess: () => {
      crud.invalidateQueries();
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
  const crud = useCrudQuery('fornecedores', supplierService);
  const { data: supplier, isLoading, error } = crud.useGetById(id || undefined, {
    enabled: !!id,
  });

  return {
    supplier,
    isLoading,
    error,
  };
}
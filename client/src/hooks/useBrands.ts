import { useMutation } from "@tanstack/react-query";
import { brandService } from "@/services/brandService";
import { Brand } from "@shared/schema";
import { useCallback } from "react";
import { useCrudQuery } from "./useCrudQuery";
import { toast } from "@/hooks/use-toast";

export function useBrands() {
  const crud = useCrudQuery('marcas', brandService, {
    defaultQueryOptions: { 
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    successMessages: {
      create: "Nova marca foi criada com sucesso",
      update: "Marca foi atualizada com sucesso", 
      delete: "Marca foi excluída com sucesso"
    },
    errorMessages: {
      create: "Erro ao criar marca",
      update: "Erro ao atualizar marca",
      delete: "Erro ao excluir marca"
    }
  });

  const { data: brands = [], isLoading, error, refetch } = crud.useGetAll();

  const deleteMutation = crud.useDelete({
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir marca",
        description: error.message || "Não é possível excluir marcas globais",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: brandService.create,
    onSuccess: () => {
      crud.invalidateQueries();
      toast({
        title: "Marca criada",
        description: "Nova marca foi criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar marca",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      brandService.update(id, name),
    onSuccess: () => {
      crud.invalidateQueries();
      toast({
        title: "Marca atualizada",
        description: "Marca foi atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar marca",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createBrand = useCallback(
    (name: string) => createMutation.mutateAsync(name),
    [createMutation]
  );

  const deleteBrand = useCallback(
    (id: number) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const updateBrand = useCallback(
    (id: number, name: string) => 
      updateMutation.mutateAsync({ id, name }),
    [updateMutation]
  );

  const userBrands = brands.filter(brand => !brand.isGlobal);
  const globalBrands = brands.filter(brand => brand.isGlobal);

  return {
    brands,
    userBrands,
    globalBrands,
    isLoading,
    error,
    refetch,
    createBrand,
    deleteBrand,
    updateBrand,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
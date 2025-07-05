import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { brandService } from "@/services/brandService";
import { Brand } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useBrands() {
  const { toast } = useToast();

  const {
    data: brands = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/brands"],
    queryFn: brandService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: brandService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
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

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Marca excluída",
        description: "Marca foi excluída com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir marca",
        description: error.message || "Não é possível excluir marcas globais",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      brandService.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
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
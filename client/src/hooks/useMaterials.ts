import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Material as DbMaterial, InsertMaterial } from '@shared/schema';

export const useMaterials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const materialsQuery = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
  });

  const addMaterialMutation = useMutation({
    mutationFn: (material: InsertMaterial) =>
      apiRequest<DbMaterial>('/api/materials', {
        method: 'POST',
        body: JSON.stringify(material),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Sucesso",
        description: "Material adicionado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar material",
        variant: "destructive",
      });
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, material }: { id: number; material: InsertMaterial }) =>
      apiRequest<DbMaterial>(`/api/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(material),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Sucesso",
        description: "Material atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar material",
        variant: "destructive",
      });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir material",
        variant: "destructive",
      });
    },
  });

  return {
    materials: materialsQuery.data || [],
    isLoading: materialsQuery.isLoading,
    error: materialsQuery.error,
    addMaterial: addMaterialMutation.mutate,
    updateMaterial: updateMaterialMutation.mutate,
    deleteMaterial: deleteMaterialMutation.mutate,
    isAdding: addMaterialMutation.isPending,
    isUpdating: updateMaterialMutation.isPending,
    isDeleting: deleteMaterialMutation.isPending,
  };
};
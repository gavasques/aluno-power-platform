import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface MaterialCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface InsertMaterialCategory {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const useMaterialCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/material-categories'],
    queryFn: () => apiRequest('/api/material-categories'),
  });

  const createMutation = useMutation({
    mutationFn: (category: InsertMaterialCategory) =>
      apiRequest('/api/material-categories', {
        method: 'POST',
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...category }: { id: number } & Partial<InsertMaterialCategory>) =>
      apiRequest(`/api/material-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/material-categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
    },
  });

  return {
    categories,
    isLoading,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
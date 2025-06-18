import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { MaterialCategory } from '@shared/schema';

export const useMaterialCategories = () => {
  const materialCategoriesQuery = useQuery({
    queryKey: ['/api/material-categories'],
    queryFn: () => apiRequest<MaterialCategory[]>('/api/material-categories'),
  });

  return {
    materialCategories: materialCategoriesQuery.data || [],
    isLoading: materialCategoriesQuery.isLoading,
    error: materialCategoriesQuery.error,
  };
};
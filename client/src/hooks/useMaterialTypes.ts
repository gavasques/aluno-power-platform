import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { MaterialType } from '@shared/schema';

export const useMaterialTypes = () => {
  const materialTypesQuery = useQuery({
    queryKey: ['/api/material-types'],
    queryFn: () => apiRequest<MaterialType[]>('/api/material-types'),
  });

  return {
    materialTypes: materialTypesQuery.data || [],
    isLoading: materialTypesQuery.isLoading,
    error: materialTypesQuery.error,
  };
};
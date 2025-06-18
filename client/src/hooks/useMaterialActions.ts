import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export const useMaterialActions = () => {
  const queryClient = useQueryClient();

  const incrementViewMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}/view`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const incrementDownloadMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}/download`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const incrementView = (id: number) => {
    incrementViewMutation.mutate(id);
  };

  const incrementDownload = (id: number) => {
    incrementDownloadMutation.mutate(id);
  };

  return {
    incrementView,
    incrementDownload,
    isIncrementingView: incrementViewMutation.isPending,
    isIncrementingDownload: incrementDownloadMutation.isPending,
  };
};
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for video synchronization
 * Follows SOLID principles - Single Responsibility for sync operations
 * Eliminates window.location.reload() anti-pattern
 */
export function useVideoSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/youtube-videos/sync', {
        method: 'POST',
      }),
    onSuccess: () => {
      // Proper cache invalidation instead of window.location.reload()
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-channel-info'] });
      
      toast({
        title: "Sincronização concluída",
        description: "Os vídeos foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error?.message || "Ocorreu um erro ao sincronizar os vídeos.",
        variant: "destructive",
      });
    },
  });

  // Simplified sync function - no need for local state management
  const syncVideos = () => {
    syncMutation.mutate();
  };

  return {
    syncVideos,
    isSyncing: syncMutation.isPending,
    error: syncMutation.error
  };
}
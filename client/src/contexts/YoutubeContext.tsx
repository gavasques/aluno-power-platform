import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { YoutubeVideo } from '@shared/schema';

interface YoutubeContextType {
  videos: YoutubeVideo[];
  loading: boolean;
  error: string | null;
  syncVideos: () => Promise<void>;
  deleteVideo: (id: number) => Promise<void>;
  refetch: () => void;
}

const YoutubeContext = createContext<YoutubeContextType | undefined>(undefined);

export function YoutubeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: videos = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/youtube-videos'],
    queryFn: () => apiRequest<YoutubeVideo[]>('/api/youtube-videos'),
  });

  const syncMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/youtube-videos/sync', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/youtube-videos/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
    },
  });

  const syncVideos = async (): Promise<void> => {
    await syncMutation.mutateAsync();
  };

  const deleteVideo = async (id: number): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const value: YoutubeContextType = {
    videos,
    loading,
    error: error?.message || null,
    syncVideos,
    deleteVideo,
    refetch,
  };

  return (
    <YoutubeContext.Provider value={value}>
      {children}
    </YoutubeContext.Provider>
  );
}

export function useYoutube() {
  const context = useContext(YoutubeContext);
  if (!context) {
    throw new Error('useYoutube must be used within a YoutubeProvider');
  }
  return context;
}
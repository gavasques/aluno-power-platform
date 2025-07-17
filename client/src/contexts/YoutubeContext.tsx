import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { YoutubeVideo } from '@shared/schema';

interface ChannelInfo {
  title: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  customUrl: string;
  thumbnails: any;
  description: string;
  channelId: string;
}

interface YoutubeContextType {
  videos: YoutubeVideo[];
  channelInfo: ChannelInfo | null;
  loading: boolean;
  channelLoading: boolean;
  error: string | null;
  syncVideos: () => Promise<void>;
  deleteVideo: (id: number) => Promise<void>;
  refetch: () => void;
  refetchChannelInfo: () => void;
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
    enabled: false, // Temporarily disable YouTube queries to reduce errors
    staleTime: 24 * 60 * 60 * 1000, // 24 hours cache
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false, 
    refetchOnReconnect: false,
    structuralSharing: true,
  });

  const {
    data: channelInfo = null,
    isLoading: channelLoading,
    refetch: refetchChannelInfo
  } = useQuery({
    queryKey: ['/api/youtube-channel-info'],
    enabled: false, // Temporarily disable to reduce errors
    retry: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    throwOnError: false,
    structuralSharing: true,
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
    // Proper cache invalidation instead of window.location.reload()
    queryClient.invalidateQueries({ queryKey: ['/api/youtube-channel-info'] });
  };

  const deleteVideo = async (id: number): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const value: YoutubeContextType = {
    videos,
    channelInfo,
    loading,
    channelLoading,
    error: error?.message || null,
    syncVideos,
    deleteVideo,
    refetch,
    refetchChannelInfo,
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
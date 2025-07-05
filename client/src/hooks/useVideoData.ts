import { useMemo } from 'react';
import type { YoutubeVideo } from '@shared/schema';

/**
 * Custom hook for video data processing and grouping
 * Follows SOLID principles - Single Responsibility for video data transformation
 */
export function useVideoData(videos: YoutubeVideo[]) {
  // Memoized video grouping by category (DRY principle)
  const groupedVideos = useMemo(() => {
    return videos.reduce((acc, video) => {
      const category = video.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(video);
      return acc;
    }, {} as Record<string, YoutubeVideo[]>);
  }, [videos]);

  // Memoized categories list
  const categories = useMemo(() => 
    Object.keys(groupedVideos).sort(), 
    [groupedVideos]
  );

  // Memoized latest videos (optimized for performance)
  const latestVideos = useMemo(() => {
    return videos
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6);
  }, [videos]);

  // Utility function for getting limited videos per category
  const getVideosForCategory = useMemo(() => {
    return (category: string, limit: number = 8) => {
      return groupedVideos[category]?.slice(0, limit) || [];
    };
  }, [groupedVideos]);

  // Check if category has more videos than the limit
  const hasMoreVideos = useMemo(() => {
    return (category: string, limit: number = 8) => {
      return (groupedVideos[category]?.length || 0) > limit;
    };
  }, [groupedVideos]);

  return {
    groupedVideos,
    categories,
    latestVideos,
    getVideosForCategory,
    hasMoreVideos,
    totalVideos: videos.length
  };
}
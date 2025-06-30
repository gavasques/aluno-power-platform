import { queryClient } from './queryClient';

// Prefetch strategies for common data
export const prefetchCommonData = async () => {
  const prefetchPromises = [
    // Core data that's used across multiple pages
    queryClient.prefetchQuery({
      queryKey: ['/api/agents'],
      staleTime: 15 * 60 * 1000, // 15 minutes for agents
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/news/published/preview'],
      staleTime: 5 * 60 * 1000, // 5 minutes for news
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/updates/published/preview'],
      staleTime: 5 * 60 * 1000, // 5 minutes for updates
    }),
  ];

  try {
    await Promise.allSettled(prefetchPromises);
  } catch (error) {
    console.warn('Prefetch failed:', error);
  }
};

// Prefetch user-specific data after authentication
export const prefetchUserData = async () => {
  const userPrefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: ['/api/suppliers'],
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/partners'],
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/materials'],
      staleTime: 10 * 60 * 1000,
    }),
  ];

  try {
    await Promise.allSettled(userPrefetchPromises);
  } catch (error) {
    console.warn('User data prefetch failed:', error);
  }
};

// Prefetch route-specific data
export const prefetchRouteData = {
  dashboard: () => Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['/api/youtube-videos'],
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/youtube-channel-info'],
      staleTime: 15 * 60 * 1000,
    }),
  ]),
  
  agents: () => Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['/api/agents'],
      staleTime: 15 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/ai-models'],
      staleTime: 30 * 60 * 1000, // Models change rarely
    }),
  ]),
  
  resources: () => Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['/api/tools'],
      staleTime: 15 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/materials'],
      staleTime: 15 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/suppliers'],
      staleTime: 15 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['/api/partner'],
      staleTime: 15 * 60 * 1000,
    }),
  ]),
};

// Background prefetching for anticipated navigation
export const backgroundPrefetch = () => {
  // Run prefetch in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchCommonData();
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(prefetchCommonData, 1000);
  }
};
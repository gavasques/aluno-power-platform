import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Youtube, AlertCircle } from "lucide-react";
import { CategorySection } from "./CategorySection";
import { VideoCard } from "./VideoCard";
import { useToast } from "@/hooks/use-toast";
import type { YoutubeVideo } from "@shared/schema";

// Custom hook for video data processing
function useVideoData() {
  const { data: videos, isLoading, error } = useQuery<YoutubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  return useMemo(() => {
    if (!videos || videos.length === 0) {
      return { groupedVideos: {}, categories: [], latestVideos: [] };
    }

    // Group videos by category and sort each category by date
    const grouped = videos.reduce((acc: Record<string, YoutubeVideo[]>, video) => {
      const category = video.category || 'Outros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(video);
      return acc;
    }, {});
    
    // Sort videos within each category by publishedAt (newest first)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    });

    // Get categories sorted alphabetically
    const categories = Object.keys(grouped).sort();

    // Get latest 8 videos
    const latestVideos = [...videos]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 8);

    return { groupedVideos: grouped, categories, latestVideos };
  }, [videos]);
}

// Custom hook for video sync operations
function useVideoSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/youtube-videos/sync', { method: 'POST' });
      if (!response.ok) throw new Error('Erro na sincronização');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/youtube-videos'] });
      toast({
        title: "Sincronização concluída",
        description: "Vídeos atualizados com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });
}

export function VideosSection() {
  const [showMoreCategories, setShowMoreCategories] = useState<Record<string, boolean>>({});
  const { groupedVideos, categories, latestVideos } = useVideoData();
  const syncMutation = useVideoSync();

  const { data: videos, isLoading, error } = useQuery<YoutubeVideo[]>({
    queryKey: ['/api/youtube-videos'],
    retry: false, // Don't retry on YouTube API key errors
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Utility functions with memoization
  const getVideosForCategory = useMemo(() => (category: string) => {
    const categoryVideos = groupedVideos[category] || [];
    const isExpanded = showMoreCategories[category];
    return isExpanded ? categoryVideos : categoryVideos.slice(0, 8);
  }, [groupedVideos, showMoreCategories]);

  const hasMoreVideos = useMemo(() => (category: string) => {
    const categoryVideos = groupedVideos[category] || [];
    return categoryVideos.length > 8;
  }, [groupedVideos]);

  const handleShowMore = (category: string) => {
    console.log('Show more videos for category:', category);
    setShowMoreCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <VideosSectionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar vídeos. Verifique sua conexão e tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Youtube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhum vídeo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Sincronize com o YouTube para carregar os vídeos mais recentes
          </p>
          <Button 
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Vídeos
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vídeos</h1>
          <p className="text-muted-foreground">
            Conteúdo educacional sobre Amazon FBA e e-commerce
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSync}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">Total de vídeos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{latestVideos.length}</div>
            <p className="text-xs text-muted-foreground">Vídeos recentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Videos */}
      {latestVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              Vídeos Mais Recentes
              <Badge variant="secondary">{latestVideos.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          videos={getVideosForCategory(category)}
          hasMore={hasMoreVideos(category) && !showMoreCategories[category]}
          onShowMore={handleShowMore}
        />
      ))}
    </div>
  );
}

export function VideosSectionSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Videos skeleton */}
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
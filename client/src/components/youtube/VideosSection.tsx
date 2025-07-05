import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, RefreshCw, Play, Users, ExternalLink } from "lucide-react";
import { useYoutube } from "@/contexts/YoutubeContext";
import { useAuth } from "@/contexts/AuthContext";
import { RoleToggle } from "@/components/ui/role-toggle";
import { useVideoData } from "@/hooks/useVideoData";
import { useVideoSync } from "@/hooks/useVideoSync";
import { CategorySection } from "./CategorySection";

/**
 * Refactored VideosSection following SOLID/DRY/KISS principles
 * - Removed unused VirtualVideoList import
 * - Extracted data processing to useVideoData hook
 * - Extracted sync logic to useVideoSync hook  
 * - Eliminated window.location.reload() anti-pattern
 * - Removed duplicate state management
 * - Used CategorySection component to eliminate duplication
 */
export function VideosSection() {
  const { videos, channelInfo, loading, channelLoading } = useYoutube();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Custom hooks following Single Responsibility Principle
  const { categories, getVideosForCategory, hasMoreVideos, totalVideos } = useVideoData(videos);
  const { syncVideos, isSyncing } = useVideoSync();

  const handleShowMore = (category: string) => {
    // Future implementation for showing more videos in a category
    console.log(`Show more videos for category: ${category}`);
  };

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <div className="flex justify-end">
        <RoleToggle />
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Youtube className="h-6 w-6 text-red-600" />
              </div>
              <div>
                {channelLoading ? (
                  <>
                    <CardTitle className="text-xl">Carregando canal...</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo atualizado automaticamente 2x por dia
                    </p>
                  </>
                ) : channelInfo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{channelInfo.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-red-600 hover:text-red-700"
                        onClick={() => window.open(`https://youtube.com/channel/${channelInfo.channelId}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{parseInt(channelInfo.subscriberCount).toLocaleString()} seguidores</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        <span>{channelInfo.videoCount} vídeos</span>
                      </div>
                      <span>Atualizado automaticamente 2x por dia</span>
                    </div>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-xl">Canal do YouTube</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo atualizado automaticamente 2x por dia
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {totalVideos} vídeos em cache
              </Badge>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncVideos}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Atualizar'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando vídeos...</p>
          </CardContent>
        </Card>
      ) : totalVideos === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Youtube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin ? 'Clique em "Buscar Vídeos" para sincronizar com o YouTube' : 'Os vídeos do YouTube serão sincronizados automaticamente'}
            </p>
            {isAdmin && (
              <Button onClick={syncVideos} disabled={isSyncing}>
                <Play className="h-4 w-4 mr-2" />
                Buscar Vídeos
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Categories - Using reusable CategorySection component */}
          {categories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              videos={getVideosForCategory(category, 8)}
              hasMore={hasMoreVideos(category, 8)}
              onShowMore={handleShowMore}
            />
          ))}
        </>
      )}
    </div>
  );
}
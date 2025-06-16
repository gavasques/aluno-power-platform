import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, RefreshCw, Play, Calendar, Users, ExternalLink } from "lucide-react";
import { VideoCard } from "./VideoCard";
import { useYoutube } from "@/contexts/YoutubeContext";
import { useState } from "react";

export function VideosSection() {
  const { videos, channelInfo, loading, channelLoading, syncVideos } = useYoutube();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncVideos();
    } finally {
      setSyncing(false);
    }
  };

  const groupedVideos = videos.reduce((acc, video) => {
    const category = video.category || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(video);
    return acc;
  }, {} as Record<string, typeof videos>);

  const categories = Object.keys(groupedVideos);
  const featuredVideos = videos.slice(0, 6);

  return (
    <div className="space-y-6">
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
                {videos.length} vídeos em cache
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Atualizar'}
              </Button>
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
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Youtube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Atualizar" para buscar novos vídeos do YouTube
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              <Play className="h-4 w-4 mr-2" />
              Buscar Vídeos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5" />
                Vídeos em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <Badge variant="secondary" className="text-xs">
                    {groupedVideos[category].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedVideos[category].slice(0, 8).map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
                {groupedVideos[category].length > 8 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      Ver mais {category.toLowerCase()}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
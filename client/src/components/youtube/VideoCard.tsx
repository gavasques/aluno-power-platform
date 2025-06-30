import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";
import type { YoutubeVideo } from "@shared/schema";

interface VideoCardProps {
  video: YoutubeVideo;
  onPlay?: (videoId: string) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(video.videoId);
    } else {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handlePlayClick}
          >
            <Play className="h-6 w-6 mr-2" />
            Assistir
          </Button>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {video.channelTitle}
            </p>
          </div>



          {video.category && (
            <Badge variant="secondary" className="text-xs">
              {video.category}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handlePlayClick}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver no YouTube
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
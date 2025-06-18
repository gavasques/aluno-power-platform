import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlayCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubeVideoPlayerProps {
  title: string;
  videoId: string;
  description?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  showOpenInYouTube?: boolean;
  className?: string;
}

export function YouTubeVideoPlayer({
  title,
  videoId,
  description,
  showTitle = true,
  showDescription = true,
  showOpenInYouTube = true,
  className = ""
}: YouTubeVideoPlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlayCircle className="h-5 w-5 text-red-500" />
                {title}
              </CardTitle>
              {showDescription && description && (
                <CardDescription className="mt-2">
                  {description}
                </CardDescription>
              )}
            </div>
            {showOpenInYouTube && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(youtubeUrl, '_blank')}
                className="ml-4"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir no YouTube
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showTitle ? "pt-0" : ""}>
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <iframe
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full rounded-md"
          />
        </AspectRatio>
        
        {!showTitle && showOpenInYouTube && (
          <div className="flex justify-end mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(youtubeUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no YouTube
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
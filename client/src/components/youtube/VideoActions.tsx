import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";

interface VideoActionsProps {
  videoId: string;
  onPlay?: (videoId: string) => void;
  showOverlay?: boolean;
}

/**
 * Reusable video action component
 * Follows DRY principle - eliminates duplicate click handlers
 * Single Responsibility - handles video interaction logic
 */
export function VideoActions({ videoId, onPlay, showOverlay = false }: VideoActionsProps) {
  const handleClick = () => {
    if (onPlay) {
      onPlay(videoId);
    } else {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  };

  if (showOverlay) {
    return (
      <Button
        size="lg"
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={handleClick}
      >
        <Play className="h-6 w-6 mr-2" />
        Assistir
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleClick}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Ver no YouTube
    </Button>
  );
}
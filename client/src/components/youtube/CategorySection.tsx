import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { VideoCard } from "./VideoCard";
import type { YoutubeVideo } from "@shared/schema";

interface CategorySectionProps {
  category: string;
  videos: YoutubeVideo[];
  hasMore: boolean;
  onShowMore?: (category: string) => void;
}

/**
 * Reusable category section component
 * Follows Single Responsibility Principle - handles one category display
 * Eliminates code duplication from VideosSection
 */
export function CategorySection({ category, videos, hasMore, onShowMore }: CategorySectionProps) {
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {displayName}
          <Badge variant="secondary" className="text-xs">
            {videos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        {hasMore && onShowMore && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onShowMore(category)}
            >
              Ver mais {category.toLowerCase()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
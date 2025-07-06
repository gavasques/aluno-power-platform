import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard } from "./VideoCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CategorySectionProps {
  category: string;
  videos: any[];
  hasMore: boolean;
  onShowMore: (category: string) => void;
}

const VIDEOS_PER_PAGE = 8;

export function CategorySection({ category, videos, hasMore, onShowMore }: CategorySectionProps) {
  const [showMore, setShowMore] = useState(false);
  const totalVideos = videos.length;
  const displayedVideos = showMore ? videos : videos.slice(0, VIDEOS_PER_PAGE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedVideos.map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </CardContent>
      <CardFooter>
        {showMore && (
          <div className="flex justify-center mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowMore(false)}
              className="text-sm"
            >
              Ver menos
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                const channelUrl = `https://www.youtube.com/@guilhermevasques`;
                window.open(channelUrl, '_blank');
              }}
              className="text-sm"
            >
              Ver canal no YouTube
            </Button>
          </div>
        )}

        {!showMore && totalVideos > VIDEOS_PER_PAGE && (
          <div className="flex justify-center mt-6 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowMore(true)}
              className="text-sm"
            >
              Ver mais {category.toLowerCase()}
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                const channelUrl = `https://www.youtube.com/@guilhermevasques`;
                window.open(channelUrl, '_blank');
              }}
              className="text-sm"
            >
              Ver canal no YouTube
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export function CategorySectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
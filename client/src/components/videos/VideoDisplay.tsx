import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface Video {
  id: number;
  title: string;
  videoId: string;
  description?: string;
}

interface VideoDisplayProps {
  videos: Video[];
  title?: string;
}

export function VideoDisplay({ videos, title = "Vídeos" }: VideoDisplayProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  const getYoutubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={getYoutubeThumbnail(video.videoId)}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Button
                  size="icon"
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
                  onClick={() => openVideo(video.videoId)}
                >
                  <Play className="w-6 h-6 text-white ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
              {video.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{video.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <Button
              size="icon"
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={closeVideo}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
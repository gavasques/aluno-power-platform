import { useQuery } from "@tanstack/react-query";
import { VideoDisplay } from "./VideoDisplay";

interface ToolVideosProps {
  toolId: number;
}

export function ToolVideos({ toolId }: ToolVideosProps) {
  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['/api/tools', toolId, 'videos'],
    queryFn: () => fetch(`/api/tools/${toolId}/videos`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Carregando vídeos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-red-500">Erro ao carregar vídeos</div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <VideoDisplay 
      videos={videos} 
      title="Vídeos da Ferramenta" 
    />
  );
}
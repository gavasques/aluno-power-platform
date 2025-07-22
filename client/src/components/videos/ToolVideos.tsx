import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { YouTubePlayer } from '@/components/ui/youtube-player';
import { Play } from 'lucide-react';

interface ToolVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
}

interface ToolVideosProps {
  toolName: string;
  videos?: ToolVideo[];
}

export const ToolVideos: React.FC<ToolVideosProps> = ({ toolName, videos = [] }) => {
  // Default videos for tools if none provided
  const defaultVideos: ToolVideo[] = [
    {
      id: '1',
      title: `Como usar o ${toolName}`,
      description: `Tutorial completo sobre como utilizar o ${toolName} de forma eficiente`,
      videoId: 'dQw4w9WgXcQ', // Placeholder video ID
      duration: '10:30',
      category: 'Tutorial'
    },
    {
      id: '2',
      title: `Dicas avançadas - ${toolName}`,
      description: `Técnicas avançadas e melhores práticas para o ${toolName}`,
      videoId: 'dQw4w9WgXcQ', // Placeholder video ID
      duration: '15:45',
      category: 'Avançado'
    }
  ];

  const videosToShow = videos.length > 0 ? videos : defaultVideos;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vídeos Tutoriais</h3>
        <p className="text-gray-600">Aprenda a usar o {toolName} com nossos vídeos tutoriais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videosToShow.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{video.title}</CardTitle>
                <span className="text-sm text-gray-500">{video.duration}</span>
              </div>
              <CardDescription>{video.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden">
                <YouTubePlayer 
                  videoId={video.videoId}
                  className="w-full h-full"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">{video.category}</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Play className="w-4 h-4 mr-1" />
                  Assistir
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videosToShow.length === 0 && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum vídeo disponível</h3>
          <p className="text-gray-600">Vídeos tutoriais estarão disponíveis em breve</p>
        </div>
      )}
    </div>
  );
};

export default ToolVideos;
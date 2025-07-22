import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Edit, Play } from 'lucide-react';
import { YouTubePlayer } from '@/components/ui/youtube-player';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ToolVideo {
  id: number;
  toolId: number;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface ToolVideoFormData {
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  order: number;
  isActive: boolean;
}

interface ToolVideoManagerProps {
  toolId: number;
}

const initialFormData: ToolVideoFormData = {
  title: '',
  description: '',
  videoId: '',
  duration: '',
  category: 'Tutorial',
  order: 1,
  isActive: true
};

const ToolVideoManager: React.FC<ToolVideoManagerProps> = ({ toolId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ToolVideo | null>(null);
  const [formData, setFormData] = useState<ToolVideoFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tool videos
  const { data: videos = [], isLoading } = useQuery<ToolVideo[]>({
    queryKey: ['/api/admin/tools', toolId, 'videos'],
    enabled: !!toolId
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: (data: ToolVideoFormData) => 
      apiRequest(`/api/admin/tools/${toolId}/videos`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools', toolId, 'videos'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: 'Sucesso',
        description: 'Vídeo adicionado com sucesso'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar vídeo',
        variant: 'destructive'
      });
    }
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: (data: ToolVideoFormData) => 
      apiRequest(`/api/admin/tools/${toolId}/videos/${editingVideo?.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools', toolId, 'videos'] });
      setIsDialogOpen(false);
      setEditingVideo(null);
      setFormData(initialFormData);
      toast({
        title: 'Sucesso',
        description: 'Vídeo atualizado com sucesso'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar vídeo',
        variant: 'destructive'
      });
    }
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: number) => 
      apiRequest(`/api/admin/tools/${toolId}/videos/${videoId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools', toolId, 'videos'] });
      toast({
        title: 'Sucesso',
        description: 'Vídeo removido com sucesso'
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover vídeo',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      updateVideoMutation.mutate(formData);
    } else {
      createVideoMutation.mutate(formData);
    }
  };

  const handleEdit = (video: ToolVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      videoId: video.videoId,
      duration: video.duration,
      category: video.category,
      order: video.order,
      isActive: video.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (videoId: number) => {
    if (confirm('Tem certeza que deseja remover este vídeo?')) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const handleVideoIdChange = (value: string) => {
    const extractedId = extractVideoId(value);
    setFormData(prev => ({ ...prev, videoId: extractedId }));
  };

  if (isLoading) {
    return <div>Carregando vídeos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Vídeos</h3>
          <p className="text-gray-600">Adicione e gerencie vídeos tutoriais para esta ferramenta</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVideo(null);
              setFormData(initialFormData);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do vídeo tutorial
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do vídeo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                      <SelectItem value="Dicas">Dicas</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do vídeo"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoId">ID/URL do YouTube *</Label>
                  <Input
                    id="videoId"
                    value={formData.videoId}
                    onChange={(e) => handleVideoIdChange(e.target.value)}
                    placeholder="https://youtu.be/... ou ID do vídeo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="ex: 10:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="isActive">Vídeo ativo</Label>
                </div>
              </div>

              {formData.videoId && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <YouTubePlayer 
                      videoId={formData.videoId}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                >
                  {editingVideo ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{video.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{video.duration}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
                  Ordem: {video.order}
                </div>
              </div>
              {!video.isActive && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                    Inativo
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum vídeo cadastrado</h3>
          <p className="text-gray-600">Adicione vídeos tutoriais para esta ferramenta</p>
        </div>
      )}
    </div>
  );
};

export { ToolVideoManager };
export default ToolVideoManager;
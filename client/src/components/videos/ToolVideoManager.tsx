import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus, Edit, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ToolVideo {
  id: number;
  toolId: number;
  title: string;
  videoId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  videoId: z.string().min(1, "ID do vídeo é obrigatório")
    .regex(/^[a-zA-Z0-9_-]{11}$/, "ID do vídeo YouTube deve ter 11 caracteres"),
  description: z.string().optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface ToolVideoManagerProps {
  toolId: number;
}

export function ToolVideoManager({ toolId }: ToolVideoManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ToolVideo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      videoId: "",
      description: "",
    },
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/tools', toolId, 'videos'],
    queryFn: () => fetch(`/api/tools/${toolId}/videos`).then(res => res.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: VideoFormData) => 
      apiRequest(`/api/tools/${toolId}/videos`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      toast({ title: "Vídeo adicionado com sucesso!" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar vídeo", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VideoFormData }) =>
      apiRequest(`/api/tools/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      toast({ title: "Vídeo atualizado com sucesso!" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar vídeo", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/tools/videos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      toast({ title: "Vídeo removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover vídeo", variant: "destructive" });
    },
  });

  const extractVideoId = (url: string): string => {
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] || match[0];
    }
    
    return url;
  };

  const handleSubmit = (data: VideoFormData) => {
    const videoId = extractVideoId(data.videoId);
    const formData = { ...data, videoId };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (video: ToolVideo) => {
    setEditingVideo(video);
    form.reset({
      title: video.title,
      videoId: video.videoId,
      description: video.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVideo(null);
    form.reset();
  };

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  if (isLoading) {
    return <div>Carregando vídeos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vídeos da Ferramenta</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVideo(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Editar Vídeo" : "Adicionar Vídeo"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Vídeo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título do vídeo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="videoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL ou ID do YouTube</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://youtube.com/watch?v=... ou ID do vídeo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição do vídeo..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingVideo ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhum vídeo adicionado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video: ToolVideo) => (
            <Card key={video.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={getThumbnailUrl(video.videoId)}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-white text-xs">
                    <Youtube className="w-3 h-3 inline mr-1" />
                    YouTube
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-sm mb-2 line-clamp-2">
                  {video.title}
                </CardTitle>
                {video.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(video.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
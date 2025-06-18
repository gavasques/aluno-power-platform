import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Video, Edit } from "lucide-react";
import { YouTubeVideoPlayer } from "./YouTubeVideoPlayer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ToolVideo, InsertToolVideo } from "@shared/schema";

const addVideoSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  videoId: z.string().min(1, "ID do vídeo é obrigatório").regex(/^[a-zA-Z0-9_-]{11}$/, "ID do vídeo do YouTube inválido"),
  description: z.string().optional(),
});

type AddVideoForm = z.infer<typeof addVideoSchema>;

interface ToolVideosProps {
  toolId: number;
  isAdmin?: boolean;
}

export function ToolVideos({ toolId, isAdmin = false }: ToolVideosProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ToolVideo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddVideoForm>({
    resolver: zodResolver(addVideoSchema),
    defaultValues: {
      title: "",
      videoId: "",
      description: "",
    },
  });

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/tools', toolId, 'videos'],
    queryFn: () => fetch(`/api/tools/${toolId}/videos`).then(res => res.json()) as Promise<ToolVideo[]>,
  });

  const addVideoMutation = useMutation({
    mutationFn: (data: InsertToolVideo) => 
      apiRequest(`/api/tools/${toolId}/videos`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      setIsAddDialogOpen(false);
      setEditingVideo(null);
      form.reset();
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar vídeo.",
        variant: "destructive",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertToolVideo> }) =>
      apiRequest(`/api/tools/videos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      setEditingVideo(null);
      form.reset();
      toast({
        title: "Vídeo atualizado",
        description: "O vídeo foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar vídeo.",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/tools/videos/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'videos'] });
      toast({
        title: "Vídeo removido",
        description: "O vídeo foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover vídeo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddVideoForm) => {
    const videoId = extractVideoId(data.videoId);
    const videoData: InsertToolVideo = {
      toolId,
      title: data.title,
      videoId,
      description: data.description || null,
    };

    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data: videoData });
    } else {
      addVideoMutation.mutate(videoData);
    }
  };

  const handleEdit = (video: ToolVideo) => {
    setEditingVideo(video);
    form.setValue("title", video.title);
    form.setValue("videoId", video.videoId);
    form.setValue("description", video.description || "");
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingVideo(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Vídeos Relacionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Vídeos Relacionados ({videos.length})
            </CardTitle>
            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingVideo(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVideo ? "Editar Vídeo" : "Adicionar Novo Vídeo"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título do Vídeo</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Tutorial da ferramenta" />
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
                                {...field} 
                                placeholder="https://youtube.com/watch?v=... ou ID do vídeo"
                                onChange={(e) => {
                                  const extractedId = extractVideoId(e.target.value);
                                  field.onChange(extractedId);
                                }}
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
                                {...field} 
                                placeholder="Breve descrição sobre o conteúdo do vídeo"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addVideoMutation.isPending || updateVideoMutation.isPending}
                        >
                          {addVideoMutation.isPending || updateVideoMutation.isPending 
                            ? "Salvando..." 
                            : editingVideo ? "Atualizar" : "Adicionar"
                          }
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vídeo relacionado ainda.</p>
              {isAdmin && (
                <p className="text-sm mt-2">
                  Clique em "Adicionar Vídeo" para começar.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {videos.map((video) => (
                <div key={video.id} className="relative">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(video)}
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteVideoMutation.mutate(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <YouTubeVideoPlayer
                    title={video.title}
                    videoId={video.videoId}
                    description={video.description}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NewsForm } from "@/components/forms/NewsForm";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { formatDistanceToNow } from "date-fns";
import type { News } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function NewsCenter() {
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: newsList = [], isLoading, refetch } = useQuery<News[]>({
    queryKey: ['/api/news'],
    staleTime: 0,
  });

  const publishMutation = useMutation({
    mutationFn: async (news: News) => {
      return apiRequest(`/api/news/${news.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...news,
          isPublished: !news.isPublished,
          publishedAt: !news.isPublished ? new Date() : null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Sucesso",
        description: "Status de publicação atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status de publicação.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/news/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Sucesso",
        description: "Notícia excluída com sucesso.",
      });
      setDeletingNews(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir notícia.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNews(null);
    refetch(); // Force refresh the news list
  };

  const handlePublishToggle = (news: News) => {
    publishMutation.mutate(news);
  };

  const handleDelete = (news: News) => {
    setDeletingNews(news);
  };

  const confirmDelete = () => {
    if (deletingNews) {
      deleteMutation.mutate(deletingNews.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Central de Notícias</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Notícia
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNews ? "Editar Notícia" : "Nova Notícia"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewsForm
              news={editingNews}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingNews(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {(newsList as News[]).map((news: News) => (
          <Card key={news.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium">{news.title}</h3>
                    <Badge variant={news.isPublished ? "default" : "secondary"}>
                      {news.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Criado {formatDistanceToNow(new Date(news.createdAt))} atrás
                    </span>
                    {news.publishedAt && (
                      <span>
                        Publicado {formatDistanceToNow(new Date(news.publishedAt))} atrás
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishToggle(news)}
                  >
                    {news.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(news)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(news)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {newsList.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma notícia encontrada. Clique em "Nova Notícia" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deletingNews}
        onOpenChange={() => setDeletingNews(null)}
        onConfirm={confirmDelete}
        title="Excluir Notícia"
        description={`Tem certeza que deseja excluir a notícia "${deletingNews?.title}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
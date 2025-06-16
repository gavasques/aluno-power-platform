import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UpdateForm } from "@/components/forms/UpdateForm";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { formatDistanceToNow } from "date-fns";
import type { Update } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function UpdatesCenter() {
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [deletingUpdate, setDeletingUpdate] = useState<Update | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: updatesList = [], isLoading } = useQuery({
    queryKey: ['/api/updates'],
  });

  const publishMutation = useMutation({
    mutationFn: async (update: Update) => {
      return apiRequest(`/api/updates/${update.id}`, {
        method: "PUT",
        body: {
          ...update,
          isPublished: !update.isPublished,
          publishedAt: !update.isPublished ? new Date() : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
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
      return apiRequest(`/api/updates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
      toast({
        title: "Sucesso",
        description: "Novidade excluída com sucesso.",
      });
      setDeletingUpdate(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir novidade.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (update: Update) => {
    setEditingUpdate(update);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUpdate(null);
  };

  const handlePublishToggle = (update: Update) => {
    publishMutation.mutate(update);
  };

  const handleDelete = (update: Update) => {
    setDeletingUpdate(update);
  };

  const confirmDelete = () => {
    if (deletingUpdate) {
      deleteMutation.mutate(deletingUpdate.id);
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
        <h1 className="text-2xl font-semibold">Central de Novidades</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Novidade
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUpdate ? "Editar Novidade" : "Nova Novidade"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateForm
              update={editingUpdate}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingUpdate(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {updatesList.map((update: Update) => (
          <Card key={update.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium">{update.title}</h3>
                    <Badge variant={update.isPublished ? "default" : "secondary"}>
                      {update.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                    <Badge variant="outline">
                      {update.version}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {update.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Criado {formatDistanceToNow(new Date(update.createdAt))} atrás
                    </span>
                    {update.publishedAt && (
                      <span>
                        Publicado {formatDistanceToNow(new Date(update.publishedAt))} atrás
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishToggle(update)}
                  >
                    {update.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(update)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(update)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {updatesList.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma novidade encontrada. Clique em "Nova Novidade" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deletingUpdate}
        onOpenChange={() => setDeletingUpdate(null)}
        onConfirm={confirmDelete}
        title="Excluir Novidade"
        description={`Tem certeza que deseja excluir a novidade "${deletingUpdate?.title}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
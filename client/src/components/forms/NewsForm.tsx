import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type News } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface NewsFormProps {
  news?: News | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewsForm({ news, onSuccess, onCancel }: NewsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: news?.title || "",
    content: news?.content || "",
    summary: news?.summary || "",
    imageUrl: news?.imageUrl || "",
    category: news?.category || "",
    isPublished: news?.isPublished || false,
    isFeatured: news?.isFeatured || false,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (news) {
        return apiRequest(`/api/news/${news.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/news", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Sucesso",
        description: news ? "Notícia atualizada com sucesso." : "Notícia criada com sucesso.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar notícia.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Digite o título da notícia"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="summary">Resumo</Label>
          <Textarea
            id="summary"
            placeholder="Digite um resumo da notícia"
            rows={3}
            value={formData.summary || ""}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            placeholder="Digite o conteúdo completo da notícia"
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            placeholder="Ex: Tecnologia, Negócios"
            value={formData.category || ""}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="imageUrl">URL da Imagem</Label>
          <Input
            id="imageUrl"
            placeholder="https://exemplo.com/imagem.jpg"
            value={formData.imageUrl || ""}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isPublished}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
          />
          <Label>Publicar imediatamente</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
          />
          <Label>Notícia em destaque</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : news ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
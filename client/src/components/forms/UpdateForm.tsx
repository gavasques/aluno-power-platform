import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type Update } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UpdateFormProps {
  update?: Update | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateForm({ update, onSuccess, onCancel }: UpdateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: update?.type || "feature",
    title: update?.title || "",
    content: update?.content || "",
    summary: update?.summary || "",
    isPublished: update?.isPublished || false,
    version: update?.version || "",
    priority: update?.priority || "medium",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (update) {
        return apiRequest(`/api/updates/${update.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/updates", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
      toast({
        title: "Sucesso",
        description: update ? "Novidade atualizada com sucesso." : "Novidade criada com sucesso.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar novidade.",
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
            placeholder="Digite o título da novidade"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select 
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Nova Funcionalidade</SelectItem>
              <SelectItem value="improvement">Melhoria</SelectItem>
              <SelectItem value="bugfix">Correção de Bug</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="version">Versão</Label>
          <Input
            id="version"
            placeholder="Ex: v1.2.0"
            value={formData.version || ""}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select 
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="summary">Resumo</Label>
          <Textarea
            id="summary"
            placeholder="Digite um resumo da novidade"
            rows={3}
            value={formData.summary || ""}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            placeholder="Digite o conteúdo detalhado da novidade"
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Switch
            checked={formData.isPublished}
            onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
          />
          <Label>Publicar imediatamente</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando..." : update ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type Update } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UpdateFormProps {
  update?: Update | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const updateTypes = [
  "Nova Funcionalidade",
  "Correção de Bug",
  "Melhoria de Performance",
  "Atualização de Segurança",
  "Mudança de Interface",
  "Depreciação",
  "Geral"
];

export function UpdateForm({ update, onSuccess, onCancel }: UpdateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: update?.title || "",
    description: update?.description || "",
    version: update?.version || "",
    updateType: update?.updateType || "",
    isPublished: update?.isPublished || false,
    isCritical: update?.isCritical || false,
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
    if (!formData.title || !formData.description || !formData.version) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {update ? "Editar Novidade" : "Nova Novidade"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Digite o título da novidade"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="version">Versão *</Label>
            <Input
              id="version"
              placeholder="Ex: v1.2.3"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="updateType">Tipo de Atualização</Label>
            <Select value={formData.updateType} onValueChange={(value) => setFormData({ ...formData, updateType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {updateTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva as mudanças desta atualização"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label htmlFor="isPublished">Publicar imediatamente</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isCritical"
              checked={formData.isCritical}
              onCheckedChange={(checked) => setFormData({ ...formData, isCritical: checked })}
            />
            <Label htmlFor="isCritical">Atualização crítica</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? "Salvando..." : (update ? "Atualizar" : "Criar")}
          </Button>
        </div>
      </form>
    </div>
  );
}
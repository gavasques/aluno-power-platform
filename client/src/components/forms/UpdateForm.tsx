import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertUpdateSchema, type Update, type InsertUpdate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface UpdateFormProps {
  update?: Update | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateForm({ update, onSuccess, onCancel }: UpdateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertUpdate>({
    resolver: zodResolver(insertUpdateSchema),
    defaultValues: {
      type: update?.type || "feature",
      title: update?.title || "",
      content: update?.content || "",
      summary: update?.summary || "",
      isPublished: update?.isPublished || false,
      version: update?.version || "",
      priority: update?.priority || "medium",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertUpdate) => {
      if (update) {
        return apiRequest(`/api/updates/${update.id}`, {
          method: "PUT",
          body: data,
        });
      } else {
        return apiRequest("/api/updates", {
          method: "POST",
          body: data,
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

  const onSubmit = (data: InsertUpdate) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título da novidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                    <SelectItem value="improvement">Melhoria</SelectItem>
                    <SelectItem value="bugfix">Correção de Bug</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versão</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: v1.2.0"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Digite um resumo da novidade"
                    rows={3}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Digite o conteúdo detalhado da novidade"
                    rows={8}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 md:col-span-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Publicar imediatamente</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
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
    </Form>
  );
}
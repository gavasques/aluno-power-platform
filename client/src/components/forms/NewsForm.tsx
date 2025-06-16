import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertNewsSchema, type News, type InsertNews } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface NewsFormProps {
  news?: News | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewsForm({ news, onSuccess, onCancel }: NewsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertNews>({
    resolver: zodResolver(insertNewsSchema),
    defaultValues: {
      title: news?.title || "",
      content: news?.content || "",
      summary: news?.summary || "",
      imageUrl: news?.imageUrl || "",
      category: news?.category || "",
      tags: news?.tags || [],
      isPublished: news?.isPublished || false,
      isFeatured: news?.isFeatured || false,
      seoTitle: news?.seoTitle || "",
      seoDescription: news?.seoDescription || "",
      seoKeywords: news?.seoKeywords || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertNews) => {
      if (news) {
        return apiRequest(`/api/news/${news.id}`, {
          method: "PUT",
          body: data,
        });
      } else {
        return apiRequest("/api/news", {
          method: "POST",
          body: data,
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

  const onSubmit = (data: InsertNews) => {
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
                  <Input placeholder="Digite o título da notícia" {...field} />
                </FormControl>
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
                    placeholder="Digite um resumo da notícia"
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
                    placeholder="Digite o conteúdo completo da notícia"
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Tecnologia, Negócios"
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
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://exemplo.com/imagem.jpg"
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
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título SEO</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Título otimizado para SEO"
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
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição SEO</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição otimizada para SEO"
                    rows={2}
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
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
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

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Notícia em destaque</FormLabel>
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
            {mutation.isPending ? "Salvando..." : news ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
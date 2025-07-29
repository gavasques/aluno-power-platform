import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { MaterialCategory, InsertMaterialCategory } from '@shared/schema';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  color: z.string().min(4, 'Cor deve ser um código hex válido'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const MaterialCategoriesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'Folder',
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/material-categories'],
    queryFn: () => apiRequest<MaterialCategory[]>('/api/material-categories'),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (category: InsertMaterialCategory) =>
      apiRequest<MaterialCategory>('/api/material-categories', {
        method: 'POST',
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: number; category: Partial<InsertMaterialCategory> }) =>
      apiRequest<MaterialCategory>(`/api/material-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingCategory(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/material-categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-categories'] });
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        category: data,
      });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: MaterialCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    form.reset({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'Folder',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  const predefinedCategories = [
    { name: 'Importação', color: '#10B981', icon: 'Package' },
    { name: 'Amazon Ads', color: '#F59E0B', icon: 'Target' },
    { name: 'Amazon', color: '#FF6B35', icon: 'ShoppingCart' },
    { name: 'Vendas', color: '#8B5CF6', icon: 'TrendingUp' },
    { name: 'Marketing', color: '#EF4444', icon: 'Megaphone' },
    { name: 'Logística', color: '#06B6D4', icon: 'Truck' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Categorias de Materiais
              </CardTitle>
              <CardDescription>
                Gerencie as categorias para organizar os materiais
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          {category.name}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma categoria encontrada</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Crie categorias para organizar seus materiais
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {predefinedCategories.map((cat, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.reset({
                            name: cat.name,
                            description: '',
                            color: cat.color,
                            icon: cat.icon,
                          });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Carregando categorias...</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da categoria" {...field} />
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
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o propósito desta categoria"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" className="w-16" {...field} />
                        <Input placeholder="#3B82F6" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialCategoriesManager;
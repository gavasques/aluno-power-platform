import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { SearchIcon, Package, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Box } from '@shared/schema';

// Validation schema for box form
const boxFormSchema = z.object({
  code: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  length: z.number().min(1, 'Comprimento deve ser maior que 0'),
  width: z.number().min(1, 'Largura deve ser maior que 0'),
  height: z.number().optional(),
  weight: z.number().optional(),
  waveType: z.string().optional(),
  paper: z.string().optional(),
  hasLogo: z.boolean().default(false),
  isColored: z.boolean().default(false),
  isFullColor: z.boolean().default(false),
  isPremiumPrint: z.boolean().default(false),
  unitCost: z.number().optional(),
  moq: z.number().optional(),
  idealFor: z.string().optional(),
  notes: z.string().optional(),
});

type BoxFormData = z.infer<typeof boxFormSchema>;

const Boxes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BoxFormData>({
    resolver: zodResolver(boxFormSchema),
    defaultValues: {
      code: '',
      status: 'ativa',
      type: '',
      length: 0,
      width: 0,
      height: undefined,
      weight: undefined,
      waveType: '',
      paper: '',
      hasLogo: false,
      isColored: false,
      isFullColor: false,
      isPremiumPrint: false,
      unitCost: undefined,
      moq: undefined,
      idealFor: '',
      notes: '',
    },
  });

  // Fetch boxes
  const { data: boxes = [], isLoading } = useQuery<Box[]>({
    queryKey: ['/api/boxes'],
    queryFn: async () => {
      const response = await fetch('/api/boxes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch boxes');
      return response.json();
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BoxFormData) => {
      if (editingBox) {
        return apiRequest(`/api/boxes/${editingBox.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/boxes', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boxes'] });
      setIsDialogOpen(false);
      setEditingBox(null);
      form.reset();
      toast({
        title: editingBox ? 'Caixa atualizada' : 'Caixa criada',
        description: `A caixa foi ${editingBox ? 'atualizada' : 'criada'} com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar a caixa.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (boxId: number) => {
      return apiRequest(`/api/boxes/${boxId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boxes'] });
      toast({
        title: 'Caixa excluída',
        description: 'A caixa foi removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir a caixa.',
        variant: 'destructive',
      });
    },
  });

  const filteredBoxes = boxes.filter(box => 
    box.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (box.paper && box.paper.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (box.idealFor && box.idealFor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (box: Box) => {
    setEditingBox(box);
    form.reset({
      code: box.code,
      status: box.status,
      type: box.type,
      length: box.length,
      width: box.width,
      height: box.height,
      weight: box.weight,
      waveType: box.waveType,
      paper: box.paper || '',
      hasLogo: box.hasLogo,
      isColored: box.isColored,
      isFullColor: box.isFullColor,
      isPremiumPrint: box.isPremiumPrint,
      unitCost: box.unitCost ? parseFloat(box.unitCost) : undefined,
      moq: box.moq || undefined,
      idealFor: box.idealFor || '',
      notes: box.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingBox(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: BoxFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Caixas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas embalagens e caixas</p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Caixa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código, tipo, papel ou uso ideal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Boxes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Caixas Cadastradas ({filteredBoxes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando caixas...</div>
          ) : filteredBoxes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma caixa encontrada com os termos de busca.' : 'Nenhuma caixa cadastrada ainda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dimensões (cm)</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Onda</TableHead>
                    <TableHead>Recursos</TableHead>
                    <TableHead>MOQ</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBoxes.map((box) => (
                    <TableRow key={box.id}>
                      <TableCell className="font-medium">{box.code}</TableCell>
                      <TableCell>
                        <Badge variant={box.status === 'ativa' ? 'default' : 'secondary'}>
                          {box.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{box.type}</TableCell>
                      <TableCell className="text-sm">
                        {(box.length/10).toFixed(1)} × {(box.width/10).toFixed(1)} × {(box.height/10).toFixed(1)}
                        <div className="text-xs text-gray-500">
                          ({box.length} × {box.width} × {box.height} mm)
                        </div>
                      </TableCell>
                      <TableCell>
                        {(box.weight/1000).toFixed(2)}kg
                        <div className="text-xs text-gray-500">({box.weight}g)</div>
                      </TableCell>
                      <TableCell>{box.waveType}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {box.hasLogo && <Badge variant="outline" className="text-xs">Logo</Badge>}
                          {box.isColored && <Badge variant="outline" className="text-xs">Colorido</Badge>}
                          {box.isFullColor && <Badge variant="outline" className="text-xs">Full Color</Badge>}
                          {box.isPremiumPrint && <Badge variant="outline" className="text-xs">Premium</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{box.moq || '-'}</TableCell>
                      <TableCell>
                        {box.unitCost ? `R$ ${parseFloat(box.unitCost).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(box)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a caixa "{box.code}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(box.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBox ? 'Editar Caixa' : 'Nova Caixa'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código da Caixa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: CX001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativa">Ativa</SelectItem>
                          <SelectItem value="inativa">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Caixa de Papelão">Caixa de Papelão</SelectItem>
                          <SelectItem value="Flyer">Flyer</SelectItem>
                          <SelectItem value="Tabuleiro">Tabuleiro</SelectItem>
                          <SelectItem value="Outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comprimento (mm) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Ex: 300"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {field.value > 0 && `${(field.value/10).toFixed(1)} cm`}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura (mm) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Ex: 200"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {field.value > 0 && `${(field.value/10).toFixed(1)} cm`}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Ex: 100"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {(field.value ?? 0) > 0 && `${((field.value ?? 0)/10).toFixed(1)} cm`}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (gramas)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Ex: 150"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {(field.value ?? 0) > 0 && `${((field.value ?? 0)/1000).toFixed(2)} kg`}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Onda</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Simples">Simples</SelectItem>
                          <SelectItem value="Dupla">Dupla</SelectItem>
                          <SelectItem value="Tripla">Tripla</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Unitário (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ex: 1.50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="moq"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MOQ (Qtd. Mínima)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ex: 500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paper"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Kraft 180g" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Boolean Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="hasLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Com Logo</FormLabel>
                        <div className="text-xs text-gray-500">Possui logomarca impressa</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isColored"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Colorido</FormLabel>
                        <div className="text-xs text-gray-500">Impressão colorida</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFullColor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Colorido Total</FormLabel>
                        <div className="text-xs text-gray-500">Full color</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPremiumPrint"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Impressão Premium</FormLabel>
                        <div className="text-xs text-gray-500">Acabamento especial</div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

                {/* Text Areas */}
                <div className="col-span-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <FormField
                      control={form.control}
                      name="idealFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ideal para</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Ex: Produtos eletrônicos pequenos, cosméticos..."
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Observações adicionais sobre a caixa..."
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : (editingBox ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Boxes;
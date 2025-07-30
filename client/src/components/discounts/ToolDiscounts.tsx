import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Percent, ExternalLink, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { ToolDiscount, InsertToolDiscount } from '@shared/schema';

interface ToolDiscountsProps {
  toolId: number;
  isAdmin?: boolean;
}

export const ToolDiscounts: React.FC<ToolDiscountsProps> = ({ toolId, isAdmin = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<ToolDiscount | null>(null);
  const [discountData, setDiscountData] = useState({
    title: '',
    linkOrCoupon: '',
    explanation: '',
  });

  // Fetch discounts
  const { data: discounts = [], isLoading } = useQuery<ToolDiscount[]>({
    queryKey: ['/api/tools', toolId, 'discounts'],
    queryFn: () => apiRequest(`/api/tools/${toolId}/discounts`),
  });

  // Add discount mutation
  const addDiscountMutation = useMutation({
    mutationFn: (discount: InsertToolDiscount) =>
      apiRequest(`/api/tools/${toolId}/discounts`, {
        method: 'POST',
        body: JSON.stringify(discount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'discounts'] });
      resetForm();
      toast({
        title: 'Sucesso!',
        description: 'Desconto adicionado com sucesso.',
      });
    },
  });

  // Update discount mutation
  const updateDiscountMutation = useMutation({
    mutationFn: ({ id, discount }: { id: number; discount: Partial<InsertToolDiscount> }) =>
      apiRequest(`/api/tools/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(discount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'discounts'] });
      resetForm();
      toast({
        title: 'Sucesso!',
        description: 'Desconto atualizado com sucesso.',
      });
    },
  });

  // Delete discount mutation
  const deleteDiscountMutation = useMutation({
    mutationFn: (discountId: number) =>
      apiRequest(`/api/tools/discounts/${discountId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'discounts'] });
      toast({
        title: 'Sucesso!',
        description: 'Desconto removido com sucesso.',
      });
    },
  });

  const resetForm = () => {
    setDiscountData({ title: '', linkOrCoupon: '', explanation: '' });
    setEditingDiscount(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountData.title.trim() || !discountData.linkOrCoupon.trim() || !discountData.explanation.trim()) {
      return;
    }

    const discount: InsertToolDiscount = {
      toolId,
      title: discountData.title.trim(),
      linkOrCoupon: discountData.linkOrCoupon.trim(),
      explanation: discountData.explanation.trim(),
    };

    if (editingDiscount) {
      updateDiscountMutation.mutate({ id: editingDiscount.id, discount });
    } else {
      addDiscountMutation.mutate(discount);
    }
  };

  const startEdit = (discount: ToolDiscount) => {
    setEditingDiscount(discount);
    setDiscountData({
      title: discount.title,
      linkOrCoupon: discount.linkOrCoupon,
      explanation: discount.explanation,
    });
    setIsDialogOpen(true);
  };

  const isLink = (linkOrCoupon: string) => {
    return linkOrCoupon.startsWith('http://') || linkOrCoupon.startsWith('https://');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Discount Button (Admin Only) */}
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Desconto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDiscount ? 'Editar Desconto' : 'Adicionar Desconto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={discountData.title}
                    onChange={(e) => setDiscountData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Desconto de 30% para estudantes"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="linkOrCoupon">Link ou Cupom</Label>
                  <Input
                    id="linkOrCoupon"
                    value={discountData.linkOrCoupon}
                    onChange={(e) => setDiscountData(prev => ({ ...prev, linkOrCoupon: e.target.value }))}
                    placeholder="https://exemplo.com/desconto ou CUPOM30"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="explanation">Explicação</Label>
                  <Textarea
                    id="explanation"
                    value={discountData.explanation}
                    onChange={(e) => setDiscountData(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Descreva como usar este desconto..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={addDiscountMutation.isPending || updateDiscountMutation.isPending}
                    className="flex-1"
                  >
                    {addDiscountMutation.isPending || updateDiscountMutation.isPending
                      ? 'Salvando...'
                      : editingDiscount
                      ? 'Atualizar'
                      : 'Adicionar'
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Discounts List */}
      <div className="space-y-4">
        {discounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum desconto disponível no momento</p>
            </CardContent>
          </Card>
        ) : (
          discounts.map((discount) => (
            <Card key={discount.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg text-gray-900">
                        {discount.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {discount.explanation}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isLink(discount.linkOrCoupon) ? (
                          <Button asChild size="sm">
                            <a
                              href={discount.linkOrCoupon}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Acessar Oferta
                            </a>
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
                            <span className="text-sm text-gray-600">Cupom:</span>
                            <code className="font-mono font-semibold text-green-700">
                              {discount.linkOrCoupon}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(discount.linkOrCoupon);
                                toast({
                                  title: 'Copiado!',
                                  description: 'Cupom copiado para a área de transferência.',
                                });
                              }}
                            >
                              Copiar
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        Adicionado em {formatDate(discount.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(discount)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDiscountMutation.mutate(discount.id)}
                        disabled={deleteDiscountMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, User, Mail, Phone, MessageSquare, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PartnerContact, InsertPartnerContact } from '@shared/schema';

interface PartnerContactsManagerProps {
  partnerId: number;
}

export const PartnerContactsManager: React.FC<PartnerContactsManagerProps> = ({ partnerId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<PartnerContact | null>(null);
  const [formData, setFormData] = useState<Partial<InsertPartnerContact>>({
    area: '',
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    notes: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contacts = [], isLoading } = useQuery<PartnerContact[]>({
    queryKey: ['/api/partners', partnerId, 'contacts'],
    queryFn: () => apiRequest<PartnerContact[]>(`/api/partners/${partnerId}/contacts`),
    enabled: !!partnerId
  });

  const createMutation = useMutation({
    mutationFn: (contact: InsertPartnerContact) => 
      apiRequest('/api/partner-contacts', {
        method: 'POST',
        body: JSON.stringify(contact),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar contato.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPartnerContact> }) => 
      apiRequest(`/api/partner-contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/partner-contacts/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover contato.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      area: '',
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      notes: ''
    });
    setEditingContact(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area || !formData.name) {
      toast({
        title: "Erro",
        description: "Área e nome são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, partnerId } as InsertPartnerContact);
    }
  };

  const handleEdit = (contact: PartnerContact) => {
    setEditingContact(contact);
    setFormData({
      area: contact.area,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      whatsapp: contact.whatsapp,
      notes: contact.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contact: PartnerContact) => {
    if (confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-white text-lg">Contatos</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-white">Área/Departamento *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="Ex: Vendas, Suporte, Financeiro"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do contato"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o contato"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingContact ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-white">Carregando contatos...</div>
      ) : contacts.length === 0 ? (
        <div className="text-slate-400 text-center py-8">
          Nenhum contato cadastrado
        </div>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-400" />
                      {contact.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {contact.area}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {contact.email && (
                    <div className="flex items-center text-slate-300">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-slate-300">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      {contact.phone}
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center text-slate-300">
                      <MessageSquare className="h-4 w-4 mr-2 text-slate-400" />
                      {contact.whatsapp}
                    </div>
                  )}
                </div>
                {contact.notes && (
                  <div className="mt-3 text-sm text-slate-400">
                    <strong>Observações:</strong> {contact.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
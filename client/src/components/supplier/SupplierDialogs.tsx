import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { SupplierBrand, SupplierContact, SupplierConversation } from '@shared/schema';

// Brand Dialog
interface BrandDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (brand: Partial<SupplierBrand>) => Promise<void>;
  brand?: SupplierBrand | null;
  supplierId: string;
  isLoading?: boolean;
}

export const BrandDialog: React.FC<BrandDialogProps> = ({
  open,
  onClose,
  onSave,
  brand,
  supplierId,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        description: brand.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [brand, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da marca é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSave({
        ...formData,
        supplierId: parseInt(supplierId),
        userId: 2 // TODO: Get from auth context
      });
      onClose();
      toast({
        title: "Sucesso",
        description: brand ? "Marca atualizada" : "Marca adicionada"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar marca",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {brand ? 'Editar Marca' : 'Adicionar Marca'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Marca *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da marca"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da marca (opcional)"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {brand ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Contact Dialog
interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: Partial<SupplierContact>) => Promise<void>;
  contact?: SupplierContact | null;
  supplierId: string;
  isLoading?: boolean;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  onSave,
  contact,
  supplierId,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    notes: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        department: '',
        notes: contact.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        notes: ''
      });
    }
  }, [contact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do contato é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSave({
        ...formData,
        supplierId: parseInt(supplierId),
        userId: 2 // TODO: Get from auth context
      });
      onClose();
      toast({
        title: "Sucesso",
        description: contact ? "Contato atualizado" : "Contato adicionado"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar contato",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {contact ? 'Editar Contato' : 'Adicionar Contato'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do contato"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Ex: Gerente de Vendas"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Ex: Comercial"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o contato"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {contact ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Conversation Dialog
interface ConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (conversation: Partial<SupplierConversation>) => Promise<void>;
  conversation?: SupplierConversation | null;
  supplierId: string;
  isLoading?: boolean;
}

export const ConversationDialog: React.FC<ConversationDialogProps> = ({
  open,
  onClose,
  onSave,
  conversation,
  supplierId,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    channel: 'email',
    contactPerson: '',
    priority: 'medium',
    status: 'pending',
    outcome: '',
    nextFollowUp: ''
  });

  useEffect(() => {
    if (conversation) {
      setFormData({
        subject: conversation.subject || '',
        content: conversation.content || '',
        channel: conversation.channel || 'email',
        contactPerson: conversation.contactPerson || '',
        priority: conversation.priority || 'medium',
        status: conversation.status || 'pending',
        outcome: conversation.outcome || '',
        nextFollowUp: conversation.nextFollowUp ? 
          new Date(conversation.nextFollowUp).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        subject: '',
        content: '',
        channel: 'email',
        contactPerson: '',
        priority: 'medium',
        status: 'pending',
        outcome: '',
        nextFollowUp: ''
      });
    }
  }, [conversation, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast({
        title: "Erro",
        description: "Assunto e conteúdo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversationData = {
        ...formData,
        supplierId: parseInt(supplierId),
        userId: 2, // TODO: Get from auth context
        nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp) : null
      };
      
      await onSave(conversationData);
      onClose();
      toast({
        title: "Sucesso",
        description: conversation ? "Conversa atualizada" : "Conversa adicionada"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar conversa",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {conversation ? 'Editar Conversa' : 'Nova Conversa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto da conversa"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descreva o conteúdo da conversa"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="channel">Canal</Label>
                <Select value={formData.channel} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nome da pessoa"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nextFollowUp">Próximo Follow-up</Label>
              <Input
                id="nextFollowUp"
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData(prev => ({ ...prev, nextFollowUp: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="outcome">Resultado</Label>
              <Textarea
                id="outcome"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="Resultado ou conclusões da conversa"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {conversation ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
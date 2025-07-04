import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { SupplierBrand, SupplierContact, SupplierConversation, InsertSupplierBrand, InsertSupplierContact, InsertSupplierConversation } from '@shared/schema';

// Brand Dialog
interface BrandDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (brand: InsertSupplierBrand) => Promise<unknown>;
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
      const brandData: InsertSupplierBrand = {
        name: formData.name,
        description: formData.description || null,
        supplierId: parseInt(supplierId),
        userId: 2 // TODO: Get from auth context
      };
      
      await onSave(brandData);
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
  onSave: (contact: InsertSupplierContact) => Promise<unknown>;
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
      const contactData: InsertSupplierContact = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp: null, // TODO: Add whatsapp field to form
        position: formData.position || null,
        notes: formData.notes || null,
        supplierId: parseInt(supplierId),
        userId: 2 // TODO: Get from auth context
      };
      
      await onSave(contactData);
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
  onSave: (conversation: InsertSupplierConversation) => Promise<unknown>;
  onUploadFile?: (file: File, name: string, type: string) => Promise<any>;
  conversation?: SupplierConversation | null;
  supplierId: string;
  isLoading?: boolean;
}

export const ConversationDialog: React.FC<ConversationDialogProps> = ({
  open,
  onClose,
  onSave,
  onUploadFile,
  conversation,
  supplierId,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    channel: 'email',
    contactPerson: ''
  });
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    if (conversation) {
      setFormData({
        subject: conversation.subject || '',
        content: conversation.content || '',
        channel: conversation.channel || 'email',
        contactPerson: conversation.contactPerson || ''
      });
    } else {
      setFormData({
        subject: '',
        content: '',
        channel: 'email',
        contactPerson: ''
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
      let attachedFileId = null;
      
      // Se há um arquivo anexo, faça o upload primeiro
      if (attachedFile && onUploadFile) {
        try {
          const uploadResult = await onUploadFile(
            attachedFile, 
            attachedFile.name, 
            'conversation'
          );
          attachedFileId = uploadResult.id;
          
          toast({
            title: "Arquivo anexado",
            description: `${attachedFile.name} foi enviado com sucesso`,
          });
        } catch (uploadError) {
          toast({
            title: "Erro no upload",
            description: "Não foi possível anexar o arquivo, mas a conversa será salva",
            variant: "destructive"
          });
        }
      }

      const conversationData: InsertSupplierConversation = {
        subject: formData.subject,
        content: formData.content,
        channel: formData.channel,
        contactPerson: formData.contactPerson || null,
        supplierId: parseInt(supplierId),
        userId: 2, // TODO: Get from auth context
        attachedFileId: attachedFileId || null
      };
      
      await onSave(conversationData);
      onClose();
      
      // Reset file state
      setAttachedFile(null);
      
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
                <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nome da pessoa"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="attachment">Anexo (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
                  className="file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {attachedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAttachedFile(null)}
                  >
                    Remover
                  </Button>
                )}
              </div>
              {attachedFile && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
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
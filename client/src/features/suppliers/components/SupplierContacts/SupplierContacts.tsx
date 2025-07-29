/**
 * Componente de apresentação para gerenciamento de contatos do fornecedor
 * Lista de contatos com funcionalidades de adicionar, editar e remover
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MessageSquare,
  User,
  Star
} from "lucide-react";
import type { Contact } from '../../types/supplier.types';

interface SupplierContactsProps {
  contacts: Contact[];
  onAdd: (contact: Omit<Contact, 'id'>) => Promise<void>;
  onUpdate: (id: number, data: Partial<Contact>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierContacts = ({ 
  contacts, 
  onAdd, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}: SupplierContactsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    whatsapp: '',
    isMainContact: false
  });

  const resetForm = () => {
    setContactForm({
      name: '',
      position: '',
      email: '',
      phone: '',
      whatsapp: '',
      isMainContact: false
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingContact(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setContactForm({
      name: contact.name,
      position: contact.position,
      email: contact.email,
      phone: contact.phone || '',
      whatsapp: contact.whatsapp || '',
      isMainContact: contact.isMainContact
    });
    setEditingContact(contact);
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (editingContact) {
      await onUpdate(editingContact.id, contactForm);
    } else {
      await onAdd(contactForm);
    }
    setIsAddModalOpen(false);
    resetForm();
    setEditingContact(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Contatos</h3>
          <p className="text-sm text-gray-600">
            {contacts.length} contato{contacts.length !== 1 ? 's' : ''} cadastrado{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Contato
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Editar Contato' : 'Adicionar Contato'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName">Nome *</Label>
                <Input
                  id="contactName"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPosition">Cargo *</Label>
                <Input
                  id="contactPosition"
                  value={contactForm.position}
                  onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                  placeholder="Gerente de Vendas, CEO, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input
                  id="contactPhone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                <Input
                  id="contactWhatsapp"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isMainContact"
                  checked={contactForm.isMainContact}
                  onCheckedChange={(checked) => setContactForm({ ...contactForm, isMainContact: checked })}
                />
                <Label htmlFor="isMainContact">Contato principal</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!contactForm.name || !contactForm.position || !contactForm.email || isLoading}
              >
                {editingContact ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Adicione contatos para facilitar a comunicação com este fornecedor.
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Contato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      {contact.isMainContact && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{contact.position}</CardDescription>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {contact.email}
                  </a>
                </div>
                
                {contact.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.whatsapp && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <a 
                      href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm"
                    >
                      {contact.whatsapp}
                    </a>
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
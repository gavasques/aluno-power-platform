import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ContactDialog } from '../dialogs/ContactDialog';
import type { Contact } from '@/types/supplier';

interface ContactsTabProps {
  contacts: Contact[];
  supplierId: number;
  onUpdate: () => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  supplierId,
  onUpdate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleAddContact = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleDeleteContact = async (contactId: number) => {

  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contatos</h3>
          <p className="text-sm text-gray-500">
            Gerencie os contatos do fornecedor
          </p>
        </div>
        <Button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      {/* Lista de contatos */}
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum contato cadastrado
            </h4>
            <p className="text-gray-500 mb-4">
              Adicione contatos para facilitar a comunicação com este fornecedor.
            </p>
            <Button onClick={handleAddContact} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Contato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {contact.name}
                      {contact.isMainContact && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {contact.position}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {contact.email}
                    </a>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.whatsapp && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <a 
                        href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar/editar contato */}
      <ContactDialog
        isOpen={isDialogOpen}
        contact={editingContact}
        supplierId={supplierId}
        onClose={handleDialogClose}
      />
    </div>
  );
};
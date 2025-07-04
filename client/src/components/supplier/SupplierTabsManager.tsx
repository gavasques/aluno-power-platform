import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, User, MessageSquare, Building2, FileText } from 'lucide-react';
import type { SupplierBrand, SupplierContact, SupplierConversation, SupplierFile } from '@shared/schema';

interface BrandListProps {
  brands: SupplierBrand[];
  onAdd: () => void;
  onEdit: (brand: SupplierBrand) => void;
  onDelete: (brandId: number) => void;
  isLoading?: boolean;
}

export const BrandList: React.FC<BrandListProps> = ({ 
  brands, 
  onAdd, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Marcas ({brands.length})</h3>
        <Button onClick={onAdd} size="sm" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Marca
        </Button>
      </div>

      {brands.length === 0 ? (
        <EmptyState 
          icon={Building2}
          title="Nenhuma marca cadastrada"
          description="Adicione marcas representadas por este fornecedor"
        />
      ) : (
        <div className="grid gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{brand.name}</h4>
                  {brand.description && (
                    <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(brand)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(brand.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface ContactListProps {
  contacts: SupplierContact[];
  onAdd: () => void;
  onEdit: (contact: SupplierContact) => void;
  onDelete: (contactId: number) => void;
  isLoading?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  onAdd, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contatos ({contacts.length})</h3>
        <Button onClick={onAdd} size="sm" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState 
          icon={User}
          title="Nenhum contato cadastrado"
          description="Adicione contatos deste fornecedor"
        />
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{contact.name}</h4>
                  {contact.position && (
                    <p className="text-sm text-gray-600">{contact.position}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    {contact.email && <span>✉ {contact.email}</span>}
                    {contact.phone && <span>📞 {contact.phone}</span>}
                    {contact.whatsapp && <span>💬 {contact.whatsapp}</span>}
                  </div>
                  {contact.notes && (
                    <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(contact)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(contact.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface ConversationListProps {
  conversations: SupplierConversation[];
  onAdd: () => void;
  onEdit: (conversation: SupplierConversation) => void;
  onDelete?: (conversationId: number) => void;
  isLoading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onAdd, 
  onEdit, 
  onDelete,
  isLoading = false 
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Conversas ({conversations.length})</h3>
        <Button onClick={onAdd} size="sm" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {conversations.length === 0 ? (
        <EmptyState 
          icon={MessageSquare}
          title="Nenhuma conversa registrada"
          description="Registre conversas e acompanhamentos com este fornecedor"
        />
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{conversation.subject}</h4>
                <div className="flex gap-2 items-center">
                  <Badge variant="outline">{conversation.channel}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(conversation)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete && onDelete(conversation.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {conversation.content}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex gap-4">
                  {conversation.contactPerson && (
                    <span>👤 {conversation.contactPerson}</span>
                  )}
                  {conversation.attachedFileId && (
                    <span className="flex items-center gap-1 text-blue-600">
                      📎 Anexo
                    </span>
                  )}
                </div>
                <span>{formatDate(conversation.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface FileListProps {
  files: SupplierFile[];
  onUpload?: () => void;
  isLoading?: boolean;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  onUpload,
  isLoading = false 
}) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Arquivos ({files.length})</h3>
        <Button size="sm" onClick={onUpload} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Arquivo
        </Button>
      </div>

      {files.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Nenhum arquivo enviado"
          description="Faça upload de contratos, certificados e outros documentos"
        />
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{file.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(file.fileUrl, '_blank')}
                  >
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.fileUrl;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);
import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Building2, Save, X } from 'lucide-react';
import { useSupplierDetail } from '@/hooks/useSupplierDetail';
import { SupplierInfoDisplay } from '@/components/supplier/SupplierInfoDisplay';
import { SupplierInfoForm } from '@/components/supplier/SupplierInfoForm';
import { 
  BrandList, 
  ContactList, 
  ConversationList, 
  FileList 
} from '@/components/supplier/SupplierTabsManager';
import { BrandDialog, ContactDialog, ConversationDialog } from '@/components/supplier/SupplierDialogs';
import { SupplierEditDialog } from '@/components/supplier/SupplierEditDialog';
import { FileUploadDialog } from '@/components/supplier/FileUploadDialog';
import type { Supplier } from '@shared/schema';

const SupplierDetailRefactored = () => {
  const { id } = useParams();
  const supplierId = id || '';

  // Custom hook for all supplier data and operations
  const {
    supplier,
    brands,
    contacts,
    conversations,
    files,
    isLoading,
    updateSupplier,
    createBrand,
    createContact,
    createConversation,
    uploadFile,
    deleteBrand,
    deleteContact,
    deleteConversation,
    isUpdating,
    isCreatingBrand,
    isCreatingContact,
    isCreatingConversation,
    isUploadingFile
  } = useSupplierDetail(supplierId);

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Dialog states
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [fileUploadDialogOpen, setFileUploadDialogOpen] = useState(false);
  const [dialogStates, setDialogStates] = useState({
    brand: false,
    contact: false,
    conversation: false,
    editBrand: false,
    editContact: false,
    editConversation: false
  });

  const handleEditStart = () => {
    console.log('🔥 EDIT BUTTON CLICKED - Opening Dialog', { 
      supplier: supplier?.tradeName, 
      showEditDialog 
    });
    
    if (!supplier) {
      console.error('❌ No supplier data available');
      return;
    }
    
    setShowEditDialog(true);
    console.log('✅ Edit dialog opened');
  };

  const handleEditCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    try {
      await updateSupplier(editForm);
      setIsEditing(false);
      setEditForm({});
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const handleFormChange = (updates: Partial<Supplier>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  };

  // Dialog handlers
  const handleAddBrand = () => setBrandDialogOpen(true);
  const handleEditBrand = (brand: any) => console.log('Edit brand:', brand);
  const handleDeleteBrand = async (brandId: number) => {
    try {
      await deleteBrand(brandId);
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  const handleAddContact = () => setContactDialogOpen(true);
  const handleEditContact = (contact: any) => console.log('Edit contact:', contact);
  const handleDeleteContact = async (contactId: number) => {
    try {
      await deleteContact(contactId);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleAddConversation = () => setConversationDialogOpen(true);
  const handleEditConversation = (conversation: any) => console.log('Edit conversation:', conversation);
  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  const handleUploadFile = () => setFileUploadDialogOpen(true);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fornecedor não encontrado</h2>
          <Link href="/minha-area">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Meus Fornecedores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/minha-area">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {supplier.tradeName}
              {isEditing && <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">Editando</span>}
            </h1>
            <p className="text-gray-600">{supplier.corporateName}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleEditStart} 
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Informações
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="conversations">
                Conversas ({conversations.length})
              </TabsTrigger>
              <TabsTrigger value="brands">
                Marcas ({brands.length})
              </TabsTrigger>
              <TabsTrigger value="contacts">
                Contatos ({contacts.length})
              </TabsTrigger>
              <TabsTrigger value="files">
                Arquivos ({files.length})
              </TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="info" className="mt-6">
              {isEditing ? (
                <SupplierInfoForm
                  supplier={supplier}
                  editForm={editForm}
                  onFormChange={handleFormChange}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                  isLoading={isUpdating}
                />
              ) : (
                <SupplierInfoDisplay supplier={supplier} />
              )}
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="mt-6">
              <ConversationList
                conversations={conversations}
                onAdd={handleAddConversation}
                onEdit={handleEditConversation}
                onDelete={handleDeleteConversation}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Brands Tab */}
            <TabsContent value="brands" className="mt-6">
              <BrandList
                brands={brands}
                onAdd={handleAddBrand}
                onEdit={handleEditBrand}
                onDelete={handleDeleteBrand}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-6">
              <ContactList
                contacts={contacts}
                onAdd={handleAddContact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="mt-6">
              <FileList
                files={files}
                onUpload={handleUploadFile}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BrandDialog
        open={brandDialogOpen}
        onClose={() => setBrandDialogOpen(false)}
        onSave={createBrand}
        supplierId={supplierId}
        isLoading={isCreatingBrand}
      />

      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        onSave={createContact}
        supplierId={supplierId}
        isLoading={isCreatingContact}
      />

      <ConversationDialog
        open={conversationDialogOpen}
        onClose={() => setConversationDialogOpen(false)}
        onSave={createConversation}
        onUploadFile={(file, name, type) => uploadFile({ file, name, type })}
        supplierId={supplierId}
        isLoading={isCreatingConversation}
      />

      <FileUploadDialog
        open={fileUploadDialogOpen}
        onClose={() => setFileUploadDialogOpen(false)}
        onUpload={(file, name, type) => uploadFile({ file, name, type })}
        supplierId={supplierId}
        isLoading={isUploadingFile}
      />

      <SupplierEditDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={updateSupplier}
        supplier={supplier}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default SupplierDetailRefactored;
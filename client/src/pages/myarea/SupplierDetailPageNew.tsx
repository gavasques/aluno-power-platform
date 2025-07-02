import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  MessageSquare, 
  User, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  Eye,
  Save,
  X,
  Paperclip
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Supplier, 
  SupplierContact, 
  SupplierBrand, 
  SupplierFile,
  SupplierConversation,
  InsertSupplierContact,
  InsertSupplierBrand,
  InsertSupplierFile,
  InsertSupplierConversation
} from '@shared/schema';

const SupplierDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});

  // Dialog states
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [editBrandDialogOpen, setEditBrandDialogOpen] = useState(false);
  const [editContactDialogOpen, setEditContactDialogOpen] = useState(false);
  const [editConversationDialogOpen, setEditConversationDialogOpen] = useState(false);

  // Form states
  const [brandForm, setBrandForm] = useState<InsertSupplierBrand>({
    supplierId: parseInt(id || '0'),
    userId: 1,
    name: '',
    description: '',
    logo: '',
  });

  const [contactForm, setContactForm] = useState<InsertSupplierContact>({
    supplierId: parseInt(id || '0'),
    userId: 1,
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    position: '',
    notes: '',
  });

  const [conversationForm, setConversationForm] = useState<InsertSupplierConversation>({
    supplierId: parseInt(id || '0'),
    userId: 1,
    subject: '',
    content: '',
    channel: 'whatsapp',
    status: 'open',
    outcome: '',
    contactPerson: '',
    nextFollowUp: null,
    priority: 'medium',
  });

  // Edit item states
  const [editingBrand, setEditingBrand] = useState<SupplierBrand | null>(null);
  const [editingContact, setEditingContact] = useState<SupplierContact | null>(null);
  const [editingConversation, setEditingConversation] = useState<SupplierConversation | null>(null);

  // Pagination
  const [conversationPage, setConversationPage] = useState(1);
  const conversationsPerPage = 10;

  // Fetch supplier details
  const { data: supplier, isLoading } = useQuery<Supplier>({
    queryKey: [`/api/suppliers/${id}`],
  });

  // Fetch related data
  const { data: contacts = [] } = useQuery<SupplierContact[]>({
    queryKey: [`/api/suppliers/${id}/contacts`],
    enabled: !!id,
  });

  const { data: brands = [] } = useQuery<SupplierBrand[]>({
    queryKey: [`/api/suppliers/${id}/brands`],
    enabled: !!id,
  });

  const { data: files = [] } = useQuery<SupplierFile[]>({
    queryKey: [`/api/suppliers/${id}/files`],
    enabled: !!id,
  });

  const { data: conversations = [] } = useQuery<SupplierConversation[]>({
    queryKey: [`/api/suppliers/${id}/conversations`],
    enabled: !!id,
  });

  // Mutations
  const updateSupplierMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) => 
      apiRequest(`/api/suppliers/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}`] });
      setIsEditing(false);
      toast({ title: "Fornecedor atualizado com sucesso!" });
    },
  });

  // #1 - Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/suppliers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Fornecedor removido com sucesso!" });
      window.location.href = '/myarea/suppliers';
    },
  });

  // Brand mutations
  const addBrandMutation = useMutation({
    mutationFn: (data: InsertSupplierBrand) => 
      apiRequest(`/api/suppliers/${id}/brands`, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/brands`] });
      setBrandDialogOpen(false);
      setBrandForm({
        supplierId: parseInt(id || '0'),
        userId: 1,
        name: '',
        description: '',
        logo: '',
      });
      toast({ title: "Marca adicionada com sucesso!" });
    },
  });

  // #2 - Edit brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: (data: { brandId: number; brand: Partial<SupplierBrand> }) => 
      apiRequest(`/api/supplier-brands/${data.brandId}`, { 
        method: 'PUT', 
        body: JSON.stringify(data.brand),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/brands`] });
      setEditBrandDialogOpen(false);
      setEditingBrand(null);
      toast({ title: "Marca atualizada com sucesso!" });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId: number) => 
      apiRequest(`/api/supplier-brands/${brandId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/brands`] });
      toast({ title: "Marca removida com sucesso!" });
    },
  });

  // #3 - Contact mutations with dialog close fix
  const addContactMutation = useMutation({
    mutationFn: (data: InsertSupplierContact) => 
      apiRequest(`/api/suppliers/${id}/contacts`, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/contacts`] });
      setContactDialogOpen(false); // Close dialog
      setContactForm({ // Reset form
        supplierId: parseInt(id || '0'),
        userId: 1,
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        position: '',
        notes: '',
      });
      toast({ title: "Contato adicionado com sucesso!" });
    },
  });

  // #4 - Edit contact mutation
  const updateContactMutation = useMutation({
    mutationFn: (data: { contactId: number; contact: Partial<SupplierContact> }) => 
      apiRequest(`/api/supplier-contacts/${data.contactId}`, { 
        method: 'PUT', 
        body: JSON.stringify(data.contact),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/contacts`] });
      setEditContactDialogOpen(false);
      setEditingContact(null);
      toast({ title: "Contato atualizado com sucesso!" });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) => 
      apiRequest(`/api/supplier-contacts/${contactId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/contacts`] });
      toast({ title: "Contato removido com sucesso!" });
    },
  });

  // #5 - Conversation mutations with file attachments
  const addConversationMutation = useMutation({
    mutationFn: (data: InsertSupplierConversation) => 
      apiRequest(`/api/suppliers/${id}/conversations`, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/conversations`] });
      setConversationDialogOpen(false);
      setConversationForm({
        supplierId: parseInt(id || '0'),
        userId: 1,
        subject: '',
        content: '',
        channel: 'whatsapp',
        status: 'open',
        outcome: '',
        contactPerson: '',
        nextFollowUp: null,
        priority: 'medium',
      });
      toast({ title: "Conversa registrada com sucesso!" });
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: (data: { conversationId: number; conversation: Partial<SupplierConversation> }) => 
      apiRequest(`/api/supplier-conversations/${data.conversationId}`, { 
        method: 'PUT', 
        body: JSON.stringify(data.conversation),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/conversations`] });
      setEditConversationDialogOpen(false);
      setEditingConversation(null);
      toast({ title: "Conversa atualizada com sucesso!" });
    },
  });

  // Helper functions
  const handleSaveSupplier = () => {
    updateSupplierMutation.mutate(editForm);
  };

  const handleDeleteSupplier = () => {
    if (confirm('Tem certeza que deseja remover este fornecedor? Esta ação não pode ser desfeita.')) {
      deleteSupplierMutation.mutate();
    }
  };

  const handleEditBrand = (brand: SupplierBrand) => {
    setEditingBrand(brand);
    setEditBrandDialogOpen(true);
  };

  const handleSaveBrand = () => {
    if (editingBrand) {
      updateBrandMutation.mutate({
        brandId: editingBrand.id,
        brand: editingBrand
      });
    }
  };

  const handleEditContact = (contact: SupplierContact) => {
    setEditingContact(contact);
    setEditContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (editingContact) {
      updateContactMutation.mutate({
        contactId: editingContact.id,
        contact: editingContact
      });
    }
  };

  const handleEditConversation = (conversation: SupplierConversation) => {
    setEditingConversation(conversation);
    setEditConversationDialogOpen(true);
  };

  const handleSaveConversation = () => {
    if (editingConversation) {
      updateConversationMutation.mutate({
        conversationId: editingConversation.id,
        conversation: editingConversation
      });
    }
  };

  // Pagination for conversations
  const paginatedConversations = conversations.slice(
    (conversationPage - 1) * conversationsPerPage,
    conversationPage * conversationsPerPage
  );

  const totalPages = Math.ceil(conversations.length / conversationsPerPage);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Fornecedor não encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">O fornecedor solicitado não foi encontrado.</p>
          <div className="mt-6">
            <Link href="/myarea/suppliers">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Fornecedores
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/myarea/suppliers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.tradeName}</h1>
            <p className="text-gray-600">{supplier.corporateName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* #1 - Delete supplier button */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSupplier}
            disabled={deleteSupplierMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remover Fornecedor
          </Button>
          {!isEditing ? (
            <Button onClick={() => {
              setIsEditing(true);
              setEditForm(supplier);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSaveSupplier}
                disabled={updateSupplierMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informações do Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input
                      id="tradeName"
                      value={editForm.tradeName || ''}
                      onChange={(e) => setEditForm({...editForm, tradeName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="corporateName">Razão Social</Label>
                    <Input
                      id="corporateName"
                      value={editForm.corporateName || ''}
                      onChange={(e) => setEditForm({...editForm, corporateName: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{supplier.tradeName}</h3>
                    <p className="text-sm text-gray-600">{supplier.corporateName}</p>
                  </div>
                  {supplier.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Descrição</h4>
                      <p className="text-gray-600">{supplier.description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Tabs defaultValue="brands" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="brands">Marcas</TabsTrigger>
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
              <TabsTrigger value="conversations">Conversas</TabsTrigger>
              <TabsTrigger value="files">Arquivos</TabsTrigger>
            </TabsList>

            {/* Brands Tab */}
            <TabsContent value="brands" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Marcas</h3>
                <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Marca
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Marca</DialogTitle>
                      <DialogDescription>
                        Adicione uma nova marca para este fornecedor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="brandName">Nome da Marca</Label>
                        <Input
                          id="brandName"
                          value={brandForm.name}
                          onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                          placeholder="Digite o nome da marca"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brandDescription">Descrição</Label>
                        <Textarea
                          id="brandDescription"
                          value={brandForm.description || ''}
                          onChange={(e) => setBrandForm({...brandForm, description: e.target.value})}
                          placeholder="Descrição da marca (opcional)"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setBrandDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => addBrandMutation.mutate(brandForm)}
                          disabled={addBrandMutation.isPending || !brandForm.name}
                        >
                          {addBrandMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brands.map((brand) => (
                  <Card key={brand.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{brand.name}</h4>
                          {brand.description && (
                            <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {/* #2 - Edit brand button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBrandMutation.mutate(brand.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {brands.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="mx-auto h-8 w-8 mb-2" />
                  <p>Nenhuma marca cadastrada</p>
                </div>
              )}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Contatos</h3>
                <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Contato
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Contato</DialogTitle>
                      <DialogDescription>
                        Adicione um novo contato para este fornecedor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contactName">Nome</Label>
                        <Input
                          id="contactName"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="Nome do contato"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactEmail">Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={contactForm.email || ''}
                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPosition">Cargo</Label>
                          <Input
                            id="contactPosition"
                            value={contactForm.position || ''}
                            onChange={(e) => setContactForm({...contactForm, position: e.target.value})}
                            placeholder="Cargo/Função"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactPhone">Telefone</Label>
                          <Input
                            id="contactPhone"
                            value={contactForm.phone || ''}
                            onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                          <Input
                            id="contactWhatsapp"
                            value={contactForm.whatsapp || ''}
                            onChange={(e) => setContactForm({...contactForm, whatsapp: e.target.value})}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contactNotes">Observações</Label>
                        <Textarea
                          id="contactNotes"
                          value={contactForm.notes || ''}
                          onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
                          placeholder="Observações sobre o contato"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setContactDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => addContactMutation.mutate(contactForm)}
                          disabled={addContactMutation.isPending || !contactForm.name}
                        >
                          {addContactMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{contact.name}</span>
                          </div>
                          {contact.position && (
                            <p className="text-sm text-gray-600">{contact.position}</p>
                          )}
                          {contact.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.whatsapp && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {contact.whatsapp}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {/* #4 - Edit contact button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {contacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="mx-auto h-8 w-8 mb-2" />
                  <p>Nenhum contato cadastrado</p>
                </div>
              )}
            </TabsContent>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Conversas ({conversations.length})</h3>
                <Dialog open={conversationDialogOpen} onOpenChange={setConversationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conversa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Nova Conversa</DialogTitle>
                      <DialogDescription>
                        Registre uma nova conversa ou interação com o fornecedor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="conversationSubject">Assunto</Label>
                        <Input
                          id="conversationSubject"
                          value={conversationForm.subject}
                          onChange={(e) => setConversationForm({...conversationForm, subject: e.target.value})}
                          placeholder="Assunto da conversa"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conversationContent">Conteúdo</Label>
                        <Textarea
                          id="conversationContent"
                          value={conversationForm.content}
                          onChange={(e) => setConversationForm({...conversationForm, content: e.target.value})}
                          placeholder="Descrição da conversa..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="conversationChannel">Canal</Label>
                          <Select
                            value={conversationForm.channel}
                            onValueChange={(value) => setConversationForm({...conversationForm, channel: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Telefone</SelectItem>
                              <SelectItem value="meeting">Reunião</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="conversationPriority">Prioridade</Label>
                          <Select
                            value={conversationForm.priority}
                            onValueChange={(value) => setConversationForm({...conversationForm, priority: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* #5 - File attachment input */}
                      <div>
                        <Label htmlFor="conversationAttachment">Anexo (Opcional)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="conversationAttachment"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('conversationAttachment')?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Anexar Arquivo
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setConversationDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => addConversationMutation.mutate(conversationForm)}
                          disabled={addConversationMutation.isPending || !conversationForm.subject || !conversationForm.content}
                        >
                          {addConversationMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* #5 - Paginated conversations */}
              <div className="space-y-3">
                {paginatedConversations.map((conversation) => (
                  <Card key={conversation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{conversation.subject}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{conversation.channel}</Badge>
                              <Badge variant={conversation.priority === 'high' ? 'destructive' : conversation.priority === 'medium' ? 'default' : 'secondary'}>
                                {conversation.priority === 'high' ? 'Alta' : conversation.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{conversation.content}</p>
                          {conversation.outcome && (
                            <p className="text-sm text-blue-600">Resultado: {conversation.outcome}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date(conversation.createdAt).toLocaleDateString('pt-BR')}</span>
                            {conversation.contactPerson && (
                              <span>Contato: {conversation.contactPerson}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          {/* #5 - Edit conversation button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConversation(conversation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* #5 - Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConversationPage(Math.max(1, conversationPage - 1))}
                    disabled={conversationPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {conversationPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConversationPage(Math.min(totalPages, conversationPage + 1))}
                    disabled={conversationPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}

              {conversations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p>Nenhuma conversa registrada</p>
                </div>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Arquivos</h3>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Arquivo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-gray-400" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {files.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p>Nenhum arquivo enviado</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Marcas:</span>
                <Badge variant="secondary">{brands.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contatos:</span>
                <Badge variant="secondary">{contacts.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversas:</span>
                <Badge variant="secondary">{conversations.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arquivos:</span>
                <Badge variant="secondary">{files.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {conversations.slice(0, 3).map((conversation) => (
                  <div key={conversation.id} className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">{conversation.subject}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* #2 - Edit Brand Dialog */}
      <Dialog open={editBrandDialogOpen} onOpenChange={setEditBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Marca</DialogTitle>
            <DialogDescription>
              Edite as informações da marca.
            </DialogDescription>
          </DialogHeader>
          {editingBrand && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editBrandName">Nome da Marca</Label>
                <Input
                  id="editBrandName"
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({...editingBrand, name: e.target.value})}
                  placeholder="Digite o nome da marca"
                />
              </div>
              <div>
                <Label htmlFor="editBrandDescription">Descrição</Label>
                <Textarea
                  id="editBrandDescription"
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({...editingBrand, description: e.target.value})}
                  placeholder="Descrição da marca (opcional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditBrandDialogOpen(false);
                    setEditingBrand(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveBrand}
                  disabled={updateBrandMutation.isPending || !editingBrand.name}
                >
                  {updateBrandMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* #4 - Edit Contact Dialog */}
      <Dialog open={editContactDialogOpen} onOpenChange={setEditContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Edite as informações do contato.
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editContactName">Nome</Label>
                <Input
                  id="editContactName"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                  placeholder="Nome do contato"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editContactEmail">Email</Label>
                  <Input
                    id="editContactEmail"
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="editContactPosition">Cargo</Label>
                  <Input
                    id="editContactPosition"
                    value={editingContact.position || ''}
                    onChange={(e) => setEditingContact({...editingContact, position: e.target.value})}
                    placeholder="Cargo/Função"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editContactPhone">Telefone</Label>
                  <Input
                    id="editContactPhone"
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="editContactWhatsapp">WhatsApp</Label>
                  <Input
                    id="editContactWhatsapp"
                    value={editingContact.whatsapp || ''}
                    onChange={(e) => setEditingContact({...editingContact, whatsapp: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editContactNotes">Observações</Label>
                <Textarea
                  id="editContactNotes"
                  value={editingContact.notes || ''}
                  onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})}
                  placeholder="Observações sobre o contato"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditContactDialogOpen(false);
                    setEditingContact(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveContact}
                  disabled={updateContactMutation.isPending || !editingContact.name}
                >
                  {updateContactMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* #5 - Edit Conversation Dialog */}
      <Dialog open={editConversationDialogOpen} onOpenChange={setEditConversationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conversa</DialogTitle>
            <DialogDescription>
              Edite as informações da conversa.
            </DialogDescription>
          </DialogHeader>
          {editingConversation && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editConversationSubject">Assunto</Label>
                <Input
                  id="editConversationSubject"
                  value={editingConversation.subject}
                  onChange={(e) => setEditingConversation({...editingConversation, subject: e.target.value})}
                  placeholder="Assunto da conversa"
                />
              </div>
              <div>
                <Label htmlFor="editConversationContent">Conteúdo</Label>
                <Textarea
                  id="editConversationContent"
                  value={editingConversation.content}
                  onChange={(e) => setEditingConversation({...editingConversation, content: e.target.value})}
                  placeholder="Descrição da conversa..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="editConversationOutcome">Resultado</Label>
                <Textarea
                  id="editConversationOutcome"
                  value={editingConversation.outcome || ''}
                  onChange={(e) => setEditingConversation({...editingConversation, outcome: e.target.value})}
                  placeholder="Resultado da conversa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editConversationChannel">Canal</Label>
                  <Select
                    value={editingConversation.channel}
                    onValueChange={(value) => setEditingConversation({...editingConversation, channel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editConversationPriority">Prioridade</Label>
                  <Select
                    value={editingConversation.priority}
                    onValueChange={(value) => setEditingConversation({...editingConversation, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditConversationDialogOpen(false);
                    setEditingConversation(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveConversation}
                  disabled={updateConversationMutation.isPending || !editingConversation.subject}
                >
                  {updateConversationMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDetailPage;
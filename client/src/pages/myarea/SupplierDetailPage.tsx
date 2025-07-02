import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
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
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Supplier, 
  SupplierContact, 
  SupplierBrand, 
  SupplierFile,
  InsertSupplierContact,
  InsertSupplierBrand,
  InsertSupplierFile
} from '@shared/schema';

const SupplierDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});

  // Fetch supplier details
  const { data: supplier, isLoading } = useQuery<Supplier>({
    queryKey: [`/api/suppliers/${id}`],
  });

  // Fetch contacts
  const { data: contacts = [] } = useQuery<SupplierContact[]>({
    queryKey: [`/api/suppliers/${id}/contacts`],
    enabled: !!id,
  });

  // Fetch brands
  const { data: brands = [] } = useQuery<SupplierBrand[]>({
    queryKey: [`/api/suppliers/${id}/brands`],
    enabled: !!id,
  });

  // Fetch files
  const { data: files = [] } = useQuery<SupplierFile[]>({
    queryKey: [`/api/suppliers/${id}/files`],
    enabled: !!id,
  });

  // Mutations
  const updateSupplierMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) => 
      apiRequest(`/api/suppliers/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}`] });
      setIsEditing(false);
      toast({ title: "Fornecedor atualizado com sucesso!" });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: (data: InsertSupplierContact) => 
      apiRequest(`/api/suppliers/${id}/contacts`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/contacts`] });
      toast({ title: "Contato adicionado com sucesso!" });
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

  const addBrandMutation = useMutation({
    mutationFn: (data: InsertSupplierBrand) => 
      apiRequest(`/api/suppliers/${id}/brands`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/brands`] });
      toast({ title: "Marca adicionada com sucesso!" });
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

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest(`/api/suppliers/${id}/files`, { 
        method: 'POST', 
        body: formData,
        headers: {} // Remove Content-Type para FormData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/files`] });
      toast({ title: "Arquivo enviado com sucesso!" });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => 
      apiRequest(`/api/supplier-files/${fileId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suppliers/${id}/files`] });
      toast({ title: "Arquivo removido com sucesso!" });
    },
  });

  // Contact form
  const [contactForm, setContactForm] = useState<InsertSupplierContact>({
    supplierId: parseInt(id || '0'),
    userId: 1, // TODO: Get from auth context
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    position: '',
    notes: '',
  });

  // Brand form
  const [brandForm, setBrandForm] = useState<InsertSupplierBrand>({
    supplierId: parseInt(id || '0'),
    userId: 1, // TODO: Get from auth context
    name: '',
    description: '',
    logo: '',
  });

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('catalog');

  const handleEditStart = () => {
    setEditForm({
      tradeName: supplier?.tradeName || '',
      corporateName: supplier?.corporateName || '',
      description: supplier?.description || '',
      notes: supplier?.notes || '',
      website: supplier?.website || '',
      commercialEmail: supplier?.commercialEmail || '',
      supportEmail: supplier?.supportEmail || '',
    });
    setIsEditing(true);
  };

  const handleEditSave = () => {
    updateSupplierMutation.mutate(editForm);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleAddContact = () => {
    addContactMutation.mutate(contactForm);
    setContactForm({
      supplierId: parseInt(id || '0'),
      userId: 1,
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      position: '',
      notes: '',
    });
  };

  const handleAddBrand = () => {
    addBrandMutation.mutate(brandForm);
    setBrandForm({
      supplierId: parseInt(id || '0'),
      userId: 1,
      name: '',
      description: '',
      logo: '',
    });
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', fileType);
    formData.append('supplierId', id || '');
    formData.append('userId', '1'); // TODO: Get from auth context

    uploadFileMutation.mutate(formData);
    setSelectedFile(null);
    setFileType('catalog');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-muted-foreground">Carregando fornecedor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fornecedor não encontrado</h3>
            <p className="text-gray-600 mb-4">O fornecedor solicitado não existe ou você não tem permissão para visualizá-lo.</p>
            <Link href="/minha-area/fornecedores">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/minha-area/fornecedores">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Fornecedores
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{supplier.tradeName}</h1>
              <p className="text-gray-600">{supplier.corporateName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {supplier.isVerified && (
              <Badge className="bg-green-100 text-green-700">
                Verificado
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="informacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="marcas">Marcas</TabsTrigger>
                <TabsTrigger value="contatos">Contatos</TabsTrigger>
                <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              </TabsList>

              {/* Informações Tab */}
              <TabsContent value="informacoes" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Informações do Fornecedor</h3>
                    {!isEditing ? (
                      <Button onClick={handleEditStart} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleEditSave} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                        <Button onClick={handleEditCancel} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Nome Comercial</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.tradeName || ''}
                            onChange={(e) => setEditForm({ ...editForm, tradeName: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{supplier.tradeName}</p>
                        )}
                      </div>

                      <div>
                        <Label>Razão Social</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.corporateName || ''}
                            onChange={(e) => setEditForm({ ...editForm, corporateName: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{supplier.corporateName}</p>
                        )}
                      </div>

                      <div>
                        <Label>Website</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.website || ''}
                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{supplier.website || 'Não informado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Email Comercial</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.commercialEmail || ''}
                            onChange={(e) => setEditForm({ ...editForm, commercialEmail: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{supplier.commercialEmail || 'Não informado'}</p>
                        )}
                      </div>

                      <div>
                        <Label>Email de Suporte</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.supportEmail || ''}
                            onChange={(e) => setEditForm({ ...editForm, supportEmail: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{supplier.supportEmail || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">{supplier.description || 'Nenhuma descrição disponível'}</p>
                    )}
                  </div>

                  <div>
                    <Label>Notas</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">{supplier.notes || 'Nenhuma nota adicional'}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Marcas Tab */}
              <TabsContent value="marcas" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Marcas do Fornecedor</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Marca
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Marca</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Nome da Marca</Label>
                            <Input
                              value={brandForm.name}
                              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                              placeholder="Digite o nome da marca"
                            />
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Textarea
                              value={brandForm.description || ''}
                              onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                              placeholder="Descrição da marca (opcional)"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button onClick={handleAddBrand}>
                              Adicionar Marca
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brands.map((brand) => (
                      <Card key={brand.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{brand.name}</h4>
                              {brand.description && (
                                <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                Adicionado em {new Date(brand.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBrandMutation.mutate(brand.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {brands.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhuma marca cadastrada para este fornecedor.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Contatos Tab */}
              <TabsContent value="contatos" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Contatos do Fornecedor</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Contato
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Contato</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Nome</Label>
                            <Input
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="Nome do contato"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={contactForm.email || ''}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="email@exemplo.com"
                              type="email"
                            />
                          </div>
                          <div>
                            <Label>Telefone</Label>
                            <Input
                              value={contactForm.phone || ''}
                              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                          <div>
                            <Label>WhatsApp</Label>
                            <Input
                              value={contactForm.whatsapp || ''}
                              onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                          <div>
                            <Label>Cargo</Label>
                            <Input
                              value={contactForm.position || ''}
                              onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                              placeholder="Ex: Gerente Comercial"
                            />
                          </div>
                          <div>
                            <Label>Observação</Label>
                            <Textarea
                              value={contactForm.notes || ''}
                              onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                              placeholder="Observações sobre este contato"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button onClick={handleAddContact}>
                              Adicionar Contato
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
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <h4 className="font-medium text-gray-900">{contact.name}</h4>
                              </div>
                              
                              {contact.position && (
                                <p className="text-sm text-gray-600 mb-2">{contact.position}</p>
                              )}

                              <div className="space-y-1">
                                {contact.email && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span>{contact.email}</span>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}
                                {contact.whatsapp && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MessageSquare className="h-3 w-3 text-gray-400" />
                                    <span>{contact.whatsapp}</span>
                                  </div>
                                )}
                              </div>

                              {contact.notes && (
                                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                                  {contact.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {contacts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum contato cadastrado para este fornecedor.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Arquivos Tab */}
              <TabsContent value="arquivos" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Arquivos do Fornecedor</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Arquivo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enviar Novo Arquivo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Tipo de Arquivo</Label>
                            <select
                              value={fileType}
                              onChange={(e) => setFileType(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="catalog">Catálogo</option>
                              <option value="price_sheet">Tabela de Preços</option>
                              <option value="presentation">Apresentação</option>
                              <option value="certificate">Certificado</option>
                              <option value="other">Outro</option>
                            </select>
                          </div>
                          <div>
                            <Label>Arquivo</Label>
                            <input
                              type="file"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button onClick={handleFileUpload} disabled={!selectedFile}>
                              Enviar Arquivo
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <Card key={file.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <h4 className="font-medium text-gray-900 text-sm">{file.name}</h4>
                              </div>
                              
                              <div className="space-y-1 text-xs text-gray-600">
                                <p>Tipo: {file.type}</p>
                                <p>Tamanho: {formatFileSize(file.fileSize)}</p>
                                <p>Enviado: {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</p>
                              </div>

                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" asChild>
                                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver
                                  </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={file.fileUrl} download>
                                    <Download className="h-3 w-3 mr-1" />
                                    Baixar
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFileMutation.mutate(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {files.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum arquivo enviado para este fornecedor.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDetailPage;
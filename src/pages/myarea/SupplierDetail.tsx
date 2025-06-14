import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Star, ArrowLeft, Edit, Plus, Trash2, Phone, Mail, MapPin, Building2, Upload, FileText, Download, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes: string;
}

interface Branch {
  id: string;
  name: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  phone: string;
  email: string;
}

interface SupplierFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

interface Conversation {
  id: string;
  date: string;
  category: 'email' | 'whatsapp' | 'telefone' | 'pessoalmente' | 'outro';
  description: string;
  files?: SupplierFile[];
}

interface Supplier {
  id: string;
  tradeName: string;
  corporateName: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  notes: string;
  email: string;
  mainContact: string;
  phone: string;
  whatsapp: string;
  country: string;
  contacts: Contact[];
  branches: Branch[];
  conversations: Conversation[];
  files: SupplierFile[];
}

const countries = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "PY", name: "Paraguai", flag: "🇵🇾" },
  { code: "UY", name: "Uruguai", flag: "🇺🇾" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TR", name: "Turquia", flag: "🇹🇷" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "OTHER", name: "Outros Países", flag: "🌍" }
];

const conversationCategories = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'telefone', label: 'Telefone', icon: '📞' },
  { value: 'pessoalmente', label: 'Pessoalmente', icon: '👥' },
  { value: 'outro', label: 'Outro Local', icon: '📍' }
];

const mockSupplier: Supplier = {
  id: "1",
  tradeName: "TechSupply Brasil",
  corporateName: "TechSupply Brasil Importação e Exportação Ltda",
  category: "Eletrônicos",
  description: "Importador especializado em eletrônicos e acessórios tech",
  logo: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=100&h=100&fit=crop",
  verified: true,
  rating: 4.5,
  reviewCount: 128,
  notes: "Empresa confiável com histórico de 15 anos no mercado. Especializada em produtos Apple e Samsung.",
  email: "contato@techsupplybrasil.com.br",
  mainContact: "João Silva",
  phone: "(11) 3456-7890",
  whatsapp: "(11) 99876-5432",
  country: "BR",
  contacts: [
    {
      id: "1",
      name: "João Silva",
      role: "Gerente Comercial",
      phone: "(11) 3456-7890",
      whatsapp: "(11) 99876-5432",
      email: "joao@techsupplybrasil.com.br",
      notes: "Responsável por novos parceiros"
    }
  ],
  branches: [
    {
      id: "1",
      name: "Matriz São Paulo",
      corporateName: "TechSupply Brasil Importação e Exportação Ltda",
      cnpj: "12.345.678/0001-90",
      stateRegistration: "123.456.789.123",
      address: "Rua das Flores, 123 - São Paulo/SP",
      phone: "(11) 3456-7890",
      email: "sp@techsupplybrasil.com.br"
    }
  ],
  conversations: [
    {
      id: "1",
      date: "2024-01-15",
      category: "email",
      description: "Discussão sobre novos produtos para 2024"
    }
  ],
  files: []
};

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier>(mockSupplier);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isAddingConversation, setIsAddingConversation] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, forConversation?: boolean) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.size <= 3 * 1024 * 1024); // 3MB limit
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Arquivos muito grandes",
        description: "Alguns arquivos excedem o limite de 3MB e foram removidos.",
        variant: "destructive"
      });
    }

    if (forConversation) {
      setPendingFiles(prev => [...prev, ...validFiles]);
    } else {
      const newFiles: SupplierFile[] = validFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0]
      }));

      setSupplier(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));

      toast({
        title: "Arquivos adicionados",
        description: `${validFiles.length} arquivo(s) foram adicionados com sucesso.`
      });
    }
  };

  const handleSaveSupplier = (updatedData: Partial<Supplier>) => {
    setSupplier(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
    toast({
      title: "Fornecedor atualizado",
      description: "As informações foram salvas com sucesso."
    });
  };

  const handleSaveContact = (contactData: Omit<Contact, 'id'>) => {
    if (editingContact) {
      setSupplier(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => 
          c.id === editingContact.id ? { ...contactData, id: editingContact.id } : c
        )
      }));
      setEditingContact(null);
      toast({
        title: "Contato atualizado",
        description: "As informações do contato foram atualizadas."
      });
    } else {
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString()
      };
      setSupplier(prev => ({
        ...prev,
        contacts: [...prev.contacts, newContact]
      }));
      setIsAddingContact(false);
      toast({
        title: "Contato adicionado",
        description: "O novo contato foi adicionado com sucesso."
      });
    }
  };

  const handleDeleteContact = (contactId: string) => {
    setSupplier(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId)
    }));
    toast({
      title: "Contato removido",
      description: "O contato foi removido com sucesso."
    });
  };

  const handleSaveBranch = (branchData: Omit<Branch, 'id'>) => {
    if (editingBranch) {
      setSupplier(prev => ({
        ...prev,
        branches: prev.branches.map(b => 
          b.id === editingBranch.id ? { ...branchData, id: editingBranch.id } : b
        )
      }));
      setEditingBranch(null);
      toast({
        title: "Filial atualizada",
        description: "As informações da filial foram atualizadas."
      });
    } else {
      const newBranch: Branch = {
        ...branchData,
        id: Date.now().toString()
      };
      setSupplier(prev => ({
        ...prev,
        branches: [...prev.branches, newBranch]
      }));
      setIsAddingBranch(false);
      toast({
        title: "Filial adicionada",
        description: "A nova filial foi adicionada com sucesso."
      });
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    setSupplier(prev => ({
      ...prev,
      branches: prev.branches.filter(b => b.id !== branchId)
    }));
    toast({
      title: "Filial removida",
      description: "A filial foi removida com sucesso."
    });
  };

  const handleSaveConversation = (conversationData: Omit<Conversation, 'id'>) => {
    const conversationWithFiles = {
      ...conversationData,
      files: pendingFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString().split('T')[0]
      }))
    };

    if (editingConversation) {
      setSupplier(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === editingConversation.id ? { ...conversationWithFiles, id: editingConversation.id } : c
        )
      }));
      setEditingConversation(null);
    } else {
      const newConversation: Conversation = {
        ...conversationWithFiles,
        id: Date.now().toString()
      };
      setSupplier(prev => ({
        ...prev,
        conversations: [...prev.conversations, newConversation]
      }));
      setIsAddingConversation(false);
    }
    
    setPendingFiles([]);
    toast({
      title: editingConversation ? "Conversa atualizada" : "Conversa adicionada",
      description: editingConversation ? "A conversa foi atualizada com sucesso." : "A nova conversa foi adicionada com sucesso."
    });
  };

  const handleDeleteConversation = (conversationId: string) => {
    setSupplier(prev => ({
      ...prev,
      conversations: prev.conversations.filter(c => c.id !== conversationId)
    }));
    toast({
      title: "Conversa removida",
      description: "A conversa foi removida com sucesso."
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setSupplier(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido com sucesso."
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const country = countries.find(c => c.code === supplier.country);

  // Dialog state and handlers for editing supplier info, contacts, branches, conversations
  // For brevity, dialogs are implemented inline here

  // Supplier Info Edit Dialog
  const [editTradeName, setEditTradeName] = useState(supplier.tradeName);
  const [editCorporateName, setEditCorporateName] = useState(supplier.corporateName);
  const [editCategory, setEditCategory] = useState(supplier.category);
  const [editDescription, setEditDescription] = useState(supplier.description);
  const [editNotes, setEditNotes] = useState(supplier.notes);
  const [editEmail, setEditEmail] = useState(supplier.email);
  const [editMainContact, setEditMainContact] = useState(supplier.mainContact);
  const [editPhone, setEditPhone] = useState(supplier.phone);
  const [editWhatsapp, setEditWhatsapp] = useState(supplier.whatsapp);
  const [editCountry, setEditCountry] = useState(supplier.country);

  const openEditSupplier = () => {
    setEditTradeName(supplier.tradeName);
    setEditCorporateName(supplier.corporateName);
    setEditCategory(supplier.category);
    setEditDescription(supplier.description);
    setEditNotes(supplier.notes);
    setEditEmail(supplier.email);
    setEditMainContact(supplier.mainContact);
    setEditPhone(supplier.phone);
    setEditWhatsapp(supplier.whatsapp);
    setEditCountry(supplier.country);
    setIsEditing(true);
  };

  const saveSupplierEdits = () => {
    handleSaveSupplier({
      tradeName: editTradeName,
      corporateName: editCorporateName,
      category: editCategory,
      description: editDescription,
      notes: editNotes,
      email: editEmail,
      mainContact: editMainContact,
      phone: editPhone,
      whatsapp: editWhatsapp,
      country: editCountry
    });
  };

  // Contact Edit/Add Dialog
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNotes, setContactNotes] = useState("");

  const openEditContact = (contact: Contact | null) => {
    if (contact) {
      setContactName(contact.name);
      setContactRole(contact.role);
      setContactPhone(contact.phone);
      setContactWhatsapp(contact.whatsapp);
      setContactEmail(contact.email);
      setContactNotes(contact.notes);
      setEditingContact(contact);
      setIsAddingContact(false);
    } else {
      setContactName("");
      setContactRole("");
      setContactPhone("");
      setContactWhatsapp("");
      setContactEmail("");
      setContactNotes("");
      setEditingContact(null);
      setIsAddingContact(true);
    }
  };

  const saveContact = () => {
    if (!contactName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do contato.",
        variant: "destructive"
      });
      return;
    }
    handleSaveContact({
      name: contactName,
      role: contactRole,
      phone: contactPhone,
      whatsapp: contactWhatsapp,
      email: contactEmail,
      notes: contactNotes
    });
  };

  // Branch Edit/Add Dialog
  const [branchName, setBranchName] = useState("");
  const [branchCorporateName, setBranchCorporateName] = useState("");
  const [branchCnpj, setBranchCnpj] = useState("");
  const [branchStateRegistration, setBranchStateRegistration] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchEmail, setBranchEmail] = useState("");

  const openEditBranch = (branch: Branch | null) => {
    if (branch) {
      setBranchName(branch.name);
      setBranchCorporateName(branch.corporateName);
      setBranchCnpj(branch.cnpj);
      setBranchStateRegistration(branch.stateRegistration);
      setBranchAddress(branch.address);
      setBranchPhone(branch.phone);
      setBranchEmail(branch.email);
      setEditingBranch(branch);
      setIsAddingBranch(false);
    } else {
      setBranchName("");
      setBranchCorporateName("");
      setBranchCnpj("");
      setBranchStateRegistration("");
      setBranchAddress("");
      setBranchPhone("");
      setBranchEmail("");
      setEditingBranch(null);
      setIsAddingBranch(true);
    }
  };

  const saveBranch = () => {
    if (!branchName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome da filial.",
        variant: "destructive"
      });
      return;
    }
    handleSaveBranch({
      name: branchName,
      corporateName: branchCorporateName,
      cnpj: branchCnpj,
      stateRegistration: branchStateRegistration,
      address: branchAddress,
      phone: branchPhone,
      email: branchEmail
    });
  };

  // Conversation Edit/Add Dialog
  const [convDate, setConvDate] = useState("");
  const [convCategory, setConvCategory] = useState<'email' | 'whatsapp' | 'telefone' | 'pessoalmente' | 'outro'>('email');
  const [convDescription, setConvDescription] = useState("");
  const [convFiles, setConvFiles] = useState<File[]>([]);

  const openEditConversation = (conversation: Conversation | null) => {
    if (conversation) {
      setConvDate(conversation.date);
      setConvCategory(conversation.category);
      setConvDescription(conversation.description);
      setPendingFiles(conversation.files ? conversation.files.map(f => {
        // We cannot convert SupplierFile to File directly, so we keep empty array for editing files
        return new File([], f.name);
      }) : []);
      setEditingConversation(conversation);
      setIsAddingConversation(false);
    } else {
      setConvDate("");
      setConvCategory('email');
      setConvDescription("");
      setPendingFiles([]);
      setEditingConversation(null);
      setIsAddingConversation(true);
    }
  };

  const saveConversation = () => {
    if (!convDate.trim()) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data da conversa.",
        variant: "destructive"
      });
      return;
    }
    if (!convDescription.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, informe a descrição da conversa.",
        variant: "destructive"
      });
      return;
    }
    handleSaveConversation({
      date: convDate,
      category: convCategory,
      description: convDescription,
      files: [] // files are handled via pendingFiles state
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/minha-area/fornecedores')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Meus Fornecedores
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={supplier.logo}
              alt={supplier.tradeName}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{supplier.tradeName}</h1>
                {supplier.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Verificado
                  </Badge>
                )}
                {country && (
                  <Badge variant="outline">
                    {country.flag} {country.name}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{supplier.corporateName}</p>
              <Badge variant="outline">{supplier.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="branches">Filiais</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informações da Empresa</CardTitle>
                <Button
                  variant="outline"
                  onClick={openEditSupplier}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome Fantasia</Label>
                  <p className="text-muted-foreground">{supplier.tradeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Razão Social</Label>
                  <p className="text-muted-foreground">{supplier.corporateName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categoria Principal</Label>
                  <p className="text-muted-foreground">{supplier.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contato Principal</Label>
                  <p className="text-muted-foreground">{supplier.mainContact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-muted-foreground">{supplier.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-muted-foreground">{supplier.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">WhatsApp</Label>
                  <p className="text-muted-foreground">{supplier.whatsapp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">País</Label>
                  <p className="text-muted-foreground">{country?.flag} {country?.name}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Observações</Label>
                <p className="text-muted-foreground">{supplier.notes}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Contatos</h3>
            <Button onClick={() => openEditContact(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contato
            </Button>
          </div>
          
          <div className="space-y-4">
            {supplier.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <Badge variant="outline">{contact.role}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditContact(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-muted-foreground">{contact.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">WhatsApp</Label>
                      <p className="text-muted-foreground">{contact.whatsapp}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-muted-foreground">{contact.email}</p>
                    </div>
                  </div>
                  {contact.notes && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Observações</Label>
                      <p className="text-muted-foreground">{contact.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="branches" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filiais</h3>
            <Button onClick={() => openEditBranch(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Filial
            </Button>
          </div>
          
          <div className="space-y-4">
            {supplier.branches.map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {branch.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditBranch(branch)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Razão Social</Label>
                      <p className="text-muted-foreground">{branch.corporateName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">CNPJ</Label>
                      <p className="text-muted-foreground">{branch.cnpj}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Inscrição Estadual</Label>
                      <p className="text-muted-foreground">{branch.stateRegistration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-muted-foreground">{branch.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Endereço</Label>
                      <p className="text-muted-foreground">{branch.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-muted-foreground">{branch.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Arquivos</h3>
            <div>
              <input
                type="file"
                multiple
                accept="*/*"
                onChange={(e) => handleFileUpload(e)}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Arquivos
                </label>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {supplier.files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • Enviado em {file.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {supplier.files.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum arquivo enviado ainda.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Limite de 3MB por arquivo
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Conversas</h3>
            <Button onClick={() => openEditConversation(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conversa
            </Button>
          </div>

          <div className="space-y-4">
            {supplier.conversations.map((conversation) => {
              const category = conversationCategories.find(c => c.value === conversation.category);
              return (
                <Card key={conversation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{category?.icon}</span>
                          <Badge variant="outline">{category?.label}</Badge>
                          <span className="text-sm text-muted-foreground">{conversation.date}</span>
                        </div>
                        <p className="text-muted-foreground">{conversation.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditConversation(conversation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConversation(conversation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {conversation.files && conversation.files.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Arquivos anexados:</Label>
                        {conversation.files.map((file) => (
                          <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {supplier.conversations.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma conversa registrada ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Informações do Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome Fantasia"
              value={editTradeName}
              onChange={(e) => setEditTradeName(e.target.value)}
            />
            <Input
              placeholder="Razão Social"
              value={editCorporateName}
              onChange={(e) => setEditCorporateName(e.target.value)}
            />
            <Input
              placeholder="Categoria"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            />
            <Textarea
              placeholder="Descrição"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <Textarea
              placeholder="Observações"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <Input
              placeholder="Contato Principal"
              value={editMainContact}
              onChange={(e) => setEditMainContact(e.target.value)}
            />
            <Input
              placeholder="Telefone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <Input
              placeholder="WhatsApp"
              value={editWhatsapp}
              onChange={(e) => setEditWhatsapp(e.target.value)}
            />
            <Select value={editCountry} onValueChange={setEditCountry}>
              <SelectTrigger>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button onClick={saveSupplierEdits}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isAddingContact || editingContact !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingContact(false);
          setEditingContact(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Editar Contato" : "Adicionar Contato"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              placeholder="Cargo"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
            />
            <Input
              placeholder="Telefone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <Input
              placeholder="WhatsApp"
              value={contactWhatsapp}
              onChange={(e) => setContactWhatsapp(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Textarea
              placeholder="Observações"
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setIsAddingContact(false);
                setEditingContact(null);
              }}>Cancelar</Button>
              <Button onClick={saveContact}>{editingContact ? "Salvar" : "Adicionar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Branch Dialog */}
      <Dialog open={isAddingBranch || editingBranch !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingBranch(false);
          setEditingBranch(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Editar Filial" : "Adicionar Filial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <Input
              placeholder="Razão Social"
              value={branchCorporateName}
              onChange={(e) => setBranchCorporateName(e.target.value)}
            />
            <Input
              placeholder="CNPJ"
              value={branchCnpj}
              onChange={(e) => setBranchCnpj(e.target.value)}
            />
            <Input
              placeholder="Inscrição Estadual"
              value={branchStateRegistration}
              onChange={(e) => setBranchStateRegistration(e.target.value)}
            />
            <Input
              placeholder="Endereço"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
            />
            <Input
              placeholder="Telefone"
              value={branchPhone}
              onChange={(e) => setBranchPhone(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={branchEmail}
              onChange={(e) => setBranchEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setIsAddingBranch(false);
                setEditingBranch(null);
              }}>Cancelar</Button>
              <Button onClick={saveBranch}>{editingBranch ? "Salvar" : "Adicionar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Conversation Dialog */}
      <Dialog open={isAddingConversation || editingConversation !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingConversation(false);
          setEditingConversation(null);
          setPendingFiles([]);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConversation ? "Editar Conversa" : "Adicionar Conversa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              placeholder="Data"
              value={convDate}
              onChange={(e) => setConvDate(e.target.value)}
            />
            <Select value={convCategory} onValueChange={(value) => setConvCategory(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conversationCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Descrição"
              value={convDescription}
              onChange={(e) => setConvDescription(e.target.value)}
            />
            <div>
              <Label>Arquivos anexados (máx 3MB cada)</Label>
              <input
                type="file"
                multiple
                accept="*/*"
                onChange={(e) => handleFileUpload(e, true)}
                className="mt-2"
              />
              <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span>{file.name} ({formatFileSize(file.size)})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {pendingFiles.length === 0 && <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setIsAddingConversation(false);
                setEditingConversation(null);
                setPendingFiles([]);
              }}>Cancelar</Button>
              <Button onClick={saveConversation}>{editingConversation ? "Salvar" : "Adicionar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDetail;

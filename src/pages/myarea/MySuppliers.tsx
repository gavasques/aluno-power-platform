import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  MessageSquare, 
  Paperclip,
  User,
  Calendar,
  Save,
  X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface Conversation {
  id: string;
  date: string;
  subject: string;
  notes: string;
  files: string[];
}

interface MySupplier {
  id: string;
  tradeName: string;
  corporateName: string;
  category: string;
  country: string;
  description: string;
  notes: string;
  email: string;
  mainContact: string;
  phone: string;
  whatsapp: string;
  createdAt: string;
  updatedAt: string;
  contacts: Contact[];
  branches: Branch[];
  conversations: Conversation[];
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
  { code: "OT", name: "Outros Países", flag: "🌍" }
];

const mockSuppliers: MySupplier[] = [
  {
    id: "1",
    tradeName: "Tech Supply Solutions",
    corporateName: "Tech Supply Solutions Ltda",
    category: "Eletrônicos",
    country: "CN",
    description: "Fornecedor de eletrônicos e acessórios tech",
    notes: "Fornecedor confiável, trabalho há 2 anos",
    email: "contato@techsupply.com",
    mainContact: "Liu Wei",
    phone: "+86 139 0013 8000",
    whatsapp: "+86 139 0013 8000",
    createdAt: "2024-01-15",
    updatedAt: "2024-06-10",
    contacts: [
      {
        id: "1",
        name: "Liu Wei",
        role: "Gerente de Vendas",
        phone: "+86 139 0013 8000",
        whatsapp: "+86 139 0013 8000",
        email: "liu@techsupply.com",
        notes: "Fala português básico"
      }
    ],
    branches: [
      {
        id: "1",
        name: "Matriz Shenzhen",
        corporateName: "Tech Supply Solutions Ltd",
        cnpj: "N/A",
        stateRegistration: "N/A",
        address: "Huaqiang North Road, Shenzhen, China",
        phone: "+86 139 0013 8000",
        email: "shenzhen@techsupply.com"
      }
    ],
    conversations: [
      {
        id: "1",
        date: "2024-06-10",
        subject: "Cotação de smartwatches",
        notes: "Solicitei cotação para 100 unidades de smartwatches modelo X1",
        files: ["cotacao_smartwatch_jun2024.pdf"]
      }
    ]
  }
];

const MySuppliers = () => {
  const [suppliers, setSuppliers] = useState<MySupplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<MySupplier | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<MySupplier | null>(null);
  
  // Estados para edição dentro do modal
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState<Contact | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isEditingBranch, setIsEditingBranch] = useState<Branch | null>(null);
  const [isAddingConversation, setIsAddingConversation] = useState(false);
  
  const { toast } = useToast();

  const [newSupplier, setNewSupplier] = useState({
    tradeName: "",
    corporateName: "",
    category: "",
    country: "",
    description: "",
    notes: "",
    email: "",
    mainContact: "",
    phone: "",
    whatsapp: ""
  });

  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    phone: "",
    whatsapp: "",
    email: "",
    notes: ""
  });

  const [newBranch, setNewBranch] = useState({
    name: "",
    corporateName: "",
    cnpj: "",
    stateRegistration: "",
    address: "",
    phone: "",
    email: ""
  });

  const [newConversation, setNewConversation] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: "",
    notes: "",
    files: [] as string[]
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.mainContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || supplier.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const handleAddSupplier = () => {
    if (!newSupplier.tradeName || !newSupplier.country) {
      toast({
        title: "Erro",
        description: "Nome fantasia e país são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const supplier: MySupplier = {
      id: Date.now().toString(),
      ...newSupplier,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      contacts: [],
      branches: [],
      conversations: []
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({
      tradeName: "",
      corporateName: "",
      category: "",
      country: "",
      description: "",
      notes: "",
      email: "",
      mainContact: "",
      phone: "",
      whatsapp: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Fornecedor adicionado com sucesso!"
    });
  };

  const handleEditSupplier = () => {
    if (!editingSupplier) return;

    setSuppliers(suppliers.map(s => 
      s.id === editingSupplier.id 
        ? { ...editingSupplier, updatedAt: new Date().toISOString().split('T')[0] }
        : s
    ));
    
    setIsEditDialogOpen(false);
    setEditingSupplier(null);
    
    toast({
      title: "Sucesso",
      description: "Fornecedor atualizado com sucesso!"
    });
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast({
      title: "Sucesso",
      description: "Fornecedor removido com sucesso!"
    });
  };

  const getCountryFlag = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.flag : "🌍";
  };

  const getCountryName = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : "Outros";
  };

  // Funções para editar informações do fornecedor no modal
  const handleSaveSupplierInfo = () => {
    if (!selectedSupplier) return;
    
    setSuppliers(suppliers.map(s => 
      s.id === selectedSupplier.id 
        ? { ...selectedSupplier, updatedAt: new Date().toISOString().split('T')[0] }
        : s
    ));
    
    setIsEditingInfo(false);
    toast({
      title: "Sucesso",
      description: "Informações atualizadas com sucesso!"
    });
  };

  // Funções para gerenciar contatos
  const handleAddContact = () => {
    if (!selectedSupplier || !newContact.name) {
      toast({
        title: "Erro",
        description: "Nome do contato é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };

    const updatedSupplier = {
      ...selectedSupplier,
      contacts: [...selectedSupplier.contacts, contact]
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    
    setNewContact({
      name: "",
      role: "",
      phone: "",
      whatsapp: "",
      email: "",
      notes: ""
    });
    setIsAddingContact(false);
    
    toast({
      title: "Sucesso",
      description: "Contato adicionado com sucesso!"
    });
  };

  const handleEditContact = (contact: Contact) => {
    if (!selectedSupplier) return;

    const updatedSupplier = {
      ...selectedSupplier,
      contacts: selectedSupplier.contacts.map(c => c.id === contact.id ? contact : c)
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    setIsEditingContact(null);
    
    toast({
      title: "Sucesso",
      description: "Contato atualizado com sucesso!"
    });
  };

  const handleDeleteContact = (contactId: string) => {
    if (!selectedSupplier) return;

    const updatedSupplier = {
      ...selectedSupplier,
      contacts: selectedSupplier.contacts.filter(c => c.id !== contactId)
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    
    toast({
      title: "Sucesso",
      description: "Contato removido com sucesso!"
    });
  };

  // Funções para gerenciar filiais
  const handleAddBranch = () => {
    if (!selectedSupplier || !newBranch.name) {
      toast({
        title: "Erro",
        description: "Nome da filial é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const branch: Branch = {
      id: Date.now().toString(),
      ...newBranch
    };

    const updatedSupplier = {
      ...selectedSupplier,
      branches: [...selectedSupplier.branches, branch]
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    
    setNewBranch({
      name: "",
      corporateName: "",
      cnpj: "",
      stateRegistration: "",
      address: "",
      phone: "",
      email: ""
    });
    setIsAddingBranch(false);
    
    toast({
      title: "Sucesso",
      description: "Filial adicionada com sucesso!"
    });
  };

  const handleEditBranch = (branch: Branch) => {
    if (!selectedSupplier) return;

    const updatedSupplier = {
      ...selectedSupplier,
      branches: selectedSupplier.branches.map(b => b.id === branch.id ? branch : b)
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    setIsEditingBranch(null);
    
    toast({
      title: "Sucesso",
      description: "Filial atualizada com sucesso!"
    });
  };

  const handleDeleteBranch = (branchId: string) => {
    if (!selectedSupplier) return;

    const updatedSupplier = {
      ...selectedSupplier,
      branches: selectedSupplier.branches.filter(b => b.id !== branchId)
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    
    toast({
      title: "Sucesso",
      description: "Filial removida com sucesso!"
    });
  };

  // Funções para gerenciar conversas
  const handleAddConversation = () => {
    if (!selectedSupplier || !newConversation.subject) {
      toast({
        title: "Erro",
        description: "Assunto da conversa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const conversation: Conversation = {
      id: Date.now().toString(),
      ...newConversation
    };

    const updatedSupplier = {
      ...selectedSupplier,
      conversations: [...selectedSupplier.conversations, conversation]
    };

    setSelectedSupplier(updatedSupplier);
    setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? updatedSupplier : s));
    
    setNewConversation({
      date: new Date().toISOString().split('T')[0],
      subject: "",
      notes: "",
      files: []
    });
    setIsAddingConversation(false);
    
    toast({
      title: "Sucesso",
      description: "Conversa adicionada com sucesso!"
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meus Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores pessoais e histórico de contatos
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tradeName">Nome Fantasia *</Label>
                  <Input
                    id="tradeName"
                    value={newSupplier.tradeName}
                    onChange={(e) => setNewSupplier({...newSupplier, tradeName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="corporateName">Razão Social</Label>
                  <Input
                    id="corporateName"
                    value={newSupplier.corporateName}
                    onChange={(e) => setNewSupplier({...newSupplier, corporateName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="country">País *</Label>
                  <Select value={newSupplier.country} onValueChange={(value) => setNewSupplier({...newSupplier, country: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o país" />
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainContact">Contato Principal</Label>
                  <Input
                    id="mainContact"
                    value={newSupplier.mainContact}
                    onChange={(e) => setNewSupplier({...newSupplier, mainContact: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={newSupplier.whatsapp}
                    onChange={(e) => setNewSupplier({...newSupplier, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newSupplier.description}
                  onChange={(e) => setNewSupplier({...newSupplier, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSupplier}>
                Adicionar Fornecedor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, contato ou email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os países</SelectItem>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
      <div className="grid gap-6">
        {filteredSuppliers.map(supplier => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {getCountryFlag(supplier.country)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{supplier.tradeName}</CardTitle>
                      <Badge variant="outline">{getCountryName(supplier.country)}</Badge>
                    </div>
                    {supplier.category && (
                      <Badge variant="secondary" className="mb-2">
                        {supplier.category}
                      </Badge>
                    )}
                    <p className="text-muted-foreground">{supplier.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {supplier.mainContact}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {supplier.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Criado: {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>Atualizado: {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <Button onClick={() => setSelectedSupplier(supplier)}>
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Detalhes com funcionalidades de edição */}
      {selectedSupplier && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => {
          setSelectedSupplier(null);
          setIsEditingInfo(false);
          setIsAddingContact(false);
          setIsEditingContact(null);
          setIsAddingBranch(false);
          setIsEditingBranch(null);
          setIsAddingConversation(false);
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {getCountryFlag(selectedSupplier.country)}
                </div>
                <div>
                  <DialogTitle className="text-2xl">{selectedSupplier.tradeName}</DialogTitle>
                  <p className="text-muted-foreground">{selectedSupplier.corporateName}</p>
                  <Badge variant="outline">{getCountryName(selectedSupplier.country)}</Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="contacts">Contatos</TabsTrigger>
                  <TabsTrigger value="branches">Filiais</TabsTrigger>
                  <TabsTrigger value="conversations">Conversas</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Informações da Empresa</CardTitle>
                        {!isEditingInfo ? (
                          <Button onClick={() => setIsEditingInfo(true)} size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button onClick={handleSaveSupplierInfo} size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditingInfo(false)} 
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isEditingInfo ? (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Nome Fantasia</Label>
                              <p className="text-muted-foreground">{selectedSupplier.tradeName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Razão Social</Label>
                              <p className="text-muted-foreground">{selectedSupplier.corporateName || "Não informado"}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Categoria</Label>
                              <p className="text-muted-foreground">{selectedSupplier.category || "Não informado"}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">País</Label>
                              <p className="text-muted-foreground">
                                {getCountryFlag(selectedSupplier.country)} {getCountryName(selectedSupplier.country)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Descrição</Label>
                            <p className="text-muted-foreground">{selectedSupplier.description || "Nenhuma descrição"}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Observações</Label>
                            <p className="text-muted-foreground">{selectedSupplier.notes || "Nenhuma observação"}</p>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-muted-foreground">{selectedSupplier.email || "Não informado"}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Telefone</Label>
                              <p className="text-muted-foreground">{selectedSupplier.phone || "Não informado"}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">WhatsApp</Label>
                              <p className="text-muted-foreground">{selectedSupplier.whatsapp || "Não informado"}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-info-tradeName">Nome Fantasia</Label>
                              <Input
                                id="edit-info-tradeName"
                                value={selectedSupplier.tradeName}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, tradeName: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-info-corporateName">Razão Social</Label>
                              <Input
                                id="edit-info-corporateName"
                                value={selectedSupplier.corporateName}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, corporateName: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-info-category">Categoria</Label>
                              <Input
                                id="edit-info-category"
                                value={selectedSupplier.category}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, category: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-info-country">País</Label>
                              <Select 
                                value={selectedSupplier.country} 
                                onValueChange={(value) => setSelectedSupplier({...selectedSupplier, country: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-info-description">Descrição</Label>
                            <Textarea
                              id="edit-info-description"
                              value={selectedSupplier.description}
                              onChange={(e) => setSelectedSupplier({...selectedSupplier, description: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-info-notes">Observações</Label>
                            <Textarea
                              id="edit-info-notes"
                              value={selectedSupplier.notes}
                              onChange={(e) => setSelectedSupplier({...selectedSupplier, notes: e.target.value})}
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit-info-email">Email</Label>
                              <Input
                                id="edit-info-email"
                                type="email"
                                value={selectedSupplier.email}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, email: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-info-phone">Telefone</Label>
                              <Input
                                id="edit-info-phone"
                                value={selectedSupplier.phone}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-info-whatsapp">WhatsApp</Label>
                              <Input
                                id="edit-info-whatsapp"
                                value={selectedSupplier.whatsapp}
                                onChange={(e) => setSelectedSupplier({...selectedSupplier, whatsapp: e.target.value})}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Contatos</h3>
                      <Button onClick={() => setIsAddingContact(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Contato
                      </Button>
                    </div>

                    {isAddingContact && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Novo Contato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-contact-name">Nome *</Label>
                              <Input
                                id="new-contact-name"
                                value={newContact.name}
                                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-contact-role">Função</Label>
                              <Input
                                id="new-contact-role"
                                value={newContact.role}
                                onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-contact-phone">Telefone</Label>
                              <Input
                                id="new-contact-phone"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-contact-whatsapp">WhatsApp</Label>
                              <Input
                                id="new-contact-whatsapp"
                                value={newContact.whatsapp}
                                onChange={(e) => setNewContact({...newContact, whatsapp: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-contact-email">Email</Label>
                              <Input
                                id="new-contact-email"
                                type="email"
                                value={newContact.email}
                                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="new-contact-notes">Observações</Label>
                            <Textarea
                              id="new-contact-notes"
                              value={newContact.notes}
                              onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddContact}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedSupplier.contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{contact.name}</CardTitle>
                              <Badge variant="outline">{contact.role}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingContact(contact)}
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
                          {isEditingContact?.id === contact.id ? (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Nome</Label>
                                  <Input
                                    value={isEditingContact.name}
                                    onChange={(e) => setIsEditingContact({...isEditingContact, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Função</Label>
                                  <Input
                                    value={isEditingContact.role}
                                    onChange={(e) => setIsEditingContact({...isEditingContact, role: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Telefone</Label>
                                  <Input
                                    value={isEditingContact.phone}
                                    onChange={(e) => setIsEditingContact({...isEditingContact, phone: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>WhatsApp</Label>
                                  <Input
                                    value={isEditingContact.whatsapp}
                                    onChange={(e) => setIsEditingContact({...isEditingContact, whatsapp: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <Input
                                    value={isEditingContact.email}
                                    onChange={(e) => setIsEditingContact({...isEditingContact, email: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Observações</Label>
                                <Textarea
                                  value={isEditingContact.notes}
                                  onChange={(e) => setIsEditingContact({...isEditingContact, notes: e.target.value})}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditContact(isEditingContact)}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Salvar
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditingContact(null)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
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
                              {contact.notes && (
                                <div className="md:col-span-2">
                                  <Label className="text-sm font-medium">Observações</Label>
                                  <p className="text-muted-foreground">{contact.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {selectedSupplier.contacts.length === 0 && !isAddingContact && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhum contato cadastrado</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="branches" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Filiais</h3>
                      <Button onClick={() => setIsAddingBranch(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Filial
                      </Button>
                    </div>

                    {isAddingBranch && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Nova Filial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-branch-name">Nome da Filial *</Label>
                              <Input
                                id="new-branch-name"
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-branch-corporateName">Razão Social</Label>
                              <Input
                                id="new-branch-corporateName"
                                value={newBranch.corporateName}
                                onChange={(e) => setNewBranch({...newBranch, corporateName: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-branch-cnpj">CNPJ</Label>
                              <Input
                                id="new-branch-cnpj"
                                value={newBranch.cnpj}
                                onChange={(e) => setNewBranch({...newBranch, cnpj: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-branch-stateRegistration">Inscrição Estadual</Label>
                              <Input
                                id="new-branch-stateRegistration"
                                value={newBranch.stateRegistration}
                                onChange={(e) => setNewBranch({...newBranch, stateRegistration: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-branch-phone">Telefone</Label>
                              <Input
                                id="new-branch-phone"
                                value={newBranch.phone}
                                onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-branch-email">Email</Label>
                              <Input
                                id="new-branch-email"
                                type="email"
                                value={newBranch.email}
                                onChange={(e) => setNewBranch({...newBranch, email: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="new-branch-address">Endereço</Label>
                            <Textarea
                              id="new-branch-address"
                              value={newBranch.address}
                              onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddBranch}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddingBranch(false)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedSupplier.branches.map((branch) => (
                      <Card key={branch.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              {branch.name}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingBranch(branch)}
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
                          {isEditingBranch?.id === branch.id ? (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Nome da Filial</Label>
                                  <Input
                                    value={isEditingBranch.name}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Razão Social</Label>
                                  <Input
                                    value={isEditingBranch.corporateName}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, corporateName: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>CNPJ</Label>
                                  <Input
                                    value={isEditingBranch.cnpj}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, cnpj: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Inscrição Estadual</Label>
                                  <Input
                                    value={isEditingBranch.stateRegistration}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, stateRegistration: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Telefone</Label>
                                  <Input
                                    value={isEditingBranch.phone}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, phone: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <Input
                                    value={isEditingBranch.email}
                                    onChange={(e) => setIsEditingBranch({...isEditingBranch, email: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Endereço</Label>
                                <Textarea
                                  value={isEditingBranch.address}
                                  onChange={(e) => setIsEditingBranch({...isEditingBranch, address: e.target.value})}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditBranch(isEditingBranch)}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Salvar
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditingBranch(null)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {selectedSupplier.branches.length === 0 && !isAddingBranch && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhuma filial cadastrada</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="conversations" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Conversas</h3>
                      <Button onClick={() => setIsAddingConversation(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Conversa
                      </Button>
                    </div>

                    {isAddingConversation && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Nova Conversa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="new-conversation-date">Data</Label>
                              <Input
                                id="new-conversation-date"
                                type="date"
                                value={newConversation.date}
                                onChange={(e) => setNewConversation({...newConversation, date: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="new-conversation-subject">Assunto *</Label>
                              <Input
                                id="new-conversation-subject"
                                value={newConversation.subject}
                                onChange={(e) => setNewConversation({...newConversation, subject: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="new-conversation-notes">Observações</Label>
                            <Textarea
                              id="new-conversation-notes"
                              value={newConversation.notes}
                              onChange={(e) => setNewConversation({...newConversation, notes: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddConversation}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button variant="outline" onClick={() => setIsAddingConversation(false)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedSupplier.conversations.map((conversation) => (
                      <Card key={conversation.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <MessageSquare className="h-5 w-5" />
                              {conversation.subject}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(conversation.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{conversation.notes}</p>
                          {conversation.files.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Arquivos:</Label>
                              <div className="mt-2 space-y-2">
                                {conversation.files.map((file, fileIndex) => (
                                  <div key={fileIndex} className="flex items-center gap-2 text-sm">
                                    <Paperclip className="h-4 w-4" />
                                    <span>{file}</span>
                                    <Button variant="ghost" size="sm">Download</Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {selectedSupplier.conversations.length === 0 && !isAddingConversation && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhuma conversa registrada</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edição */}
      {editingSupplier && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Fornecedor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-tradeName">Nome Fantasia *</Label>
                  <Input
                    id="edit-tradeName"
                    value={editingSupplier.tradeName}
                    onChange={(e) => setEditingSupplier({...editingSupplier, tradeName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-corporateName">Razão Social</Label>
                  <Input
                    id="edit-corporateName"
                    value={editingSupplier.corporateName}
                    onChange={(e) => setEditingSupplier({...editingSupplier, corporateName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Input
                    id="edit-category"
                    value={editingSupplier.category}
                    onChange={(e) => setEditingSupplier({...editingSupplier, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">País *</Label>
                  <Select 
                    value={editingSupplier.country} 
                    onValueChange={(value) => setEditingSupplier({...editingSupplier, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o país" />
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-mainContact">Contato Principal</Label>
                  <Input
                    id="edit-mainContact"
                    value={editingSupplier.mainContact}
                    onChange={(e) => setEditingSupplier({...editingSupplier, mainContact: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingSupplier.email}
                    onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingSupplier.phone}
                    onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Input
                    id="edit-whatsapp"
                    value={editingSupplier.whatsapp}
                    onChange={(e) => setEditingSupplier({...editingSupplier, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingSupplier.description}
                  onChange={(e) => setEditingSupplier({...editingSupplier, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  value={editingSupplier.notes}
                  onChange={(e) => setEditingSupplier({...editingSupplier, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSupplier}>
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MySuppliers;

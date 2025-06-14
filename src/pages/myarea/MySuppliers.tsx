
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
  Calendar
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

      {/* Modal de Detalhes */}
      {selectedSupplier && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
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
                      <CardTitle>Informações da Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.contacts.length > 0 ? (
                      selectedSupplier.contacts.map((contact, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{contact.name}</CardTitle>
                            <Badge variant="outline">{contact.role}</Badge>
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
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhum contato cadastrado</p>
                          <Button className="mt-4">Adicionar Contato</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="branches" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.branches.length > 0 ? (
                      selectedSupplier.branches.map((branch, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              {branch.name}
                            </CardTitle>
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
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhuma filial cadastrada</p>
                          <Button className="mt-4">Adicionar Filial</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="conversations" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.conversations.length > 0 ? (
                      selectedSupplier.conversations.map((conversation, index) => (
                        <Card key={index}>
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
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Nenhuma conversa registrada</p>
                          <Button className="mt-4">Adicionar Conversa</Button>
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

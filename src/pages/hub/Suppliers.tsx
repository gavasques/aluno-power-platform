
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useState } from "react";

interface Contact {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes: string;
}

interface Branch {
  name: string;
  corporateName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  phone: string;
  email: string;
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
  contacts: Contact[];
  branches: Branch[];
}

const mockSuppliers: Supplier[] = [
  {
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
    contacts: [
      {
        name: "João Silva",
        role: "Gerente Comercial",
        phone: "(11) 3456-7890",
        whatsapp: "(11) 99876-5432",
        email: "joao@techsupplybrasil.com.br",
        notes: "Responsável por novos parceiros"
      },
      {
        name: "Maria Santos",
        role: "Analista de Produtos",
        phone: "(11) 3456-7891",
        whatsapp: "(11) 99876-5433",
        email: "maria@techsupplybrasil.com.br",
        notes: "Especialista em smartphones"
      }
    ],
    branches: [
      {
        name: "Matriz São Paulo",
        corporateName: "TechSupply Brasil Importação e Exportação Ltda",
        cnpj: "12.345.678/0001-90",
        stateRegistration: "123.456.789.123",
        address: "Rua das Flores, 123 - São Paulo/SP",
        phone: "(11) 3456-7890",
        email: "sp@techsupplybrasil.com.br"
      },
      {
        name: "Filial Rio de Janeiro",
        corporateName: "TechSupply Brasil Importação e Exportação Ltda",
        cnpj: "12.345.678/0002-71",
        stateRegistration: "987.654.321.098",
        address: "Av. Atlântica, 456 - Rio de Janeiro/RJ",
        phone: "(21) 2345-6789",
        email: "rj@techsupplybrasil.com.br"
      }
    ]
  }
];

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo"];

  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fornecedores</h1>
        <p className="text-muted-foreground">
          Diretório de fabricantes, distribuidores, importadores e representantes
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar fornecedores..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Fornecedores */}
        <div className="lg:w-3/4">
          <div className="grid gap-6">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img
                      src={supplier.logo}
                      alt={supplier.tradeName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{supplier.tradeName}</CardTitle>
                        {supplier.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {supplier.category}
                      </Badge>
                      <p className="text-muted-foreground">{supplier.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Avaliação:</span>
                        <div className="flex">{renderStars(supplier.rating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {supplier.rating} ({supplier.reviewCount} avaliações)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {supplier.email}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedSupplier(supplier)}>
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedSupplier.logo}
                    alt={selectedSupplier.tradeName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{selectedSupplier.tradeName}</h2>
                      {selectedSupplier.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{selectedSupplier.corporateName}</p>
                    <Badge variant="outline">{selectedSupplier.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSupplier(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações da Empresa</TabsTrigger>
                  <TabsTrigger value="contacts">Contatos</TabsTrigger>
                  <TabsTrigger value="branches">Filiais</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Gerais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Nome Fantasia</label>
                            <p className="text-muted-foreground">{selectedSupplier.tradeName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Razão Social</label>
                            <p className="text-muted-foreground">{selectedSupplier.corporateName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Categoria Principal</label>
                            <p className="text-muted-foreground">{selectedSupplier.category}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Contato Principal</label>
                            <p className="text-muted-foreground">{selectedSupplier.mainContact}</p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <p className="text-muted-foreground">{selectedSupplier.email}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Telefone</label>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <p className="text-muted-foreground">{selectedSupplier.phone}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">WhatsApp</label>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <p className="text-muted-foreground">{selectedSupplier.whatsapp}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Observações</label>
                          <p className="text-muted-foreground mt-1">{selectedSupplier.notes}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Avaliação</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{renderStars(selectedSupplier.rating)}</div>
                            <span className="text-sm text-muted-foreground">
                              {selectedSupplier.rating} ({selectedSupplier.reviewCount} avaliações)
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.contacts.map((contact, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{contact.name}</CardTitle>
                          <Badge variant="outline">{contact.role}</Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Telefone</label>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <p className="text-muted-foreground">{contact.phone}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">WhatsApp</label>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <p className="text-muted-foreground">{contact.whatsapp}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <p className="text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          </div>
                          {contact.notes && (
                            <div className="mt-4">
                              <label className="text-sm font-medium">Observações</label>
                              <p className="text-muted-foreground">{contact.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="branches" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.branches.map((branch, index) => (
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
                              <label className="text-sm font-medium">Razão Social</label>
                              <p className="text-muted-foreground">{branch.corporateName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">CNPJ</label>
                              <p className="text-muted-foreground">{branch.cnpj}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Inscrição Estadual</label>
                              <p className="text-muted-foreground">{branch.stateRegistration}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Telefone</label>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <p className="text-muted-foreground">{branch.phone}</p>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium">Endereço</label>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <p className="text-muted-foreground">{branch.address}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <p className="text-muted-foreground">{branch.email}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;

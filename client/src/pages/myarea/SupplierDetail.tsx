import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  Handshake, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  Package,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Plus,
  Star
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  country: string;
  city: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  website?: string;
  email?: string;
  phone?: string;
  rating: number;
  totalOrders: number;
  lastContact: string;
  establishedYear?: number;
  description?: string;
}

interface Contact {
  id: number;
  name: string;
  position: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  isMainContact: boolean;
}

interface Contract {
  id: number;
  type: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'draft';
  value?: number;
  currency?: string;
}

interface Communication {
  id: number;
  type: 'email' | 'whatsapp' | 'phone' | 'meeting';
  subject: string;
  date: string;
  status: 'sent' | 'received' | 'pending';
  summary: string;
}

// Mock data
const mockSupplier: Supplier = {
  id: 1,
  name: "Shenzhen Electronics Co.",
  country: "China",
  city: "Shenzhen",
  category: "Eletrônicos",
  status: "active",
  website: "www.shenzhen-electronics.com",
  email: "contact@shenzhen-electronics.com",
  phone: "+86 755 1234 5678",
  rating: 4.8,
  totalOrders: 45,
  lastContact: "2025-01-20",
  establishedYear: 2008,
  description: "Fabricante especializado em componentes eletrônicos de alta qualidade com certificações internacionais ISO 9001 e CE."
};

const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Li Wei",
    position: "Sales Manager",
    email: "li.wei@shenzhen-electronics.com",
    phone: "+86 755 1234 5679",
    whatsapp: "+86 138 0000 1234",
    isMainContact: true
  },
  {
    id: 2,
    name: "Zhang Min",
    position: "Export Coordinator",
    email: "zhang.min@shenzhen-electronics.com",
    phone: "+86 755 1234 5680",
    isMainContact: false
  }
];

const mockContracts: Contract[] = [
  {
    id: 1,
    type: "Acordo de Fornecimento",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    status: "active",
    value: 150000,
    currency: "USD"
  },
  {
    id: 2,
    type: "NDA",
    startDate: "2023-12-01",
    status: "active"
  }
];

const mockCommunications: Communication[] = [
  {
    id: 1,
    type: "email",
    subject: "Cotação para novos produtos",
    date: "2025-01-20",
    status: "received",
    summary: "Recebida cotação para linha de produtos eletrônicos Q1 2025"
  },
  {
    id: 2,
    type: "whatsapp",
    subject: "Status do pedido #PO-2025-001",
    date: "2025-01-18",
    status: "sent",
    summary: "Solicitado update sobre status de produção"
  }
];

export default function SupplierDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['/api/suppliers', id],
    queryFn: async () => mockSupplier // In real app, fetch from API
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/suppliers', id, 'contacts'],
    queryFn: async () => mockContacts
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['/api/suppliers', id, 'contracts'],
    queryFn: async () => mockContracts
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['/api/suppliers', id, 'communications'],
    queryFn: async () => mockCommunications
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Carregando fornecedor...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fornecedor não encontrado</h2>
          <Link href="/minha-area/importacoes/fornecedores">
            <Button>Voltar à lista de fornecedores</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200", 
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente"
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/minha-area/importacoes/fornecedores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Fornecedores
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              {getStatusBadge(supplier.status)}
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{supplier.city}, {supplier.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{supplier.category}</span>
              </div>
              {supplier.establishedYear && (
                <span>Fundada em {supplier.establishedYear}</span>
              )}
            </div>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Editar Fornecedor
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getRatingStars(supplier.rating)}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Desde 2024</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contacts.filter(c => c.isMainContact).length} principal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contracts.filter(c => c.status === 'active').length} ativo(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="banking">Bancário</TabsTrigger>
          <TabsTrigger value="terms">Termos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descrição:</label>
                    <p className="text-sm mt-1">{supplier.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">País:</label>
                    <p className="text-sm mt-1">{supplier.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cidade:</label>
                    <p className="text-sm mt-1">{supplier.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoria:</label>
                    <p className="text-sm mt-1">{supplier.category}</p>
                  </div>
                  {supplier.establishedYear && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fundação:</label>
                      <p className="text-sm mt-1">{supplier.establishedYear}</p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3 pt-4 border-t">
                  {supplier.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`https://${supplier.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${supplier.email}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.slice(0, 5).map((comm) => (
                    <div key={comm.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {comm.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {comm.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-500" />}
                        {comm.type === 'phone' && <Phone className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">{comm.summary}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comm.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {communications.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma comunicação registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contatos</h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <CardDescription>{contact.position}</CardDescription>
                    </div>
                    {contact.isMainContact && (
                      <Badge className="bg-blue-100 text-blue-700">Principal</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {contact.email}
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{contact.whatsapp}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {contacts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contato cadastrado</h3>
                <p className="text-gray-600 mb-4">Adicione contatos para este fornecedor</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Contato
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="contracts">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Contratos</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="banking">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações Bancárias</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="terms">
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Termos Comerciais</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos e Compliance</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico de Comunicação</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise de Performance</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Produtos do Fornecedor</h3>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
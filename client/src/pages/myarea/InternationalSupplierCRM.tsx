import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Users, 
  Building2, 
  FileText, 
  CreditCard, 
  Handshake, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  Package,
  ArrowLeft,
  Filter,
  SortAsc,
  Globe
} from "lucide-react";

interface InternationalSupplier {
  id: number;
  name: string;
  country: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  lastContact: string;
  totalOrders: number;
  rating: number;
  contactsCount?: number;
  contractsCount?: number;
  productsCount?: number;
}

// Mock data para fornecedores INTERNACIONAIS - será substituído por chamadas reais da API
const mockInternationalSuppliers: InternationalSupplier[] = [
  {
    id: 1,
    name: "Shenzhen Electronics Co.",
    country: "China",
    category: "Eletrônicos",
    status: "active",
    lastContact: "2025-01-20",
    totalOrders: 45,
    rating: 4.8,
    contactsCount: 3,
    contractsCount: 2,
    productsCount: 120
  },
  {
    id: 2,
    name: "Mumbai Textiles Ltd.",
    country: "India",
    category: "Têxtil",
    status: "active",
    lastContact: "2025-01-18",
    totalOrders: 23,
    rating: 4.5,
    contactsCount: 2,
    contractsCount: 1,
    productsCount: 85
  },
  {
    id: 3,
    name: "Istanbul Manufacturing",
    country: "Turkey",
    category: "Móveis",
    status: "pending",
    lastContact: "2025-01-15",
    totalOrders: 0,
    rating: 0,
    contactsCount: 1,
    contractsCount: 0,
    productsCount: 12
  }
];

/**
 * CRM DE FORNECEDORES INTERNACIONAIS
 * 
 * ATENÇÃO: Este é um sistema SEPARADO do CRM de fornecedores nacionais
 * 
 * DIFERENÇAS IMPORTANTES:
 * - Fornecedores NACIONAIS: /minha-area/fornecedores (MySuppliers.tsx)
 * - Fornecedores INTERNACIONAIS: /minha-area/importacoes/fornecedores (este componente)
 * 
 * FINALIDADE:
 * - Especializado para IMPORTAÇÕES
 * - Gestão de documentos de compliance internacional
 * - Contratos de importação
 * - Termos comerciais internacionais (Incoterms, etc.)
 * - Performance de importações
 * - Comunicação internacional (fuso horário, idioma)
 */
export default function InternationalSupplierCRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data local - sem query para evitar loading infinito
  const suppliers = mockInternationalSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || supplier.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
  
  const isLoading = false;

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
          <div
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </div>
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
          <Link href="/minha-area/importacoes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Importações
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">CRM de Fornecedores Internacionais</h1>
            </div>
            <p className="text-gray-600">Gerencie seus fornecedores internacionais especializados para importação</p>
            <p className="text-sm text-blue-600 font-medium">
              📍 Sistema especializado para importações • Separado dos fornecedores nacionais
            </p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor Internacional
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Internacionais</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">89% do total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importações Totais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Excelente performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar fornecedores internacionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="pending">Pendente</option>
        </select>
        
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
        
        <Button variant="outline" size="sm">
          <SortAsc className="w-4 h-4 mr-2" />
          Ordenar
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando fornecedores internacionais...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum fornecedor internacional encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Tente ajustar sua busca ou filtros" : "Comece adicionando seu primeiro fornecedor internacional"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fornecedor Internacional
            </Button>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      {supplier.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {supplier.country} • {supplier.category}
                    </CardDescription>
                  </div>
                  {getStatusBadge(supplier.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rating */}
                {supplier.rating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avaliação:</span>
                    {getRatingStars(supplier.rating)}
                  </div>
                )}
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Contatos:</span>
                      <span className="font-medium">{supplier.contactsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Contratos:</span>
                      <span className="font-medium">{supplier.contractsCount || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Produtos:</span>
                      <span className="font-medium">{supplier.productsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Importações:</span>
                      <span className="font-medium">{supplier.totalOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Last Contact */}
                <div className="text-sm text-gray-600">
                  Último contato: {new Date(supplier.lastContact).toLocaleDateString('pt-BR')}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/minha-area/importacoes/fornecedores/${supplier.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                      Gerenciar
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions - Specialized for International Trade */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Contatos Internacionais</h3>
            <p className="text-sm text-gray-600">Gestão de fuso horário e idiomas</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Contratos de Importação</h3>
            <p className="text-sm text-gray-600">Incoterms e termos comerciais</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Compliance Internacional</h3>
            <p className="text-sm text-gray-600">Certificados e documentação</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Performance de Importação</h3>
            <p className="text-sm text-gray-600">Análises e relatórios</p>
          </CardContent>
        </Card>
      </div>

      {/* Warning Note */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Sistema Separado</h4>
            <p className="text-sm text-yellow-700">
              Este é o CRM para <strong>fornecedores internacionais</strong> especializado em importações. 
              Para fornecedores nacionais, acesse <Link href="/minha-area/fornecedores" className="underline font-medium">Meus Fornecedores</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
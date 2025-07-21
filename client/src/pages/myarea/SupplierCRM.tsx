import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  Certificate, 
  MessageSquare, 
  TrendingUp,
  Package,
  ArrowLeft,
  Filter,
  SortAsc
} from "lucide-react";

interface Supplier {
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

// Mock data - will be replaced with real API calls
const mockSuppliers: Supplier[] = [
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

export default function SupplierCRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // In real implementation, this would be an API call
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers', searchTerm, selectedStatus],
    queryFn: async () => {
      // Simulate API call
      return mockSuppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || supplier.status === selectedStatus;
        return matchesSearch && matchesStatus;
      });
    }
  });

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
            <h1 className="text-3xl font-bold text-gray-900">CRM de Fornecedores</h1>
            <p className="text-gray-600">Gerencie seus fornecedores internacionais de forma profissional</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Pedidos Totais</CardTitle>
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
            placeholder="Buscar fornecedores..."
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
            <p className="mt-4 text-gray-600">Carregando fornecedores...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Tente ajustar sua busca ou filtros" : "Comece adicionando seu primeiro fornecedor"}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{supplier.name}</CardTitle>
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
                      <span className="text-gray-600">Pedidos:</span>
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

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Novos Contatos</h3>
            <p className="text-sm text-gray-600">Adicionar contatos aos fornecedores</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Novos Contratos</h3>
            <p className="text-sm text-gray-600">Gerenciar acordos comerciais</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Relatórios</h3>
            <p className="text-sm text-gray-600">Performance e análises</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Certificate className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Documentos</h3>
            <p className="text-sm text-gray-600">Certificados e compliance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
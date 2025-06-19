
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, Phone, Mail, Filter, Globe, Factory, Truck, Users, Package, Send } from "lucide-react";
import { useState } from "react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const { suppliers, loading } = useSuppliers();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "Todas", icon: "Filter" },
    { id: "1", name: "Fabricantes", icon: "Factory" },
    { id: "2", name: "Distribuidores", icon: "Truck" },
    { id: "3", name: "Importadores", icon: "Globe" },
    { id: "4", name: "Representantes", icon: "Users" },
    { id: "5", name: "Atacadistas", icon: "Package" },
    { id: "6", name: "Dropshipping", icon: "Send" }
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || supplier.category.id === selectedCategory;
    const matchesVerified = verifiedFilter === "all" || 
                           (verifiedFilter === "verified" && supplier.isVerified) ||
                           (verifiedFilter === "unverified" && !supplier.isVerified);
    return matchesSearch && matchesCategory && matchesVerified;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Factory": return <Factory className="h-5 w-5" />;
      case "Truck": return <Truck className="h-5 w-5" />;
      case "Globe": return <Globe className="h-5 w-5" />;
      case "Users": return <Users className="h-5 w-5" />;
      case "Package": return <Package className="h-5 w-5" />;
      case "Send": return <Send className="h-5 w-5" />;
      default: return <Factory className="h-5 w-5" />;
    }
  };

  const handleViewSupplier = (supplier: any) => {
    setLocation(`/hub/fornecedores/${supplier.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando fornecedores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl font-bold">Fornecedores</h1>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Diretório Completo
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Diretório de fabricantes, distribuidores, importadores e representantes
        </p>
      </div>

      {/* Filtros em Uma Linha */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Barra de Busca */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores por nome, razão social ou observações..."
                className="pl-12 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="verified">Verificados</SelectItem>
                  <SelectItem value="unverified">Não Verificados</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedCategory !== "all" || verifiedFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setVerifiedFilter("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {supplier.logo ? (
                    <img
                      src={supplier.logo}
                      alt={supplier.tradeName}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    getCategoryIcon(supplier.category.icon)
                  )}
                  <Badge variant="outline">{supplier.category.name}</Badge>
                </div>
                <div className="flex gap-1">
                  {supplier.isVerified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600">
                      Pendente
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {supplier.tradeName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {supplier.corporateName}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {supplier.notes}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(supplier.averageRating)}</div>
                <span className="text-sm text-muted-foreground">
                  {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {supplier.departments.slice(0, 2).map(dept => (
                  <Badge key={dept.id} variant="secondary" className="text-xs">
                    {dept.name}
                  </Badge>
                ))}
                {supplier.departments.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{supplier.departments.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                {supplier.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {supplier.email.split('@')[0]}@...
                  </div>
                )}
                {supplier.commercialEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Comercial
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Site
                  </div>
                )}
                {supplier.instagram && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Instagram
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => handleViewSupplier(supplier)}
              >
                Ver Perfil Completo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-12">
            <Factory className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Suppliers;

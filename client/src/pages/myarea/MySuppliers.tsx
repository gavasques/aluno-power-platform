
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2, Plus, Edit, Grid2X2, List, Filter, Trash2, ShoppingBag, Globe } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/usePagination";
import { useSuppliers } from "@/contexts/SuppliersContext";

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

const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo", "Alimentício", "Beleza e Cosméticos"];

const MySuppliers = () => {
  const { suppliers, deleteSupplier, searchSuppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [, setLocation] = useLocation();

  // Busca que inclui marcas
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.departments.some(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      supplier.brands.some(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        brand.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCategory = selectedCategory === "Todas" || supplier.category.name === selectedCategory;
    const matchesCountry = selectedCountry === "ALL"; // Removido filtro de país do mock
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const { currentPage, totalPages, paginatedItems, handlePageChange, getPaginationGroup } = usePagination({
    items: filteredSuppliers,
    itemsPerPage: 25
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleViewSupplier = (supplierId: string) => {
    setLocation(`/minha-area/fornecedores/${supplierId}`);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      deleteSupplier(supplierId);
      toast({
        title: "Fornecedor removido",
        description: "O fornecedor foi removido com sucesso."
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todas");
    setSelectedCountry("ALL");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "Todas" || selectedCountry !== "ALL";

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl font-bold">Meus Fornecedores</h1>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Building2 className="h-3 w-3 mr-1" />
            Área Pessoal
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Gerencie seus fornecedores pessoais e mantenha todas as informações organizadas
        </p>
      </div>

      {/* Filtros e Controles */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Barra de Busca */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores por nome, razão social, descrição ou marcas..."
                className="pl-12 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros e Controles */}
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
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Toggle de Visualização */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-r-none"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={() => setLocation('/minha-area/fornecedores/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualização em Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedItems.map(supplier => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={supplier.logo}
                      alt={supplier.tradeName}
                      className="w-8 h-8 rounded object-cover"
                    />
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

                {/* Marcas */}
                {supplier.brands.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Marcas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {supplier.brands.slice(0, 3).map(brand => (
                        <Badge key={brand.id} variant="secondary" className="text-xs">
                          {brand.name}
                        </Badge>
                      ))}
                      {supplier.brands.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.brands.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(supplier.averageRating)}</div>
                  <span className="text-sm text-muted-foreground">
                    {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
                  </span>
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
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleViewSupplier(supplier.id)}
                  >
                    Ver Perfil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visualização em Lista */}
      {viewMode === 'list' && (
        <div className="mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Marcas</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map(supplier => (
                <TableRow key={supplier.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={supplier.logo}
                        alt={supplier.tradeName}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium">{supplier.tradeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.corporateName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-40">
                      {supplier.brands.slice(0, 2).map(brand => (
                        <Badge key={brand.id} variant="secondary" className="text-xs">
                          {brand.name}
                        </Badge>
                      ))}
                      {supplier.brands.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.brands.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(supplier.averageRating)}</div>
                      <span className="text-sm">
                        {supplier.averageRating.toFixed(1)} ({supplier.totalReviews})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {supplier.email.split('@')[0]}@...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSupplier(supplier.id)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPaginationGroup().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Estado Vazio */}
      {filteredSuppliers.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "Tente ajustar os filtros ou termos de busca" 
                : "Você ainda não possui fornecedores cadastrados"}
            </p>
            <Button onClick={() => setLocation('/minha-area/fornecedores/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Fornecedor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MySuppliers;

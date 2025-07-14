
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Star
} from "lucide-react";
import { useLocation } from "wouter";
import { useSuppliers } from "@/contexts/SuppliersContext";

const SuppliersManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const [, setLocation] = useLocation();
  const { suppliers, deleteSupplier } = useSuppliers();

  const categories = ["Todas", "Fabricantes", "Distribuidores", "Importadores", "Representantes", "Atacadistas", "Dropshipping"];

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || supplier.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie fabricantes, distribuidores, importadores e representantes</p>
        </div>
        <Button 
          onClick={() => setLocation('/admin/conteudo/fornecedores/novo')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white border border-border">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
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
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista/Cards de Fornecedores */}
      {viewMode === "list" ? (
        <Card className="bg-white border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.tradeName}</div>
                      <div className="text-sm text-muted-foreground">{supplier.corporateName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.mainContact}</div>
                      <div className="text-muted-foreground">{supplier.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(supplier.averageRating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {supplier.averageRating.toFixed(1)} ({supplier.totalReviews})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Não Verificado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/admin/conteudo/fornecedores/${supplier.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/admin/conteudo/fornecedores/${supplier.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="bg-white border border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{supplier.tradeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.corporateName}</p>
                    <Badge variant="outline" className="mt-2">{supplier.category.name}</Badge>
                  </div>
                  {supplier.isVerified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Contato:</strong> {supplier.mainContact}
                  </div>
                  <div className="text-sm">
                    <strong>Email:</strong> {supplier.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(supplier.averageRating)}</div>
                    <span className="text-sm text-muted-foreground">
                      {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/admin/conteudo/fornecedores/${supplier.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/admin/conteudo/fornecedores/${supplier.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSuppliers.length === 0 && (
        <Card className="bg-white border border-border">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhum fornecedor encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuppliersManager;

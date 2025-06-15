
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, CheckCircle, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { Supplier } from "@/types/supplier";

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { suppliers, loading } = useSuppliers();

  const categories = ["Todas", "Fabricantes", "Distribuidores", "Importadores", "Representantes", "Atacadistas", "Dropshipping"];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.corporateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || supplier.category.name === selectedCategory;
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
                    {supplier.logo && (
                      <img
                        src={supplier.logo}
                        alt={supplier.tradeName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{supplier.tradeName}</CardTitle>
                        {supplier.isVerified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {supplier.category.name}
                      </Badge>
                      <p className="text-muted-foreground">{supplier.notes}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Avaliação:</span>
                        <div className="flex">{renderStars(supplier.averageRating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
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
                  {selectedSupplier.logo && (
                    <img
                      src={selectedSupplier.logo}
                      alt={selectedSupplier.tradeName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{selectedSupplier.tradeName}</h2>
                      {selectedSupplier.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{selectedSupplier.corporateName}</p>
                    <Badge variant="outline">{selectedSupplier.category.name}</Badge>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="contacts">Contatos</TabsTrigger>
                  <TabsTrigger value="branches">Filiais</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
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
                            <p className="text-muted-foreground">{selectedSupplier.category.name}</p>
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

                        {selectedSupplier.notes && (
                          <div>
                            <label className="text-sm font-medium">Observações</label>
                            <p className="text-muted-foreground mt-1">{selectedSupplier.notes}</p>
                          </div>
                        )}

                        {selectedSupplier.commercialTerms && (
                          <div>
                            <label className="text-sm font-medium">Termos Comerciais</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md">
                              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedSupplier.commercialTerms}
                              </pre>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Avaliação</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{renderStars(selectedSupplier.averageRating)}</div>
                            <span className="text-sm text-muted-foreground">
                              {selectedSupplier.averageRating.toFixed(1)} ({selectedSupplier.totalReviews} avaliações)
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
                              <label className="text-sm font-medium">Inscrição Municipal</label>
                              <p className="text-muted-foreground">{branch.municipalRegistration}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Inscrição Estadual</label>
                              <p className="text-muted-foreground">{branch.stateRegistration}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium">Endereço</label>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <p className="text-muted-foreground">{branch.address}</p>
                              </div>
                            </div>
                          </div>
                          {branch.notes && (
                            <div className="mt-4">
                              <label className="text-sm font-medium">Observações</label>
                              <p className="text-muted-foreground">{branch.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-4">
                    {selectedSupplier.reviews.filter(review => review.isApproved).map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium">{review.userName}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          {review.photos.length > 0 && (
                            <div className="mt-4 flex gap-2">
                              {review.photos.map((photo, photoIndex) => (
                                <img
                                  key={photoIndex}
                                  src={photo}
                                  alt={`Foto ${photoIndex + 1}`}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {selectedSupplier.reviews.filter(review => review.isApproved).length === 0 && (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-muted-foreground">Ainda não há avaliações para este fornecedor.</p>
                        </CardContent>
                      </Card>
                    )}
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

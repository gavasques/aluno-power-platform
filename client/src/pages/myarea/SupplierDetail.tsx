
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft, CheckCircle, Phone, Mail, MapPin, Globe, Building2, Users, FileText, ShoppingBag } from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import SupplierBrands from "@/components/supplier/SupplierBrands";

const SupplierDetail = () => {
  const [, params] = useRoute("/minha-area/fornecedores/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const { getSupplierById } = useSuppliers();

  const supplier = getSupplierById(id || '');

  if (!supplier) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Fornecedor não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O fornecedor que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => setLocation('/minha-area/fornecedores')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Fornecedores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/minha-area/fornecedores')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Fornecedores
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={supplier.logo} alt={supplier.tradeName} />
                <AvatarFallback className="text-2xl">
                  {supplier.tradeName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{supplier.tradeName}</h1>
                    <p className="text-lg text-muted-foreground mb-3">{supplier.corporateName}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{supplier.category.name}</Badge>
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
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(supplier.averageRating)}</div>
                      <span className="font-medium">{supplier.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supplier.totalReviews} avaliações
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{supplier.notes}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">
            <Building2 className="h-4 w-4 mr-2" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="brands">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Marcas
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        {/* Informações Gerais */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplier.phone}</p>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplier.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{supplier.mainContact}</p>
                    <p className="text-sm text-muted-foreground">Contato Principal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {supplier.departments.map(dept => (
                    <Badge key={dept.id} variant="outline">
                      {dept.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Termos Comerciais</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">{supplier.commercialTerms}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marcas */}
        <TabsContent value="brands">
          <SupplierBrands supplierId={supplier.id} brands={supplier.brands} />
        </TabsContent>

        {/* Contatos */}
        <TabsContent value="contacts" className="space-y-4">
          {supplier.contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplier.contacts.map(contact => (
                <Card key={contact.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-muted-foreground">{contact.role}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                    {contact.notes && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {contact.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum contato cadastrado</h3>
                <p className="text-muted-foreground">
                  Adicione contatos para este fornecedor
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Arquivos */}
        <TabsContent value="files" className="space-y-4">
          {supplier.files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplier.files.map(file => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{file.name}</CardTitle>
                    <Badge variant="outline">{file.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {file.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload: {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tamanho: {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum arquivo cadastrado</h3>
                <p className="text-muted-foreground">
                  Adicione arquivos para este fornecedor
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="reviews" className="space-y-4">
          {supplier.reviews.filter(r => r.isApproved).length > 0 ? (
            <div className="space-y-4">
              {supplier.reviews.filter(r => r.isApproved).map(review => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma avaliação</h3>
                <p className="text-muted-foreground">
                  Este fornecedor ainda não possui avaliações
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDetail;

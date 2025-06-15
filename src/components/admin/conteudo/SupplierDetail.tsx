
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  User 
} from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";

const SupplierDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSupplierById } = useSuppliers();
  
  const supplier = id ? getSupplierById(id) : null;

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/conteudo/fornecedores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Fornecedor não encontrado</h1>
          </div>
        </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/conteudo/fornecedores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            {supplier.logo && (
              <img
                src={supplier.logo}
                alt={supplier.tradeName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{supplier.tradeName}</h1>
                {supplier.isVerified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{supplier.corporateName}</p>
              <Badge variant="outline">{supplier.category.name}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/conteudo/fornecedores/${supplier.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="branches">Filiais</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome Fantasia</label>
                  <p className="text-muted-foreground">{supplier.tradeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Razão Social</label>
                  <p className="text-muted-foreground">{supplier.corporateName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria Principal</label>
                  <p className="text-muted-foreground">{supplier.category.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Contato Principal</label>
                  <p className="text-muted-foreground">{supplier.mainContact}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p className="text-muted-foreground">{supplier.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <p className="text-muted-foreground">{supplier.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <p className="text-muted-foreground">{supplier.whatsapp}</p>
                  </div>
                </div>
              </div>

              {supplier.notes && (
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <p className="text-muted-foreground mt-1">{supplier.notes}</p>
                </div>
              )}

              {supplier.commercialTerms && (
                <div>
                  <label className="text-sm font-medium">Termos Comerciais</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {supplier.commercialTerms}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Avaliação</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(supplier.averageRating)}</div>
                  <span className="text-sm text-muted-foreground">
                    {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Criado em</label>
                  <p className="text-muted-foreground">
                    {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Última atualização</label>
                  <p className="text-muted-foreground">
                    {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          {supplier.contacts.map((contact, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {contact.name}
                </CardTitle>
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
          {supplier.contacts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhum contato adicional cadastrado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="branches" className="space-y-6">
          {supplier.branches.map((branch, index) => (
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
          {supplier.branches.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma filial cadastrada.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {supplier.reviews.filter(review => review.isApproved).map((review, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{review.userName}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
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
          {supplier.reviews.filter(review => review.isApproved).length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Ainda não há avaliações para este fornecedor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDetail;

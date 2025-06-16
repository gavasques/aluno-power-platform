
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Phone, 
  Mail, 
  Download, 
  CheckCircle, 
  Globe, 
  Factory, 
  Truck, 
  Users, 
  Package, 
  Send,
  ArrowLeft,
  MessageSquare,
  FileText,
  User
} from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useToast } from "@/hooks/use-toast";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSupplierById } = useSuppliers();
  const { toast } = useToast();
  
  const supplier = getSupplierById(id || "");

  if (!supplier) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Fornecedor não encontrado</h1>
          <Button onClick={() => navigate("/hub/fornecedores")}>
            Voltar para Fornecedores
          </Button>
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

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Factory": return <Factory className="h-6 w-6" />;
      case "Truck": return <Truck className="h-6 w-6" />;
      case "Globe": return <Globe className="h-6 w-6" />;
      case "Users": return <Users className="h-6 w-6" />;
      case "Package": return <Package className="h-6 w-6" />;
      case "Send": return <Send className="h-6 w-6" />;
      default: return <Factory className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string) => {
    const types = {
      'catalog': 'Catálogo de Produtos',
      'price_sheet': 'Planilha de Preços',
      'presentation': 'Apresentação',
      'certificate': 'Certificados',
      'other': 'Outros'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleDownloadFile = (file: any) => {
    if (file.fileUrl && file.fileUrl !== '#') {
      window.open(file.fileUrl, '_blank');
      toast({
        title: "Download iniciado",
        description: `O download de "${file.name}" foi iniciado.`,
      });
    } else {
      toast({
        title: "Download não disponível",
        description: "Este arquivo não está disponível para download.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header com informações principais */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-6">
            {supplier.logo ? (
              <img
                src={supplier.logo}
                alt={supplier.tradeName}
                className="w-20 h-20 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border">
                {getCategoryIcon(supplier.category.icon)}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{supplier.tradeName}</h1>
                {supplier.isVerified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>
              
              <p className="text-lg text-muted-foreground mb-3">{supplier.corporateName}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {getCategoryIcon(supplier.category.icon)}
                  <span className="ml-2">{supplier.category.name}</span>
                </Badge>
                
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(supplier.averageRating)}</div>
                  <span className="text-sm text-muted-foreground">
                    {supplier.averageRating.toFixed(1)} ({supplier.totalReviews} avaliações)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {supplier.departments.map(dept => (
                  <Badge key={dept.id} variant="secondary">
                    {dept.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs com informações detalhadas */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                  <p className="text-base">{supplier.tradeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                  <p className="text-base">{supplier.corporateName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoria Principal</label>
                  <p className="text-base">{supplier.category.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contato Principal</label>
                  <p className="text-base">{supplier.mainContact}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contato Principal */}
            <Card>
              <CardHeader>
                <CardTitle>Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-base">{supplier.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-base">{supplier.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                    <p className="text-base">{supplier.whatsapp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{supplier.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Termos Comerciais */}
          {supplier.commercialTerms && (
            <Card>
              <CardHeader>
                <CardTitle>Termos Comerciais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {supplier.commercialTerms}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          {supplier.contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{contact.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{contact.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-sm">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                      <p className="text-sm">{contact.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{contact.email}</p>
                    </div>
                  </div>
                </div>
                {contact.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Observações</label>
                    <p className="text-sm text-muted-foreground">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {supplier.contacts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum contato adicional cadastrado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {supplier.files.map((file) => (
            <Card key={file.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{file.name}</h4>
                    <p className="text-muted-foreground text-sm">{file.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{getFileTypeLabel(file.type)}</Badge>
                      <span>Tamanho: {formatFileSize(file.size)}</span>
                      <span>Enviado em: {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {supplier.files.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum arquivo disponível para este fornecedor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {supplier.reviews.filter(review => review.isApproved).map((review) => (
            <Card key={review.id}>
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
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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

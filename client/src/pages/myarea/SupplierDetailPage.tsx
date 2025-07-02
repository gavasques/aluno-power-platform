import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail, User, Building, Globe, FileText, Upload, Download } from "lucide-react";
import { Link } from "wouter";

interface Supplier {
  id: number;
  tradeName: string;
  corporateName: string;
  description?: string;
  isVerified: boolean;
  commercialEmail?: string;
  supportEmail?: string;
  website?: string;
  instagram?: string;
  phone?: string;
  contactPerson?: string;
  category?: {
    name: string;
  };
  brands?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  contacts?: Array<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
    department?: string;
    position?: string;
  }>;
}

const SupplierDetailPage = () => {
  const { id } = useParams();
  
  const { data: supplier, isLoading } = useQuery<Supplier>({
    queryKey: [`/api/suppliers/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-muted-foreground">Carregando fornecedor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fornecedor não encontrado</h3>
            <p className="text-gray-600 mb-4">O fornecedor solicitado não existe ou você não tem permissão para visualizá-lo.</p>
            <Link href="/minha-area/fornecedores">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Fornecedores
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/minha-area/fornecedores">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Fornecedores
            </Button>
          </Link>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{supplier.tradeName}</h1>
                      <p className="text-gray-600 mb-2">{supplier.corporateName}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {supplier.category && (
                          <Badge variant="outline">{supplier.category.name}</Badge>
                        )}
                        {supplier.isVerified && (
                          <Badge className="bg-green-100 text-green-700">✓ Verificado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {supplier.description && (
                    <p className="text-gray-700 leading-relaxed">{supplier.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="informacoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="informacoes" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="marcas" className="flex items-center gap-2">
              <Badge className="h-4 w-4" />
              Marcas
            </TabsTrigger>
            <TabsTrigger value="contatos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="arquivos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contato Principal */}
              <Card>
                <CardHeader>
                  <CardTitle>Contato Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplier.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{supplier.phone}</p>
                        <p className="text-sm text-gray-600">Telefone</p>
                      </div>
                    </div>
                  )}
                  
                  {supplier.commercialEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{supplier.commercialEmail}</p>
                        <p className="text-sm text-gray-600">Email</p>
                      </div>
                    </div>
                  )}
                  
                  {supplier.contactPerson && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{supplier.contactPerson}</p>
                        <p className="text-sm text-gray-600">Contato Principal</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Departamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Departamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="outline">Eletrônicos</Badge>
                    <Badge variant="outline">Esportes</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Termos Comerciais */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Termos Comerciais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                    <p>Pagamento: 30 dias</p>
                    <p>Frete: CIF</p>
                    <p>Desconto para pedidos acima de R$ 10.000</p>
                    <p>Garantia de 1 ano em todos os produtos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marcas">
            <Card>
              <CardHeader>
                <CardTitle>Marcas Representadas</CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.brands && supplier.brands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {supplier.brands.map((brand) => (
                      <Card key={brand.id} className="p-4">
                        <h4 className="font-medium mb-2">{brand.name}</h4>
                        {brand.description && (
                          <p className="text-sm text-gray-600">{brand.description}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Badge className="h-12 w-12 mx-auto mb-4 bg-gray-100" />
                    <p>Nenhuma marca cadastrada</p>
                    <Button variant="outline" className="mt-2">
                      Adicionar Marca
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contatos">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Contatos</CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.contacts && supplier.contacts.length > 0 ? (
                  <div className="space-y-4">
                    {supplier.contacts.map((contact) => (
                      <div key={contact.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            {contact.position && (
                              <p className="text-sm text-gray-600">{contact.position}</p>
                            )}
                            {contact.department && (
                              <Badge variant="outline" className="mt-1">{contact.department}</Badge>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            {contact.email && (
                              <p className="text-gray-600">{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-gray-600">{contact.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum contato cadastrado</p>
                    <Button variant="outline" className="mt-2">
                      Adicionar Contato
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arquivos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Arquivos do Fornecedor</CardTitle>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Arquivo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum arquivo enviado</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Envie catálogos, tabelas de preços, certificados e outros documentos
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupplierDetailPage;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Award, Users, Wrench, Package, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentManagementProps {
  subsection?: string;
}

const ContentManagement = ({ subsection = "hub" }: ContentManagementProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(subsection);
  const [searchTerm, setSearchTerm] = useState("");

  const [partners, setPartners] = useState([
    { id: "1", name: "Amazon", type: "Marketplace", description: "Marketplace global", status: "active", seal: "verified" },
    { id: "2", name: "Mercado Livre", type: "Marketplace", description: "Marketplace brasileiro", status: "active", seal: "premium" },
    { id: "3", name: "Shopee", type: "Marketplace", description: "Marketplace asiático", status: "active", seal: "verified" }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: "1", name: "Fornecedor ABC", type: "Nacional", description: "Eletrônicos e gadgets", status: "active", seal: "trusted" },
    { id: "2", name: "Global Tech", type: "Internacional", description: "Tecnologia avançada", status: "active", seal: "premium" },
    { id: "3", name: "Local Supplies", type: "Regional", description: "Fornecedor regional", status: "inactive", seal: "basic" }
  ]);

  const [tools, setTools] = useState([
    { id: "1", name: "Jungle Scout", category: "Pesquisa", description: "Ferramenta de pesquisa de produtos", status: "active", seal: "recommended" },
    { id: "2", name: "Helium 10", category: "SEO", description: "Suite completa para Amazon", status: "active", seal: "premium" },
    { id: "3", name: "AMZScout", category: "Análise", description: "Análise de mercado", status: "active", seal: "verified" }
  ]);

  const [materials, setMaterials] = useState([
    { id: "1", name: "Guia Completo Amazon FBA", type: "PDF", description: "Manual completo sobre Amazon FBA", status: "active", downloads: 1250 },
    { id: "2", name: "Planilha Controle Financeiro", type: "Planilha", description: "Controle financeiro para e-commerce", status: "active", downloads: 950 },
    { id: "3", name: "Templates Anúncios", type: "Templates", description: "Templates para anúncios", status: "active", downloads: 750 }
  ]);

  const getSealBadge = (seal: string) => {
    const seals = {
      verified: <Badge className="bg-blue-500">Verificado</Badge>,
      premium: <Badge className="bg-purple-500">Premium</Badge>,
      trusted: <Badge className="bg-green-500">Confiável</Badge>,
      recommended: <Badge className="bg-orange-500">Recomendado</Badge>,
      basic: <Badge variant="secondary">Básico</Badge>
    };
    return seals[seal as keyof typeof seals] || <Badge variant="outline">Nenhum</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? "Ativo" : "Inativo"}
      </Badge>
    );
  };

  const handleDelete = (type: string, id: string) => {
    toast({
      title: "Item removido",
      description: `${type} removido com sucesso.`,
    });
  };

  const applySeal = (type: string, id: string, seal: string) => {
    toast({
      title: "Selo aplicado",
      description: `Selo "${seal}" aplicado com sucesso.`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie todo o Hub de Recursos e aplicação de selos</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tools.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hub" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Hub Geral
          </TabsTrigger>
          <TabsTrigger value="parceiros" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Parceiros
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Materiais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hub" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ferramentas do Hub</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ferramentas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Selo</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell>{tool.category}</TableCell>
                      <TableCell>{tool.description}</TableCell>
                      <TableCell>{getStatusBadge(tool.status)}</TableCell>
                      <TableCell>{getSealBadge(tool.seal)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Award className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete("Ferramenta", tool.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parceiros" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gerenciar Parceiros</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Selo</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.type}</TableCell>
                      <TableCell>{partner.description}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>{getSealBadge(partner.seal)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Award className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete("Parceiro", partner.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gerenciar Fornecedores do Hub</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Selo</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.type}</TableCell>
                      <TableCell>{supplier.description}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>{getSealBadge(supplier.seal)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Award className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete("Fornecedor", supplier.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Materiais do Hub</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>{material.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.downloads}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(material.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete("Material", material.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;

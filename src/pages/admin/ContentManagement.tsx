
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, Users, Wrench, Package, Award } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { usePartners } from "@/contexts/PartnersContext";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import ToolsManager from "@/components/admin/conteudo/ToolsManager";
import MaterialsManager from "@/components/admin/conteudo/MaterialsManager";
import MaterialFormAdmin from "./conteudo/MaterialFormAdmin";
import MaterialDetailAdmin from "./conteudo/MaterialDetailAdmin";

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { partners } = usePartners();
  const { subsection, id } = useParams();
  const { pathname } = useLocation();

  // Se estiver na subseção específica, renderiza o componente específico
  if (subsection === 'parceiros') {
    return <PartnersManager />;
  }
  
  if (subsection === 'ferramentas') {
    return <ToolsManager />;
  }

  if (subsection === 'materiais') {
    if (id === 'novo') return <MaterialFormAdmin />;
    if (id && pathname.includes('/edit')) return <MaterialFormAdmin />;
    if (id) return <MaterialDetailAdmin />;
    return <MaterialsManager />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie o hub de recursos e materiais da plataforma</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <Tabs defaultValue="hub" className="space-y-6">
        <TabsList className="bg-white border border-border">
          <TabsTrigger value="hub" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Hub de Recursos
          </TabsTrigger>
          <TabsTrigger value="selos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <Award className="h-4 w-4 mr-2" />
            Selos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hub">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/conteudo/parceiros')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Parceiros</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">Gerencie parceiros e suas informações</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{partners.length} parceiros</Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Fornecedores</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">Cadastro e gestão de fornecedores</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-100 text-green-800 border-green-200">128 fornecedores</Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/admin/conteudo/materiais')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Materiais</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">Repositório de conteúdos e recursos</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">45 materiais</Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Ferramentas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">Ferramentas disponíveis na plataforma</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">12 ferramentas</Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="selos">
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">Gestão de Selos</CardTitle>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Selo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar selos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum selo encontrado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;

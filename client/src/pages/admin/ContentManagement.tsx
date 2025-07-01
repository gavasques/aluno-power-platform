
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Wrench, Package, BrainCircuit, Building2 } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { usePartners } from "@/contexts/PartnersContext";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useTemplates } from "@/contexts/TemplatesContext";
import { usePrompts } from "@/contexts/PromptsContext";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import ToolsManager from "@/components/admin/conteudo/ToolsManager";
import MaterialsManager from "@/components/admin/conteudo/MaterialsManager";
import SuppliersManager from "@/components/admin/conteudo/SuppliersManager";
import SupplierForm from "@/components/admin/conteudo/SupplierForm";
import SupplierDetail from "@/components/admin/conteudo/SupplierDetail";
import MaterialFormAdmin from "./conteudo/MaterialFormAdmin";
import MaterialDetailAdmin from "./conteudo/MaterialDetailAdmin";
import TemplatesManager from "@/components/admin/cadastros/TemplatesManager";
import TemplateForm from "@/components/admin/cadastros/TemplateForm";
import PromptsAIManager from "@/components/admin/cadastros/PromptsAIManager";
import PromptForm from "@/components/admin/cadastros/PromptForm";
import { NewsCenter } from "./content/NewsCenter";
import { UpdatesCenter } from "./content/UpdatesCenter";
import AmazonDepartmentExport from "./content/AmazonDepartmentExport";

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [match, params] = useRoute('/admin/conteudo/:subsection?/:id?/:action?');
  const [, setLocation] = useLocation();
  const { partners } = usePartners();
  const { suppliers } = useSuppliers();
  const { templates } = useTemplates();
  const { prompts } = usePrompts();
  
  const subsection = params?.subsection;
  const id = params?.id;
  const action = params?.action;

  // Redirecionar se estiver na rota de selos (que foi removida)
  useEffect(() => {
    if (subsection === 'selos') {
      setLocation('/admin/conteudo');
    }
  }, [subsection, setLocation]);

  // Se estiver na subseção específica, renderiza o componente específico
  if (subsection === 'parceiros') {
    return <PartnersManager />;
  }
  
  if (subsection === 'fornecedores') {
    if (id === 'novo') return <SupplierForm />;
    if (id && action === 'edit') return <SupplierForm />;
    if (id) return <SupplierDetail />;
    return <SuppliersManager />;
  }
  
  if (subsection === 'ferramentas') {
    return <ToolsManager />;
  }

  if (subsection === 'materiais') {
    if (id === 'novo') return <MaterialFormAdmin />;
    if (id && action === 'edit') return <MaterialFormAdmin />;
    if (id) return <MaterialDetailAdmin />;
    return <MaterialsManager />;
  }

  if (subsection === 'templates') {
    if (id === 'novo') return <TemplateForm />;
    if (id && action === 'edit') return <TemplateForm />;
    return <TemplatesManager />;
  }

  if (subsection === 'prompts-ia') {
    if (id === 'novo') return <PromptForm />;
    if (id && action === 'edit') return <PromptForm />;
    return <PromptsAIManager />;
  }

  if (subsection === 'noticias') {
    return <NewsCenter />;
  }

  if (subsection === 'novidades') {
    return <UpdatesCenter />;
  }

  if (subsection === 'export-amazon') {
    return <AmazonDepartmentExport />;
  }

  // Exibe direto o hub de recursos, sem tabs
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/parceiros')}
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

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/fornecedores')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Fornecedores</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">Cadastro e gestão de fornecedores</p>
            <div className="flex justify-between items-center">
              <Badge className="bg-green-100 text-green-800 border-green-200">{suppliers.length} fornecedores</Badge>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/materiais')}
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

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/ferramentas')}
        >
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

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/templates')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Templates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">Gerencie templates e modelos de comunicação</p>
            <div className="flex justify-between items-center">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">{templates.length} templates</Badge>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/prompts-ia')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Prompts IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">Biblioteca de prompts para inteligência artificial</p>
            <div className="flex justify-between items-center">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">{prompts.length} prompts</Badge>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation('/admin/conteudo/export-amazon')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">🚀 Exportação Amazon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">Exportar departamentos e categorias da Amazon para Excel via API loop</p>
            <div className="flex justify-between items-center">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">🔄 API Loop</Badge>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManagement;

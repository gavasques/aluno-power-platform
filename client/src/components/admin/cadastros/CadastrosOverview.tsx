import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Bot, FileText, Package, Building, FolderPen, Layers3, Brain, Users, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CadastrosOverview = () => {
  const navigate = useNavigate();
  
  const cadastroItems = [
    {
      id: 'departamentos',
      title: 'Departamentos',
      description: 'Gerencie os departamentos da plataforma',
      icon: Layers3,
      badge: '3 departamentos',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      path: '/admin/cadastros/departamentos'
    },
    {
      id: 'tipos-templates',
      title: 'Tipos de Templates',
      description: 'Gerencie tipos de templates e categorias',
      icon: FolderPen,
      badge: '4 tipos',
      badgeColor: 'bg-green-100 text-green-700 border-green-200',
      path: '/admin/cadastros/tipos-templates'
    },
    {
      id: 'tipos-fornecedor',
      title: 'Tipos de Fornecedor',
      description: 'Configure tipos e categorias de fornecedores',
      icon: Building,
      badge: '6 tipos',
      badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      path: '/admin/cadastros/tipos-fornecedor'
    },
    {
      id: 'tipos-parceiro',
      title: 'Tipos de Parceiro',
      description: 'Configure tipos e categorias de parceiros',
      icon: Users,
      badge: '6 tipos',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      path: '/admin/cadastros/tipos-parceiro'
    },
    {
      id: 'tipos-prompts-ia',
      title: 'Tipos de Prompts IA',
      description: 'Gerencie tipos de prompts de IA',
      icon: Brain,
      badge: '4 tipos',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      path: '/admin/cadastros/tipos-prompts-ia'
    },
    {
      id: 'tipos-materiais',
      title: 'Tipos de Materiais',
      description: 'Gerencie tipos padrão de materiais',
      icon: FileText,
      badge: '9 tipos',
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      path: '/admin/cadastros/tipos-materiais'
    },
    {
      id: 'categorias-materiais',
      title: 'Categorias de Materiais',
      description: 'Gerencie categorias de materiais',
      icon: Folder,
      badge: '3 categorias',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      path: '/admin/cadastros/categorias-materiais'
    },
    {
      id: 'tipos-ferramentas',
      title: 'Tipos de Ferramentas',
      description: 'Gerencie tipos e categorias de ferramentas',
      icon: Package,
      badge: '5 tipos',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      path: '/admin/cadastros/tipos-ferramentas'
    },
    {
      id: 'parceiros',
      title: 'Parceiros',
      description: 'Gerencie os parceiros e informações',
      icon: Database,
      badge: 'X parceiros',
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
      path: '/admin/cadastros/parceiros'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cadastros</h1>
        <p className="text-gray-600 mt-2">Gerencie os cadastros base da plataforma</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cadastroItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={item.id}
              className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <Badge className={item.badgeColor}>{item.badge}</Badge>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CadastrosOverview;
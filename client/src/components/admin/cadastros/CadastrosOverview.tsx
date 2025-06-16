
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Bot, FileText, Package, Building, FolderPen, Layers3, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CadastrosOverview = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/departamentos')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Layers3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Departamentos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Gerencie os departamentos da plataforma</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">3 departamentos</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/tipos-templates')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FolderPen className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Tipos de Templates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Gerencie tipos de templates e categorias</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-green-100 text-green-700 border-green-200">4 tipos</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/tipos-fornecedor')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Tipos de Fornecedor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Configure tipos e categorias de fornecedores</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">6 tipos</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/tipos-prompts-ia')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Tipos de Promt de IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Gerencie tipos de prompts de IA</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">4 tipos</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/tipos-materiais')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Tipos de Materiais</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Gerencie tipos padrão de materiais</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">9 tipos</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => navigate('/admin/cadastros/parceiros')}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Parceiros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">Gerencie os parceiros e informações</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">X parceiros</Badge>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" variant="default">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default CadastrosOverview;

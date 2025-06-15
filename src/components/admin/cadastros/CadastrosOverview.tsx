
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Bot, FileText, Package, Building } from "lucide-react";

const CadastrosOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Categorias</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">Gerencie as categorias de produtos da plataforma</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">3 categorias</Badge>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Prompts IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">Configure prompts de IA para diferentes funcionalidades</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">8 prompts</Badge>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Templates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">Gerencie templates de documentos e formulários</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">12 templates</Badge>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Materiais</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">Cadastre e gerencie tipos de materiais</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">25 materiais</Badge>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Tipos de Fornecedor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm mb-4">Configure tipos e categorias de fornecedores</p>
          <div className="flex justify-between items-center">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">6 tipos</Badge>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrosOverview;

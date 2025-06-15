
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, Database, Bot, FileText, Package, Building } from "lucide-react";
import { useParams } from "react-router-dom";

const AdminCadastros = () => {
  const { subsection } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for different registration types
  const categories = [
    { id: 1, name: "Eletrônicos", description: "Produtos eletrônicos e gadgets", items: 245, status: "active" },
    { id: 2, name: "Roupas", description: "Vestuário e acessórios", items: 156, status: "active" },
    { id: 3, name: "Casa e Jardim", description: "Itens para casa e decoração", items: 89, status: "inactive" }
  ];

  const prompts = [
    { id: 1, name: "Descrição de Produto", content: "Crie uma descrição...", category: "Marketing", usage: 1250 },
    { id: 2, name: "Análise de Mercado", content: "Analise o mercado...", category: "Análise", usage: 890 },
    { id: 3, name: "Estratégia de Preço", content: "Sugira estratégias...", category: "Preço", usage: 456 }
  ];

  const templates = [
    { id: 1, name: "Template Básico", type: "Produto", fields: 8, downloads: 340 },
    { id: 2, name: "Template Avançado", type: "Análise", fields: 15, downloads: 125 },
    { id: 3, name: "Template Importação", type: "Importação", fields: 22, downloads: 78 }
  ];

  const materials = [
    { id: 1, name: "Plástico ABS", code: "PLA001", category: "Plásticos", suppliers: 12 },
    { id: 2, name: "Aço Inoxidável", code: "ACO001", category: "Metais", suppliers: 8 },
    { id: 3, name: "Algodão 100%", code: "ALG001", category: "Têxtil", suppliers: 15 }
  ];

  const supplierTypes = [
    { id: 1, name: "Fabricante", description: "Produz os produtos", count: 45, region: "Nacional" },
    { id: 2, name: "Distribuidor", description: "Distribui produtos", count: 78, region: "Internacional" },
    { id: 3, name: "Importador", description: "Importa produtos", count: 23, region: "Asia" }
  ];

  const renderContent = () => {
    switch (subsection) {
      case "categorias":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Gerenciar Categorias</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar categorias..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{category.name}</h3>
                        <p className="text-sm text-slate-400">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-slate-500">{category.items} itens</span>
                          <Badge className={category.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                            {category.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300 hover:bg-slate-500/50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "prompts-ia":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Prompts de IA</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prompt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-100">{prompt.name}</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{prompt.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{prompt.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">{prompt.usage} usos</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300 hover:bg-slate-500/50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      // ... similar patterns for other cases
      default:
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
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Cadastros</h1>
        <p className="text-slate-400">Gerencie os cadastros base da plataforma</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default AdminCadastros;

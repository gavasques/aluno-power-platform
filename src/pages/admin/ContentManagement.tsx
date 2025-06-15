
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { 
  Users, 
  Truck, 
  Wrench, 
  FileText, 
  BookCopy, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  CheckCircle,
  XCircle 
} from "lucide-react";

const ContentManagement = () => {
  const { subsection } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const partners = [
    { id: 1, name: "Empresa ABC", type: "Distribuidor", status: "active", content: 45, rating: 4.8 },
    { id: 2, name: "Tech Solutions", type: "Tecnologia", status: "pending", content: 12, rating: 4.2 },
    { id: 3, name: "Global Trade", type: "Importador", status: "active", content: 78, rating: 4.9 }
  ];

  const suppliers = [
    { id: 1, name: "Fornecedor XYZ", category: "Eletrônicos", country: "China", products: 234, verified: true },
    { id: 2, name: "Material Plus", category: "Têxtil", country: "Brasil", products: 89, verified: false },
    { id: 3, name: "Steel Corp", category: "Metais", country: "Alemanha", products: 156, verified: true }
  ];

  const tools = [
    { id: 1, name: "Calculadora de Frete", category: "Logística", usage: 1250, status: "active" },
    { id: 2, name: "Simulador de Importação", category: "Importação", usage: 890, status: "active" },
    { id: 3, name: "Análise de Mercado", category: "Pesquisa", usage: 456, status: "maintenance" }
  ];

  const seals = [
    { id: 1, name: "Produto Verificado", type: "quality", color: "green", applied: 45 },
    { id: 2, name: "Melhor Preço", type: "price", color: "blue", applied: 23 },
    { id: 3, name: "Entrega Rápida", type: "shipping", color: "orange", applied: 67 }
  ];

  const renderContent = () => {
    switch (subsection) {
      case "parceiros":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Gerenciar Parceiros</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Parceiro
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar parceiros..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-3">
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{partner.name}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{partner.type}</Badge>
                          <span className="text-xs text-slate-500">{partner.content} conteúdos</span>
                          <span className="text-xs text-slate-500">⭐ {partner.rating}</span>
                          <Badge className={
                            partner.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            partner.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }>
                            {partner.status === 'active' ? 'Ativo' : partner.status === 'pending' ? 'Pendente' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300 hover:bg-slate-500/50">
                          <Eye className="h-4 w-4" />
                        </Button>
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

      case "selos":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Gerenciar Selos</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Selo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seals.map((seal) => (
                  <div key={seal.id} className="p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-100">{seal.name}</h3>
                      <div className={`w-4 h-4 rounded-full bg-${seal.color}-500`}></div>
                    </div>
                    <div className="space-y-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{seal.type}</Badge>
                      <p className="text-sm text-slate-400">{seal.applied} aplicações</p>
                      <div className="flex space-x-2 mt-3">
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

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Parceiros</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Gerencie parceiros e colaboradores da plataforma</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">45 parceiros</Badge>
                  <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Fornecedores</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Base de dados de fornecedores verificados</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">234 fornecedores</Badge>
                  <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Ferramentas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Ferramentas e calculadoras da plataforma</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">12 ferramentas</Badge>
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
                <p className="text-slate-400 text-sm mb-4">Templates de documentos e planilhas</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">28 templates</Badge>
                  <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookCopy className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Materiais</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Biblioteca de materiais educativos</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">89 materiais</Badge>
                  <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Selos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Sistema de selos e certificações</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">15 selos</Badge>
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
        <h1 className="text-3xl font-bold text-slate-100">Gestão de Conteúdo</h1>
        <p className="text-slate-400">Gerencie todo o conteúdo do Hub de Recursos</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default ContentManagement;

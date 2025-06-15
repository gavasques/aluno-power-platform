
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileText, Users, Wrench, Package, Award } from "lucide-react";

interface ContentManagementProps {
  subsection?: string;
}

const ContentManagement = ({ subsection }: ContentManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Conteúdo</h1>
          <p className="text-slate-400">Gerencie o hub de recursos e materiais da plataforma</p>
        </div>
        <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <Tabs defaultValue="hub" className="space-y-6">
        <TabsList className="bg-slate-700/50 border-red-500/20">
          <TabsTrigger value="hub" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <FileText className="h-4 w-4 mr-2" />
            Hub de Recursos
          </TabsTrigger>
          <TabsTrigger value="selos" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <Award className="h-4 w-4 mr-2" />
            Selos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hub">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Parceiros</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Gerencie parceiros e suas informações</p>
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
                  <Package className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Fornecedores</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Cadastro e gestão de fornecedores</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">128 fornecedores</Badge>
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
                <p className="text-slate-400 text-sm mb-4">Ferramentas disponíveis na plataforma</p>
                <div className="flex justify-between items-center">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">12 ferramentas</Badge>
                  <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="selos">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Gestão de Selos</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Selo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar selos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum selo encontrado</p>
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

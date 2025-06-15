
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { 
  Settings, 
  CreditCard, 
  FileText, 
  Newspaper, 
  Save, 
  Plus,
  Edit,
  Trash2,
  DollarSign
} from "lucide-react";

const GeneralSettings = () => {
  const { subsection } = useParams();

  const aiCreditPrices = [
    { id: 1, model: "GPT-4", operation: "Texto", credits: 10, price: 0.50 },
    { id: 2, model: "GPT-4", operation: "Análise", credits: 25, price: 1.25 },
    { id: 3, model: "DALL-E", operation: "Imagem", credits: 50, price: 2.00 }
  ];

  const responseTemplates = [
    { id: 1, name: "Boas-vindas", category: "Geral", usage: 450 },
    { id: 2, name: "Problema Técnico", category: "Suporte", usage: 123 },
    { id: 3, name: "Confirmação de Cadastro", category: "Usuário", usage: 890 }
  ];

  const newsItems = [
    { id: 1, title: "Nova funcionalidade: Simulador Avançado", date: "2024-01-15", active: true },
    { id: 2, title: "Manutenção programada - Sistema", date: "2024-01-10", active: false },
    { id: 3, title: "Parceria com novos fornecedores", date: "2024-01-05", active: true }
  ];

  const renderContent = () => {
    switch (subsection) {
      case "plataforma":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-red-400" />
                <CardTitle className="text-slate-100">Configurações da Plataforma</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Nome da Plataforma</Label>
                    <Input 
                      defaultValue="Portal do Aluno" 
                      className="bg-slate-600/50 border-red-500/20 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">URL Base</Label>
                    <Input 
                      defaultValue="https://portal.exemplo.com" 
                      className="bg-slate-600/50 border-red-500/20 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Email de Suporte</Label>
                    <Input 
                      defaultValue="suporte@exemplo.com" 
                      className="bg-slate-600/50 border-red-500/20 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Registros Públicos</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Modo Manutenção</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Notificações por Email</Label>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label className="text-slate-300">Limite de Upload (MB)</Label>
                    <Input 
                      type="number" 
                      defaultValue="10" 
                      className="bg-slate-600/50 border-red-500/20 text-slate-100"
                    />
                  </div>
                </div>
              </div>
              <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        );

      case "creditos-ia":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Preços de Créditos IA</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Preço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiCreditPrices.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-slate-400">Modelo</span>
                        <p className="font-medium text-slate-100">{price.model}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Operação</span>
                        <p className="font-medium text-slate-100">{price.operation}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Créditos</span>
                        <p className="font-medium text-slate-100">{price.credits}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Preço (R$)</span>
                        <p className="font-medium text-slate-100">{price.price.toFixed(2)}</p>
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
            </CardContent>
          </Card>
        );

      case "templates-resposta":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Templates de Resposta</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responseTemplates.map((template) => (
                  <div key={template.id} className="p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-100">{template.name}</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{template.category}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">{template.usage} usos</span>
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

      case "feed-noticias":
        return (
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Newspaper className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Feed de Notícias</CardTitle>
                </div>
                <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notícia
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsItems.map((news) => (
                  <div key={news.id} className="flex items-center justify-between p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100">{news.title}</h3>
                      <p className="text-sm text-slate-400">{news.date}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={news.active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                        {news.active ? 'Ativo' : 'Inativo'}
                      </Badge>
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

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Plataforma</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Configurações gerais da plataforma</p>
                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                  Configurar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Créditos IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Preços e configuração de créditos</p>
                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                  Gerenciar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Templates de Resposta</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Templates para suporte e comunicação</p>
                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                  Gerenciar
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Newspaper className="h-5 w-5 text-red-400" />
                  <CardTitle className="text-slate-100">Feed de Notícias</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Gerenciar notícias do dashboard</p>
                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
                  Gerenciar
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Configurações Gerais</h1>
        <p className="text-slate-400">Configure aspectos gerais da plataforma</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default GeneralSettings;


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Settings, CreditCard, MessageSquare, Rss, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneralSettingsProps {
  subsection?: string;
}

const GeneralSettings = ({ subsection = "geral" }: GeneralSettingsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(subsection);

  // Estados para configurações
  const [generalConfig, setGeneralConfig] = useState({
    siteName: "Plataforma E-commerce",
    siteDescription: "Plataforma completa para gestão de e-commerce",
    supportEmail: "suporte@plataforma.com",
    maxUsers: 1000,
    enableRegistration: true,
    maintenanceMode: false
  });

  const [creditConfig, setCreditConfig] = useState({
    pricePerCredit: 0.05,
    minimumPurchase: 100,
    bonusPercentage: 10,
    expirationDays: 365
  });

  const [responseTemplates, setResponseTemplates] = useState([
    { id: "1", name: "Boas-vindas", subject: "Bem-vindo à plataforma!", content: "Olá {nome}, seja bem-vindo...", active: true },
    { id: "2", name: "Problema Técnico", subject: "Resolução de problema", content: "Identificamos o problema...", active: true },
    { id: "3", name: "Solicitação Recurso", subject: "Sobre sua solicitação", content: "Recebemos sua sugestão...", active: true }
  ]);

  const [newsItems, setNewsItems] = useState([
    { id: "1", title: "Nova funcionalidade lançada", content: "Agora você pode...", date: "2024-01-15", active: true },
    { id: "2", title: "Manutenção programada", content: "Teremos manutenção...", date: "2024-01-20", active: true },
    { id: "3", title: "Atualização de segurança", content: "Implementamos melhorias...", date: "2024-01-25", active: false }
  ]);

  const handleSaveGeneral = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações gerais foram atualizadas com sucesso.",
    });
  };

  const handleSaveCredits = () => {
    toast({
      title: "Configurações de créditos salvas",
      description: "Os preços e configurações de créditos foram atualizados.",
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setResponseTemplates(responseTemplates.filter(t => t.id !== templateId));
    toast({
      title: "Template removido",
      description: "Template de resposta removido com sucesso.",
    });
  };

  const handleDeleteNews = (newsId: string) => {
    setNewsItems(newsItems.filter(n => n.id !== newsId));
    toast({
      title: "Notícia removida",
      description: "Notícia removida do feed com sucesso.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">Gerencie configurações da plataforma, preços e templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="creditos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Créditos IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="noticias" className="flex items-center gap-2">
            <Rss className="h-4 w-4" />
            Feed Notícias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome da Plataforma</Label>
                  <Input
                    id="siteName"
                    value={generalConfig.siteName}
                    onChange={(e) => setGeneralConfig({...generalConfig, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalConfig.supportEmail}
                    onChange={(e) => setGeneralConfig({...generalConfig, supportEmail: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição da Plataforma</Label>
                <Textarea
                  id="siteDescription"
                  value={generalConfig.siteDescription}
                  onChange={(e) => setGeneralConfig({...generalConfig, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Máximo de Usuários</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={generalConfig.maxUsers}
                    onChange={(e) => setGeneralConfig({...generalConfig, maxUsers: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRegistration">Permitir Novos Registros</Label>
                    <p className="text-sm text-muted-foreground">Permite que novos usuários se registrem na plataforma</p>
                  </div>
                  <Switch
                    id="enableRegistration"
                    checked={generalConfig.enableRegistration}
                    onCheckedChange={(checked) => setGeneralConfig({...generalConfig, enableRegistration: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">Ativa o modo de manutenção para a plataforma</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={generalConfig.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralConfig({...generalConfig, maintenanceMode: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGeneral} className="w-full">
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Créditos de IA</CardTitle>
              <p className="text-sm text-muted-foreground">Gerencie preços e regras dos créditos de IA</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pricePerCredit">Preço por Crédito (R$)</Label>
                  <Input
                    id="pricePerCredit"
                    type="number"
                    step="0.01"
                    value={creditConfig.pricePerCredit}
                    onChange={(e) => setCreditConfig({...creditConfig, pricePerCredit: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPurchase">Compra Mínima (créditos)</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    value={creditConfig.minimumPurchase}
                    onChange={(e) => setCreditConfig({...creditConfig, minimumPurchase: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bonusPercentage">Bônus por Compra (%)</Label>
                  <Input
                    id="bonusPercentage"
                    type="number"
                    value={creditConfig.bonusPercentage}
                    onChange={(e) => setCreditConfig({...creditConfig, bonusPercentage: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDays">Expiração (dias)</Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    value={creditConfig.expirationDays}
                    onChange={(e) => setCreditConfig({...creditConfig, expirationDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Prévia de Preços</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">100 créditos:</span>
                    <p className="font-medium">R$ {(100 * creditConfig.pricePerCredit).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">500 créditos:</span>
                    <p className="font-medium">R$ {(500 * creditConfig.pricePerCredit).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">1000 créditos:</span>
                    <p className="font-medium">R$ {(1000 * creditConfig.pricePerCredit).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveCredits} className="w-full">
                Salvar Configurações de Créditos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de Resposta</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responseTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.content}</TableCell>
                      <TableCell>
                        <Badge variant={template.active ? "default" : "secondary"}>
                          {template.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
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

        <TabsContent value="noticias" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Feed de Notícias do Dashboard</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Notícia
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsItems.map((news) => (
                    <TableRow key={news.id}>
                      <TableCell className="font-medium">{news.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{news.content}</TableCell>
                      <TableCell>{news.date}</TableCell>
                      <TableCell>
                        <Badge variant={news.active ? "default" : "secondary"}>
                          {news.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteNews(news.id)}>
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

export default GeneralSettings;

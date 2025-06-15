
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard, MessageSquare, Newspaper, Save } from "lucide-react";

interface GeneralSettingsProps {
  subsection?: string;
}

const GeneralSettings = ({ subsection }: GeneralSettingsProps) => {
  const [settings, setSettings] = useState({
    siteName: "LV Brasil",
    siteDescription: "Plataforma de ensino e desenvolvimento",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Configurações</h1>
          <p className="text-slate-400">Configurações gerais da plataforma</p>
        </div>
        <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>

      <Tabs defaultValue="plataforma" className="space-y-6">
        <TabsList className="bg-slate-700/50 border-red-500/20">
          <TabsTrigger value="plataforma" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <Settings className="h-4 w-4 mr-2" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="creditos" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <CreditCard className="h-4 w-4 mr-2" />
            Créditos IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="noticias" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-slate-300">
            <Newspaper className="h-4 w-4 mr-2" />
            Notícias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plataforma">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Configurações da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-slate-300">Nome da Plataforma</Label>
                <Input 
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="bg-slate-600/50 border-red-500/20 text-slate-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-slate-300">Descrição</Label>
                <Textarea 
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="bg-slate-600/50 border-red-500/20 text-slate-100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
                <Label htmlFor="maintenance" className="text-slate-300">Modo de Manutenção</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="registration"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, registrationEnabled: checked})}
                />
                <Label htmlFor="registration" className="text-slate-300">Permitir Novos Registros</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditos">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Configurações de Créditos IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Configurações de créditos IA em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Templates de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Templates de resposta em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="noticias">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Feed de Notícias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Configurações do feed de notícias em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralSettings;

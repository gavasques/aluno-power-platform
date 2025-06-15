
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
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Configurações gerais da plataforma</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>

      <Tabs defaultValue="plataforma" className="space-y-6">
        <TabsList className="bg-white border border-border">
          <TabsTrigger value="plataforma" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="creditos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <CreditCard className="h-4 w-4 mr-2" />
            Créditos IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="noticias" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
            <Newspaper className="h-4 w-4 mr-2" />
            Notícias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plataforma">
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Configurações da Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-foreground">Nome da Plataforma</Label>
                <Input 
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="bg-white border border-input text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-foreground">Descrição</Label>
                <Textarea 
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="bg-white border border-input text-foreground"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
                <Label htmlFor="maintenance" className="text-foreground">Modo de Manutenção</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="registration"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, registrationEnabled: checked})}
                />
                <Label htmlFor="registration" className="text-foreground">Permitir Novos Registros</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditos">
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Configurações de Créditos IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações de créditos IA em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Templates de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Templates de resposta em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="noticias">
          <Card className="bg-white border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Feed de Notícias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações do feed de notícias em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralSettings;

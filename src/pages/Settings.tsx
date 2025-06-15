
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              O tema da aplicação está definido como claro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O tema claro está ativo por padrão para melhor experiência do usuário.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outras Configurações</CardTitle>
            <CardDescription>
              Configurações adicionais serão implementadas aqui no futuro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta seção está sendo preparada para futuras funcionalidades de configuração.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

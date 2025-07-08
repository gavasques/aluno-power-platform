import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export default function SimuladoresDebug() {
  const simuladores = [
    {
      id: "simples-nacional",
      title: "Simples Nacional",
      description: "Calcule impostos e alíquotas do Simples Nacional",
      href: "/simuladores/simulador-simples-nacional-completo",
      category: "Tributário",
      isAvailable: true,
    },
    {
      id: "importacao-simplificada",
      title: "Importação Simplificada",
      description: "Simule custos de importação via courier",
      href: "/simuladores/importacao-simplificada", 
      category: "Importação",
      isAvailable: true,
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simuladores</h1>
        <p className="text-muted-foreground">
          Ferramentas de simulação para análise de negócios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simuladores.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                {item.description}
              </CardDescription>
              
              <Button asChild className="w-full" disabled={!item.isAvailable}>
                <Link to={item.href}>
                  <Calculator className="w-4 h-4 mr-2" />
                  {item.isAvailable ? 'Simular' : 'Em breve'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
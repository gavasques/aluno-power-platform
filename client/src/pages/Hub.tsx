import { 
  Users, 
  Truck, 
  Wrench, 
  FileText, 
  BookCopy,
  ArrowRight,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const hubItems = [
  {
    title: "Parceiros",
    description: "Rede de parceiros e colaboradores da plataforma",
    href: "/hub/parceiros",
    icon: Users,
    category: "Rede",
    permission: "hub.partners"
  },
  {
    title: "Fornecedores",
    description: "Diretório público de fornecedores verificados",
    href: "/hub/fornecedores",
    icon: Truck,
    category: "Fornecedores",
    permission: "hub.suppliers"
  },
  {
    title: "Ferramentas",
    description: "Catálogo de ferramentas externas recomendadas",
    href: "/hub/ferramentas",
    icon: Wrench,
    category: "Ferramentas",
    permission: "hub.tools"
  },

  {
    title: "Materiais",
    description: "Biblioteca de materiais educativos e guias",
    href: "/hub/materiais",
    icon: BookCopy,
    category: "Recursos",
    permission: "hub.materials"
  }
];

const categories = ["Todos", "Conteúdo", "Rede", "Fornecedores", "Ferramentas", "Recursos"];

export default function Hub() {
  const { hasAccess, isLoading } = usePermissions();
  const { toast } = useToast();

  const handleAccessDenied = (itemTitle: string) => {
    toast({
      title: "Acesso Negado",
      description: `Você não tem permissão para acessar ${itemTitle}. Este recurso é exclusivo de determinadas turmas do curso ou mentorias.`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse bg-gray-200 rounded h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Hub de Recursos</h1>
        <p className="text-muted-foreground">
          Central de conhecimento e recursos para seu crescimento no e-commerce
        </p>
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge 
            key={category}
            variant={category === "Todos" ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary/80"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Grid de recursos do hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubItems.map((item) => {
          const hasPermission = hasAccess(item.permission);
          
          if (hasPermission) {
            return (
              <Link key={item.href} href={item.href}>
                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <item.icon className="h-8 w-8 text-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                      <span className="text-sm font-medium">Acessar seção</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          } else {
            return (
              <Card key={item.href} className="relative opacity-50 cursor-not-allowed" onClick={() => handleAccessDenied(item.title)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <item.icon className="h-8 w-8 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-muted-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Acesso seção</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/30">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
              </Card>
            );
          }
        })}
      </div>


    </div>
  );
}
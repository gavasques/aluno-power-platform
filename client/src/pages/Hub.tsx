import { 
  Youtube, 
  Users, 
  Truck, 
  Wrench, 
  FileText, 
  BookCopy,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/ui/permission-guard";

const hubItems = [
  {
    title: "Vídeos",
    description: "Biblioteca de vídeos educativos e tutoriais sobre e-commerce",
    href: "/videos",
    icon: Youtube,
    category: "Conteúdo",
    permission: "hub.videos"
  },
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
    title: "Templates",
    description: "Templates prontos para usar em seus projetos",
    href: "/hub/templates",
    icon: FileText,
    category: "Recursos",
    permission: "hub.templates"
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
        {hubItems.map((item) => (
          <PermissionGuard key={item.href} requiredFeature={item.permission}>
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
                <Link href={item.href}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <span className="text-sm font-medium">Acessar seção</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </PermissionGuard>
        ))}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">150+</div>
            <div className="text-sm text-muted-foreground">Vídeos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Parceiros</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">200+</div>
            <div className="text-sm text-muted-foreground">Fornecedores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">100+</div>
            <div className="text-sm text-muted-foreground">Materiais</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
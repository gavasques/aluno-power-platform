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
import { PermissionGuard } from "@/components/guards";

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
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Hub de Recursos</h1>
        <p className="text-sm text-muted-foreground">
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

      {/* Grid de recursos do hub - 4 COLUNAS COMPACTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {hubItems.map((item) => (
          <PermissionGuard key={item.href} featureCode={item.permission}>
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-fit compact-card">
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {item.category}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Link href={item.href}>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <span className="text-xs font-medium">Acessar seção</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </PermissionGuard>
        ))}
      </div>


    </div>
  );
}
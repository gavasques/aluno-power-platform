import { 
  ImageIcon, 
  Zap, 
  Star, 
  FileDigit, 
  Package, 
  Building, 
  Tag,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/guards";

const ferramentas = [
  {
    title: "Upscale de Imagem",
    description: "Melhore a qualidade e resolução das suas imagens de produto",
    href: "/ferramentas/image-upscale",
    icon: ImageIcon,
    category: "Imagem",
    credits: 2,
    permission: "tools.image_upscale"
  },
  {
    title: "Remover Background",
    description: "Remova o fundo das suas imagens automaticamente",
    href: "/ferramentas/background-removal",
    icon: Zap,
    category: "Imagem", 
    credits: 1,
    permission: "tools.background_removal"
  },
  {
    title: "Remover de Fundo PRO",
    description: "Remova backgrounds de imagens com precisão de IA profissional",
    href: "/ferramentas/background-removal-pro",
    icon: Sparkles,
    category: "Imagem",
    credits: 2,
    permission: "tools.picsart_background_removal"
  },
  {
    title: "Amazon Reviews",
    description: "Extraia e analise reviews de produtos da Amazon",
    href: "/ferramentas/amazon-reviews",
    icon: Star,
    category: "Amazon",
    credits: 5,
    permission: "tools.amazon_reviews"
  },
  {
    title: "Relatório de Keywords",
    description: "Gere relatórios detalhados de palavras-chave",
    href: "/ferramentas/relatorio-keywords",
    icon: FileDigit,
    category: "Amazon",
    credits: 3,
    permission: "tools.keyword_report"
  },
  {
    title: "Detalhes do Produto",
    description: "Obtenha informações detalhadas de produtos Amazon",
    href: "/ferramentas/produto-detalhes",
    icon: Package,
    category: "Amazon",
    credits: 3,
    permission: "tools.product_details"
  },
  {
    title: "Consulta de CNPJ",
    description: "Consulte informações detalhadas de empresas por CNPJ",
    href: "/ferramentas/consulta-cnpj",
    icon: Building,
    category: "Empresas",
    credits: 1,
    permission: "tools.cnpj_lookup"
  },
  {
    title: "Amazon Keyword Suggestions",
    description: "Obtenha sugestões de palavras-chave para Amazon",
    href: "/ferramentas/keyword-suggestions",
    icon: Tag,
    category: "Amazon",
    credits: 3,
    permission: "tools.keyword_suggestions"
  }
];

const categories = ["Todos", "Imagem", "Amazon", "Empresas"];

export default function Ferramentas() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Ferramentas</h1>
        <p className="text-muted-foreground">
          Acesse todas as ferramentas disponíveis para otimizar seu negócio
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

      {/* Grid de ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ferramentas.map((ferramenta) => (
          <PermissionGuard key={ferramenta.href} featureCode={ferramenta.permission}>
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <ferramenta.icon className="h-8 w-8 text-primary" />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ferramenta.credits} {ferramenta.credits === 1 ? 'crédito' : 'créditos'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {ferramenta.category}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{ferramenta.title}</CardTitle>
                <CardDescription className="text-sm">
                  {ferramenta.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={ferramenta.href}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <span className="text-sm font-medium">Acessar ferramenta</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
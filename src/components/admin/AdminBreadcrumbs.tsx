
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/cadastros": "Cadastros",
  "/admin/cadastros/departamentos": "Departamentos",
  "/admin/cadastros/tipos-templates": "Tipos de Templates",
  "/admin/cadastros/tipos-fornecedor": "Tipos de Fornecedor",
  "/admin/cadastros/tipos-prompts-ia": "Tipos de Prompts IA",
  "/admin/cadastros/tipos-materiais": "Tipos de Materiais",
  "/admin/cadastros/tipos-ferramentas": "Tipos de Ferramentas",
  "/admin/cadastros/parceiros": "Parceiros",
  "/admin/cadastros/templates": "Templates",
  "/admin/cadastros/prompts-ia": "Prompts IA",
  "/admin/usuarios": "Usuários",
  "/admin/conteudo": "Gestão de Conteúdo",
  "/admin/conteudo/parceiros": "Parceiros",
  "/admin/conteudo/fornecedores": "Fornecedores",
  "/admin/conteudo/ferramentas": "Ferramentas",
  "/admin/conteudo/templates": "Templates",
  "/admin/conteudo/materiais": "Materiais",
  "/admin/conteudo/selos": "Selos",
  "/admin/suporte": "Suporte",
  "/admin/configuracoes": "Configurações",
  "/admin/configuracoes/plataforma": "Plataforma",
  "/admin/configuracoes/creditos-ia": "Créditos IA",
  "/admin/configuracoes/templates-resposta": "Templates de Resposta",
  "/admin/configuracoes/feed-noticias": "Feed de Notícias",
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = [];
  
  // Sempre adiciona o dashboard como primeiro item
  breadcrumbs.push({
    path: "/admin",
    label: "Dashboard",
    isLast: pathSegments.length === 1
  });
  
  // Constrói os breadcrumbs baseado no caminho atual
  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += "/" + pathSegments[i];
    
    if (currentPath !== "/admin" && breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: breadcrumbMap[currentPath],
        isLast: i === pathSegments.length - 1
      });
    }
  }

  const handleGoBack = () => {
    if (breadcrumbs.length > 1) {
      const previousPath = breadcrumbs[breadcrumbs.length - 2].path;
      navigate(previousPath);
    } else {
      navigate("/admin");
    }
  };

  const canGoBack = location.pathname !== "/admin" && location.pathname !== "/admin/dashboard";

  return (
    <div className="flex items-center space-x-4 py-4 px-6 bg-gray-50 border-b border-border">
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      )}
      
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <BreadcrumbItem key={breadcrumb.path}>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="text-primary font-medium">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink 
                    asChild
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Link to={breadcrumb.path}>
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

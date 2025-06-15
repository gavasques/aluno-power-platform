
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
  "/admin/cadastros/categorias": "Categorias",
  "/admin/cadastros/prompts-ia": "Prompts IA",
  "/admin/cadastros/templates": "Templates",
  "/admin/cadastros/materiais": "Materiais",
  "/admin/cadastros/tipos-fornecedor": "Tipos de Fornecedor",
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
    <div className="flex items-center space-x-4 py-4 px-6 bg-slate-900/50 border-b border-red-500/20">
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                <BreadcrumbPage className="text-red-400 font-medium">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink 
                    asChild
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Link to={breadcrumb.path}>
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
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

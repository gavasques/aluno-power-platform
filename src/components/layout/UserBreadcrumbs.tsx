
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
  "/": "Dashboard",
  "/hub/parceiros": "Parceiros",
  "/hub/ferramentas": "Ferramentas",
  "/hub/materiais": "Materiais", 
  "/hub/fornecedores": "Fornecedores",
  "/hub/templates": "Templates",
  "/hub/prompts-ia": "Prompts IA",
  "/minha-area/fornecedores": "Meus Fornecedores",
  "/minha-area/produtos": "Meus Produtos",
  "/minha-area/materiais": "Meus Materiais",
};

export function UserBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = [];
  
  // Sempre adiciona o dashboard como primeiro item se não estiver na página inicial
  if (location.pathname !== "/") {
    breadcrumbs.push({
      path: "/",
      label: "Dashboard",
      isLast: false
    });
  }
  
  // Constrói os breadcrumbs baseado no caminho atual
  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += "/" + pathSegments[i];
    
    if (breadcrumbMap[currentPath]) {
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
      navigate("/");
    }
  };

  const canGoBack = location.pathname !== "/" && breadcrumbs.length > 1;

  // Não mostrar breadcrumbs na página inicial
  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 py-4 px-6 bg-gray-50/50 border-b border-border">
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

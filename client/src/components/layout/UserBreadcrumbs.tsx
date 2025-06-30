
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
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
  "/hub/descricao-html": "Descrição em HTML",
  "/minha-area/fornecedores": "Meus Fornecedores",
  "/minha-area/produtos": "Meus Produtos",
  "/minha-area/materiais": "Meus Materiais",
};

export function UserBreadcrumbs() {
  const [location, setLocation] = useLocation();
  
  const pathSegments = location.split("/").filter(Boolean);
  const breadcrumbs = [];
  
  // Sempre adiciona o dashboard como primeiro item se não estiver na página inicial
  if (location !== "/") {
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
    
    // Verifica se é uma rota de detalhes de ferramenta
    if (pathSegments[i-1] === "ferramentas" && pathSegments[i-2] === "hub" && !breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: "Detalhes da Ferramenta",
        isLast: i === pathSegments.length - 1
      });
    }
    // Verifica se é uma rota de detalhes de material do hub
    else if (pathSegments[i-1] === "materiais" && pathSegments[i-2] === "hub" && !breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: "Detalhes do Material",
        isLast: i === pathSegments.length - 1
      });
    }
    // Verifica se é uma rota de detalhes de fornecedor do hub
    else if (pathSegments[i-1] === "fornecedores" && pathSegments[i-2] === "hub" && !breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: "Detalhes do Fornecedor",
        isLast: i === pathSegments.length - 1
      });
    }
    // Verifica se é uma rota de detalhes de template
    else if (pathSegments[i-1] === "templates" && pathSegments[i-2] === "hub" && !breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: "Detalhes do Template",
        isLast: i === pathSegments.length - 1
      });
    }
    // Verifica se é uma rota de detalhes de prompt
    else if (pathSegments[i-1] === "prompts-ia" && pathSegments[i-2] === "hub" && !breadcrumbMap[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: "Detalhes do Prompt",
        isLast: i === pathSegments.length - 1
      });
    }
    else if (breadcrumbMap[currentPath]) {
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
      setLocation(previousPath);
    } else {
      setLocation("/");
    }
  };

  const canGoBack = location !== "/" && breadcrumbs.length > 1;

  // Não mostrar breadcrumbs na página inicial
  if (location === "/") {
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

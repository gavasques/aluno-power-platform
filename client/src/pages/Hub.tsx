
import { useParams } from "wouter";
import PromptsIA from "./hub/PromptsIA";
import Materials from "./hub/Materials";
import Templates from "./hub/Templates";
import Tools from "./hub/Tools";
import Suppliers from "./hub/Suppliers";
import Partners from "./hub/Partners";
import AmazonReviewExtractor from "./hub/AmazonReviewExtractor";
import KeywordSearchReport from "./hub/KeywordSearchReport";
import AmazonProductDetails from "./hub/AmazonProductDetails";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/contexts/PermissionContext";

const Hub = () => {
  const { section } = useParams();
  const { isLoading } = usePermissions();

  // Show loading state while permissions are being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Renderizar componente específico baseado na seção
  switch (section) {
    case "parceiros":
      return (
        <PermissionGuard featureCode="hub.partners.view">
          <Partners />
        </PermissionGuard>
      );
    case "prompts-ia":
      return (
        <PermissionGuard featureCode="hub.prompts.view">
          <PromptsIA />
        </PermissionGuard>
      );
    case "materiais":
      return (
        <PermissionGuard featureCode="hub.materials.view">
          <Materials />
        </PermissionGuard>
      );
    case "templates":
      return (
        <PermissionGuard featureCode="hub.templates.view">
          <Templates />
        </PermissionGuard>
      );
    case "ferramentas":
      return (
        <PermissionGuard featureCode="hub.tools.view">
          <Tools />
        </PermissionGuard>
      );
    case "fornecedores":
      return (
        <PermissionGuard featureCode="hub.suppliers.view">
          <Suppliers />
        </PermissionGuard>
      );
    case "amazon-reviews":
      return (
        <PermissionGuard featureCode="hub.tools.view">
          <AmazonReviewExtractor />
        </PermissionGuard>
      );
    case "relatorio-keywords":
      return (
        <PermissionGuard featureCode="hub.tools.view">
          <KeywordSearchReport />
        </PermissionGuard>
      );
    case "produto-detalhes":
      return (
        <PermissionGuard featureCode="hub.tools.view">
          <AmazonProductDetails />
        </PermissionGuard>
      );
    default:
      const title = section ? section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ") : "Hub de Recursos";
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground">O conteúdo para a seção <span className="font-semibold text-foreground">{title}</span> será implementado aqui. Este é um espaço reservado para a funcionalidade futura.</p>
        </div>
      );
  }
};

export default Hub;

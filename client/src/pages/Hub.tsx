
import { useParams } from "wouter";
import PromptsIA from "./hub/PromptsIA";
import Materials from "./hub/Materials";
import Templates from "./hub/Templates";
import Tools from "./hub/Tools";
import Suppliers from "./hub/Suppliers";
import Partners from "./hub/Partners";
import AmazonReviewExtractor from "./hub/AmazonReviewExtractor";
import KeywordSearchReport from "./hub/KeywordSearchReport";

const Hub = () => {
  const { section } = useParams();

  // Renderizar componente específico baseado na seção
  switch (section) {
    case "parceiros":
      return <Partners />;
    case "prompts-ia":
      return <PromptsIA />;
    case "materiais":
      return <Materials />;
    case "templates":
      return <Templates />;
    case "ferramentas":
      return <Tools />;
    case "fornecedores":
      return <Suppliers />;
    case "amazon-reviews":
      return <AmazonReviewExtractor />;
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

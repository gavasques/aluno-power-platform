
import DepartmentsManagerRefactored from "@/components/admin/cadastros/DepartmentsManagerRefactored";

import SupplierTypesManagerOptimized from "@/components/admin/cadastros/SupplierTypesManagerOptimized";
import PartnerTypesManagerOptimized from "@/components/admin/cadastros/PartnerTypesManagerOptimized";
import PromptTypesManagerOptimized from "@/components/admin/cadastros/PromptTypesManagerOptimized";

import MaterialCategoriesManager from "@/components/admin/materials/MaterialCategoriesManager";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import CadastrosOverview from "@/components/admin/cadastros/CadastrosOverview";
import ToolTypesManagerOptimized from "@/components/admin/cadastros/ToolTypesManagerOptimized";

import PromptsAIManager from "@/components/admin/cadastros/PromptsAIManager";

interface AdminCadastrosProps {
  subsection?: string;
}

const AdminCadastros = ({ subsection }: AdminCadastrosProps) => {
  const renderContent = () => {
    switch (subsection) {
      case "departamentos":
        return <DepartmentsManagerRefactored />;

      case "tipos-fornecedor":
        return <SupplierTypesManagerOptimized />;
      case "tipos-parceiro":
        return <PartnerTypesManagerOptimized />;
      case "tipos-prompts-ia":
        return <PromptTypesManagerOptimized />;
      case "tipos-materiais":
        return <MaterialCategoriesManager />;
      case "categorias-materiais":
        return <MaterialCategoriesManager />;
      case "tipos-ferramentas":
        return <ToolTypesManagerOptimized />;
      case "parceiros":
        return <PartnersManager />;

      case "prompts-ia":
        return <PromptsAIManager />;
      default:
        return <CadastrosOverview />;
    }
  };

  const getTitle = () => {
    switch (subsection) {
      case "departamentos":
        return "Gerenciar Departamentos";

      case "tipos-fornecedor":
        return "Gerenciar Tipos de Fornecedor";
      case "tipos-prompts-ia":
        return "Gerenciar Tipos de Prompts IA";
      case "tipos-materiais":
        return "Gerenciar Tipos de Materiais";
      case "tipos-ferramentas":
        return "Gerenciar Tipos de Ferramentas";
      case "parceiros":
        return "Gerenciar Parceiros";

      case "prompts-ia":
        return "Gerenciar Prompts de IA";
      default:
        return "Cadastros";
    }
  };

  const getDescription = () => {
    switch (subsection) {
      case "departamentos":
        return "Gerencie os departamentos da plataforma";

      case "tipos-fornecedor":
        return "Configure tipos e categorias de fornecedores";
      case "tipos-parceiro":
        return "Configure tipos e categorias de parceiros";
      case "tipos-prompts-ia":
        return "Gerencie tipos de prompts de IA";
      case "tipos-materiais":
        return "Gerencie tipos padrão de materiais";
      case "categorias-materiais":
        return "Gerencie categorias de materiais";
      case "tipos-ferramentas":
        return "Gerencie tipos e categorias de ferramentas";
      case "parceiros":
        return "Gerencie os parceiros e informações";

      case "prompts-ia":
        return "Gerencie prompts de inteligência artificial";
      default:
        return "Gerencie os cadastros base da plataforma";
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default AdminCadastros;

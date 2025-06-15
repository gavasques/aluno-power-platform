
import DepartmentsManager from "@/components/admin/cadastros/DepartmentsManager";
import TemplateTypesManager from "@/components/admin/cadastros/TemplateTypesManager";
import SupplierTypesManager from "@/components/admin/cadastros/SupplierTypesManager";
import PromptTypesManager from "@/components/admin/cadastros/PromptTypesManager";
import MaterialTypesManager from "@/components/admin/cadastros/MaterialTypesManager";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import CadastrosOverview from "@/components/admin/cadastros/CadastrosOverview";
import ToolTypesManager from "@/components/admin/cadastros/ToolTypesManager";

interface AdminCadastrosProps {
  subsection?: string;
}

const AdminCadastros = ({ subsection }: AdminCadastrosProps) => {
  const renderContent = () => {
    switch (subsection) {
      case "departamentos":
        return <DepartmentsManager />;
      case "tipos-templates":
        return <TemplateTypesManager />;
      case "tipos-fornecedor":
        return <SupplierTypesManager />;
      case "tipos-prompts-ia":
        return <PromptTypesManager />;
      case "tipos-materiais":
        return <MaterialTypesManager />;
      case "tipos-ferramentas":
        return <ToolTypesManager />;
      case "parceiros":
        return <PartnersManager />;
      default:
        return <CadastrosOverview />;
    }
  };

  const getTitle = () => {
    switch (subsection) {
      case "departamentos":
        return "Gerenciar Departamentos";
      case "tipos-templates":
        return "Gerenciar Tipos de Templates";
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
      default:
        return "Cadastros";
    }
  };

  const getDescription = () => {
    switch (subsection) {
      case "departamentos":
        return "Gerencie os departamentos da plataforma";
      case "tipos-templates":
        return "Gerencie tipos de templates e categorias";
      case "tipos-fornecedor":
        return "Configure tipos e categorias de fornecedores";
      case "tipos-prompts-ia":
        return "Gerencie tipos de prompts de IA";
      case "tipos-materiais":
        return "Gerencie tipos padrão de materiais";
      case "tipos-ferramentas":
        return "Gerencie tipos e categorias de ferramentas";
      case "parceiros":
        return "Gerencie os parceiros e informações";
      default:
        return "Gerencie os cadastros base da plataforma";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
        <p className="text-muted-foreground">{getDescription()}</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default AdminCadastros;

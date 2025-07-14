
import DepartmentsManager from "@/components/admin/cadastros/DepartmentsManager";

import SupplierTypesManager from "@/components/admin/cadastros/SupplierTypesManager";
import PartnerTypesManager from "@/components/admin/cadastros/PartnerTypesManager";
import MaterialTypesManager from "@/components/admin/cadastros/MaterialTypesManager";
import MaterialCategoriesManager from "@/components/admin/materials/MaterialCategoriesManager";
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

      case "tipos-fornecedor":
        return <SupplierTypesManager />;
      case "tipos-parceiro":
        return <PartnerTypesManager />;
      case "tipos-materiais":
        return <MaterialTypesManager />;
      case "categorias-materiais":
        return <MaterialCategoriesManager />;
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

      case "tipos-fornecedor":
        return "Gerenciar Tipos de Fornecedor";
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

      case "tipos-fornecedor":
        return "Configure tipos e categorias de fornecedores";
      case "tipos-parceiro":
        return "Configure tipos e categorias de parceiros";
      case "tipos-materiais":
        return "Gerencie tipos padrão de materiais";
      case "categorias-materiais":
        return "Gerencie categorias de materiais";
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
      {renderContent()}
    </div>
  );
};

export default AdminCadastros;


import DepartmentsManager from "@/components/admin/cadastros/DepartmentsManager";
import TemplateTypesManager from "@/components/admin/cadastros/TemplateTypesManager";
import SupplierTypesManager from "@/components/admin/cadastros/SupplierTypesManager";
import PromptTypesManager from "@/components/admin/cadastros/PromptTypesManager";
import MaterialTypesManager from "@/components/admin/cadastros/MaterialTypesManager";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import CadastrosOverview from "@/components/admin/cadastros/CadastrosOverview";

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
      case "parceiros":
        return <PartnersManager />;
      default:
        return <CadastrosOverview />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Cadastros</h1>
        <p className="text-slate-400">Gerencie os cadastros base da plataforma</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default AdminCadastros;

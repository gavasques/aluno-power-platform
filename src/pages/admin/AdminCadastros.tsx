
import CategoriesManager from "@/components/admin/cadastros/CategoriesManager";
import PromptsManager from "@/components/admin/cadastros/PromptsManager";
import PartnersManager from "@/components/admin/cadastros/PartnersManager";
import CadastrosOverview from "@/components/admin/cadastros/CadastrosOverview";

interface AdminCadastrosProps {
  subsection?: string;
}

const AdminCadastros = ({ subsection }: AdminCadastrosProps) => {
  const renderContent = () => {
    switch (subsection) {
      case "categorias":
        return <CategoriesManager />;
      
      case "prompts-ia":
        return <PromptsManager />;
      
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

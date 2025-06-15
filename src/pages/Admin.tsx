
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import ContentManagement from "./admin/ContentManagement";
import SupportManagement from "./admin/SupportManagement";
import GeneralSettings from "./admin/GeneralSettings";
import AdminCadastros from "./admin/AdminCadastros";
import { Shield, ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simulação de usuário logado - em produção seria do contexto de autenticação
const getCurrentUser = () => ({
  id: "1",
  name: "Admin User",
  role: "admin" // admin | support
});

const Admin = () => {
  const { section, subsection } = useParams();
  const [user] = useState(getCurrentUser());

  // Controle de acesso
  const hasAccess = (requiredSection: string) => {
    if (user.role === "admin") return true;
    if (user.role === "support" && requiredSection === "support") return true;
    return false;
  };

  const renderAccessDenied = () => (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-destructive">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta seção.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Renderizar componente específico baseado na seção
  switch (section) {
    case "dashboard":
      if (!hasAccess("dashboard")) return renderAccessDenied();
      return <AdminDashboard />;
    
    case "cadastros":
      if (!hasAccess("cadastros")) return renderAccessDenied();
      return <AdminCadastros subsection={subsection} />;
    
    case "usuarios":
      if (!hasAccess("usuarios")) return renderAccessDenied();
      return <UserManagement />;
    
    case "conteudo":
      if (!hasAccess("conteudo")) return renderAccessDenied();
      return <ContentManagement subsection={subsection} />;
    
    case "suporte":
      if (!hasAccess("suporte")) return renderAccessDenied();
      return <SupportManagement />;
    
    case "configuracoes":
      if (!hasAccess("configuracoes")) return renderAccessDenied();
      return <GeneralSettings subsection={subsection} />;
    
    default:
      if (!hasAccess("dashboard")) return renderAccessDenied();
      return <AdminDashboard />;
  }
};

export default Admin;


import { useParams, Link } from "wouter";
import { lazy, Suspense } from "react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";

// Lazy load components for better performance
const MySuppliers = lazy(() => import("./myarea/MySuppliers"));
const MyMaterials = lazy(() => import("./myarea/MyMaterials"));
const MyBrands = lazy(() => import("./myarea/MyBrands"));

// Legacy product components removed - now handled by PRODUTOS PRO
const SupplierDetailRefactored = lazy(() => import("./myarea/SupplierDetailRefactored"));
const MaterialDetail = lazy(() => import("./myarea/MaterialDetail"));
const MaterialForm = lazy(() => import("./myarea/MaterialForm"));
const MySubscriptions = lazy(() => import("../pages/myarea/MySubscriptions"));
const UserProfile = lazy(() => import("./myarea/UserProfile"));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </div>
  </div>
);

const MyArea = () => {
  const { section, id } = useParams();
  const fullPath = window.location.pathname;
  const subId = fullPath.split('/')[4]; // Get the subId from the URL path

  switch (section) {
    case "fornecedores":
    case "suppliers":
      return (
        <PermissionGuard featureCode="myarea.suppliers">
          {id ? (
            <Suspense fallback={<LoadingFallback />}>
              <SupplierDetailRefactored />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <MySuppliers />
            </Suspense>
          )}
        </PermissionGuard>
      );
    case "produtos":
    case "products":
      // Legacy products system removed - redirect to PRODUTOS PRO
      return (
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sistema de Produtos Atualizado</h2>
            <p className="text-muted-foreground mb-6">
              O sistema de produtos foi atualizado. Agora você pode gerenciar seus produtos através do <strong>PRODUTOS PRO</strong>.
            </p>
            <Button asChild>
              <Link to="/meus-produtos">
                Acessar MEUS PRODUTOS
              </Link>
            </Button>
          </div>
        </div>
      );
    case "materiais":
    case "materials":
      return (
        <PermissionGuard featureCode="myarea.materials">
          {id === "novo" || id === "new" ? (
            <Suspense fallback={<LoadingFallback />}>
              <MaterialForm />
            </Suspense>
          ) : fullPath.includes("/edit") ? (
            <Suspense fallback={<LoadingFallback />}>
              <MaterialForm />
            </Suspense>
          ) : id ? (
            <Suspense fallback={<LoadingFallback />}>
              <MaterialDetail />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <MyMaterials />
            </Suspense>
          )}
        </PermissionGuard>
      );
    case "marcas":
    case "brands":
      return (
        <PermissionGuard featureCode="myarea.brands">
          <Suspense fallback={<LoadingFallback />}>
            <MyBrands />
          </Suspense>
        </PermissionGuard>
      );
    case "assinaturas":
    case "subscriptions":
      return (
        <PermissionGuard featureCode="myarea.subscriptions">
          <Suspense fallback={<LoadingFallback />}>
            <MySubscriptions />
          </Suspense>
        </PermissionGuard>
      );
    case "perfil":
    case "profile":
      return (
        <Suspense fallback={<LoadingFallback />}>
          <UserProfile />
        </Suspense>
      );
    default:
      const title = section ? section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ") : "Minha Área";
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground">O conteúdo para a seção <span className="font-semibold text-foreground">{title}</span> será implementado aqui. Este é um espaço reservado para a funcionalidade futura.</p>
        </div>
      );
  }
};

export default MyArea;

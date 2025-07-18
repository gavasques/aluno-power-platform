
import { useParams } from "wouter";
import { lazy, Suspense } from "react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Lazy load components for better performance
const MySuppliers = lazy(() => import("./myarea/MySuppliers"));
const MyProductsList = lazy(() => import("./myarea/MyProductsList"));
const MyMaterials = lazy(() => import("./myarea/MyMaterials"));
const MyBrands = lazy(() => import("./myarea/MyBrands"));

const ProductDetail = lazy(() => import("./myarea/ProductDetail"));

const ProductPricingForm = lazy(() => import("./myarea/ProductPricingForm"));
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
      return (
        <PermissionGuard featureCode="myarea.products">
          {id === "novo" || id === "new" ? (
            <Suspense fallback={<LoadingFallback />}>
              <ProductPricingForm />
            </Suspense>
          ) : id && subId === "editar" ? (
            <Suspense fallback={<LoadingFallback />}>
              <ProductPricingForm />
            </Suspense>
          ) : id ? (
            <Suspense fallback={<LoadingFallback />}>
              <ProductDetail />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <MyProductsList />
            </Suspense>
          )}
        </PermissionGuard>
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


import { useParams } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load components for better performance
const MySuppliers = lazy(() => import("./myarea/MySuppliers"));
const MyProductsList = lazy(() => import("./myarea/MyProductsList"));
const MyMaterials = lazy(() => import("./myarea/MyMaterials"));
const ProductFormNew = lazy(() => import("../components/product/ProductFormNew"));
const ProductEditForm = lazy(() => import("../components/product/ProductEditForm"));
const ProductDetail = lazy(() => import("./myarea/ProductDetail"));
const ProductPricing = lazy(() => import("./myarea/ProductPricing"));
const ProductPricingForm = lazy(() => import("./myarea/ProductPricingForm"));
const SupplierDetailRefactored = lazy(() => import("./myarea/SupplierDetailRefactored"));
const MaterialDetail = lazy(() => import("./myarea/MaterialDetail"));
const MaterialForm = lazy(() => import("./myarea/MaterialForm"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
      if (id) {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SupplierDetailRefactored />
          </Suspense>
        );
      }
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <MySuppliers />
        </Suspense>
      );
    case "produtos":
    case "products":
      if (id === "novo" || id === "new") {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductPricingForm />
          </Suspense>
        );
      }
      if (id && subId === "editar") {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductPricingForm />
          </Suspense>
        );
      }
      if (id && subId === "pricing") {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductPricing />
          </Suspense>
        );
      }
      if (id) {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetail />
          </Suspense>
        );
      }
      // Se não tem ID, mostra a lista de produtos
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <MyProductsList />
        </Suspense>
      );
    case "materiais":
    case "materials":
      if (id === "novo" || id === "new") {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MaterialForm />
          </Suspense>
        );
      }
      if (fullPath.includes("/edit")) {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MaterialForm />
          </Suspense>
        );
      }
      if (id) {
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MaterialDetail />
          </Suspense>
        );
      }
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <MyMaterials />
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

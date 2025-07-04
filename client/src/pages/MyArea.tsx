
import { useParams } from "wouter";
import MySuppliers from "./myarea/MySuppliers";
import MyProducts from "./myarea/MyProducts";
import MyMaterials from "./myarea/MyMaterials";
import ProductFormNew from "../components/product/ProductFormNew";
import ProductEditForm from "../components/product/ProductEditForm";
import ProductDetail from "./myarea/ProductDetail";
import ProductPricing from "./myarea/ProductPricing";
import SupplierDetailRefactored from "./myarea/SupplierDetailRefactored";
import MaterialDetail from "./myarea/MaterialDetail";
import MaterialForm from "./myarea/MaterialForm";

const MyArea = () => {
  const { section, id } = useParams();
  const fullPath = window.location.pathname;
  const subId = fullPath.split('/')[4]; // Get the subId from the URL path

  switch (section) {
    case "fornecedores":
    case "suppliers":
      if (id) {
        return <SupplierDetailRefactored />;
      }
      return <MySuppliers />;
    case "produtos":
    case "products":
      if (id === "novo" || id === "new") {
        return <ProductFormNew />;
      }
      if (id && subId === "editar") {
        return <ProductEditForm />;
      }
      if (id && subId === "pricing") {
        return <ProductPricing />;
      }
      if (id) {
        return <ProductDetail />;
      }
      return <MyProducts />;
    case "materiais":
    case "materials":
      if (id === "novo" || id === "new") {
        return <MaterialForm />;
      }
      if (fullPath.includes("/edit")) {
        return <MaterialForm />;
      }
      if (id) {
        return <MaterialDetail />;
      }
      return <MyMaterials />;
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

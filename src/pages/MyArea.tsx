
import { useParams } from "react-router-dom";
import MySuppliers from "./myarea/MySuppliers";
import MyProducts from "./myarea/MyProducts";
import ProductForm from "./myarea/ProductForm";
import ProductDetail from "./myarea/ProductDetail";
import SupplierDetail from "./myarea/SupplierDetail";

const MyArea = () => {
  const { section, id } = useParams();

  switch (section) {
    case "fornecedores":
      if (id) {
        return <SupplierDetail />;
      }
      return <MySuppliers />;
    case "produtos":
      if (id === "novo") {
        return <ProductForm />;
      }
      if (id) {
        return <ProductDetail />;
      }
      return <MyProducts />;
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

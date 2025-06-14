
import { useParams } from "react-router-dom";
import MySuppliers from "./myarea/MySuppliers";

const MyArea = () => {
  const { section } = useParams();

  switch (section) {
    case "fornecedores":
      return <MySuppliers />;
    case "produtos":
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

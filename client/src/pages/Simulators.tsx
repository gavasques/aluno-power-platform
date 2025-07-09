
import { useParams } from "react-router-dom";

const simulatorTitles = {
  "simples-nacional": "Simples Nacional",
  "importacao-simplificada": "Importação Simplificada",
  "importacao-formal": "Importação Formal",
};

const Simulators = () => {
  const { section } = useParams<{ section: keyof typeof simulatorTitles }>();

  const title = section ? simulatorTitles[section] : "Simuladores";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">
        {section
          ? `O conteúdo para a seção de ${title} será implementado aqui. Este é um espaço reservado para a funcionalidade futura.`
          : "Selecione um simulador no menu ao lado para começar."}
      </p>
    </div>
  );
};
export default Simulators;

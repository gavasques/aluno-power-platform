import { useToast } from "@/hooks/use-toast";
import { useSimulationData } from "@/components/simulators/simples-nacional-completo/hooks/useSimulationData";
import { useCalculations } from "@/components/simulators/simples-nacional-completo/hooks/useCalculations";
import { FormularioAdicionarMes } from "@/components/simulators/simples-nacional-completo/components/FormularioAdicionarMes";
import { ResumoSimulacao } from "@/components/simulators/simples-nacional-completo/components/ResumoSimulacao";
import { TabelaMeses } from "@/components/simulators/simples-nacional-completo/components/TabelaMeses";
import { AlertaLegal } from "@/components/simulators/simples-nacional-completo/components/AlertaLegal";
import { exportarParaCSV, baixarCSV } from "@/components/simulators/simples-nacional-completo/utils";

export default function SimplesNacionalCompleto() {
  const { toast } = useToast();
  const { meses, novoMes, adicionarMes, removerMes, updateNovoMes } = useSimulationData();
  const { mesesCalculados, resumo } = useCalculations(meses);

  const handleAdicionarMes = () => {
    const result = adicionarMes();
    if (result.isValid) {
      toast({
        title: "Mês adicionado",
        description: "O mês foi adicionado com sucesso à simulação"
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoverMes = (id: string) => {
    removerMes(id);
    toast({
      title: "Mês removido",
      description: "O mês foi removido da simulação"
    });
  };

  const handleExportarCSV = () => {
    if (mesesCalculados.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Adicione pelo menos um mês para exportar",
        variant: "destructive"
      });
      return;
    }

    const csvContent = exportarParaCSV(mesesCalculados);
    baixarCSV(csvContent);
    
    toast({
      title: "Arquivo exportado",
      description: "O arquivo CSV foi baixado com sucesso"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simulador Simples Nacional Completo</h1>
        <p className="text-muted-foreground">
          Simulador avançado com distinção entre faturamento com e sem ST
        </p>
      </div>

      <AlertaLegal />

      <FormularioAdicionarMes 
        novoMes={novoMes}
        onUpdate={updateNovoMes}
        onAdicionar={handleAdicionarMes}
      />

      {resumo && <ResumoSimulacao resumo={resumo} />}

      {mesesCalculados.length > 0 && (
        <TabelaMeses 
          meses={mesesCalculados}
          onRemover={handleRemoverMes}
          onExportarCSV={handleExportarCSV}
        />
      )}
    </div>
  );
}
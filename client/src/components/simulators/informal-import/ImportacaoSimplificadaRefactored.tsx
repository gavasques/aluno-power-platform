import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Modular imports
import { SimulacaoCompleta, ConfiguracoesGerais, ProdutoSimulacao, DEFAULT_CONFIG, DEFAULT_PRODUCT } from './types';
import { useCalculations } from './hooks/useCalculations';
import { useSimulationAPI } from './hooks/useSimulationAPI';
import { generateProductId, exportToCSV, validateSimulation } from './utils';

// UI Components
import { SimulationHeader } from './components/SimulationHeader';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ProductTable } from './components/ProductTable';
import { SummaryPanel } from './components/SummaryPanel';

/**
 * Refactored Informal Import Simulation Component
 * Following SOLID principles with modular architecture
 */
export default function ImportacaoSimplificadaRefactored() {
  // API hooks
  const { useSimulations, useSaveSimulation, useDeleteSimulation } = useSimulationAPI();
  const { data: simulations = [], isLoading } = useSimulations();
  const saveMutation = useSaveSimulation();
  const deleteMutation = useDeleteSimulation();

  // State management
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>({
    nomeSimulacao: "Nova Simulação",
    nomeFornecedor: "",
    observacoes: "",
    configuracoesGerais: DEFAULT_CONFIG,
    produtos: []
  });
  
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Business logic hook
  const calculatedResults = useCalculations(activeSimulation);

  // Event handlers
  const handleSimulationChange = (updates: Partial<SimulacaoCompleta>) => {
    setActiveSimulation(prev => ({ ...prev, ...updates }));
  };

  const handleConfigChange = (field: keyof ConfiguracoesGerais, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      configuracoesGerais: { ...prev.configuracoesGerais, [field]: value }
    }));
  };

  const handleAddProduct = () => {
    const newProduct: ProdutoSimulacao = {
      ...DEFAULT_PRODUCT,
      id_produto_interno: generateProductId(),
    };
    setActiveSimulation(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }));
  };

  const handleUpdateProduct = (index: number, field: keyof ProdutoSimulacao, value: any) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setActiveSimulation(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const errors = validateSimulation(activeSimulation);
    if (errors.length > 0) {
      // Show validation errors
      return;
    }
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    saveMutation.mutate(activeSimulation, {
      onSuccess: (savedSimulation) => {
        if (savedSimulation) {
          setActiveSimulation({
            ...savedSimulation,
            nomeFornecedor: savedSimulation.nomeFornecedor || "",
            observacoes: savedSimulation.observacoes || "",
          });
          setSelectedSimulationId(savedSimulation.id);
        }
        setShowSaveDialog(false);
      }
    });
  };

  const handleLoadSimulation = (simulation: any) => {
    setActiveSimulation({
      ...simulation,
      id: simulation.id,
      nomeSimulacao: simulation.nomeSimulacao || "Nova Simulação",
      nomeFornecedor: simulation.nomeFornecedor || "",
      observacoes: simulation.observacoes || "",
      configuracoesGerais: simulation.configuracoesGerais || DEFAULT_CONFIG,
      produtos: simulation.produtos || []
    });
    setSelectedSimulationId(simulation.id);
    setShowLoadDialog(false);
  };

  const handleNewSimulation = () => {
    setActiveSimulation({
      nomeSimulacao: "Nova Simulação",
      nomeFornecedor: "",
      observacoes: "",
      configuracoesGerais: DEFAULT_CONFIG,
      produtos: [],
      id: undefined
    });
    setSelectedSimulationId(null);
  };

  const handleExportCSV = () => {
    exportToCSV(calculatedResults.produtos, activeSimulation.nomeSimulacao);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Simulação de Importação', 105, 30, { align: 'center' });
      
      // Simulation info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Simulação: ${activeSimulation.nomeSimulacao}`, 20, 50);
      
      if (activeSimulation.nomeFornecedor) {
        doc.text(`Fornecedor: ${activeSimulation.nomeFornecedor}`, 20, 60);
      }

      // Add products table
      const tableData = calculatedResults.produtos.map(p => [
        p.descricao_produto,
        p.quantidade.toString(),
        `$${p.valor_unitario_usd.toFixed(2)}`,
        `${p.peso_bruto_unitario_kg.toFixed(3)} kg`,
        `R$ ${(p.custo_unitario_com_imposto_brl || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        head: [['Produto', 'Qtd', 'Valor Unit. USD', 'Peso Unit.', 'Custo Unit. Final']],
        body: tableData,
        startY: 80,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Add totals
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.text(`Total Geral: R$ ${calculatedResults.totals.custo_total_importacao_brl.toFixed(2)}`, 20, finalY + 20);

      // Save file
      const fileName = `simulacao-importacao-${activeSimulation.nomeSimulacao?.replace(/[^a-zA-Z0-9]/g, '-') || 'simulacao'}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SimulationHeader
        simulation={activeSimulation}
        selectedSimulationId={selectedSimulationId}
        onSimulationChange={handleSimulationChange}
        onSave={handleSave}
        onLoad={() => setShowLoadDialog(true)}
        onNewSimulation={handleNewSimulation}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      <ConfigurationPanel
        config={activeSimulation.configuracoesGerais}
        onConfigChange={handleConfigChange}
      />

      <ProductTable
        produtos={calculatedResults.produtos}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onRemoveProduct={handleRemoveProduct}
      />

      <SummaryPanel totals={calculatedResults.totals} />

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Simulação</DialogTitle>
            <DialogDescription>
              Deseja salvar a simulação "{activeSimulation.nomeSimulacao}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Carregar Simulação</DialogTitle>
            <DialogDescription>
              Selecione uma simulação salva para carregar:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Carregando simulações...</div>
            ) : simulations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma simulação salva encontrada
              </div>
            ) : (
              <div className="space-y-2">
                {simulations.map((sim: any) => (
                  <div
                    key={sim.id}
                    className="p-3 border rounded cursor-pointer hover:bg-muted"
                    onClick={() => handleLoadSimulation(sim)}
                  >
                    <div className="font-medium">{sim.nomeSimulacao}</div>
                    {sim.nomeFornecedor && (
                      <div className="text-sm text-muted-foreground">
                        Fornecedor: {sim.nomeFornecedor}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {sim.produtos?.length || 0} produtos • 
                      Modificado: {new Date(sim.dataLastModified).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
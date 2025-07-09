import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

// Enhanced modular imports with specialized hooks
import { 
  SimulacaoCompleta, 
  DEFAULT_SIMULATION,
  SimulationEventHandlers
} from './types';
import { useCalculations } from './hooks/useCalculations';
import { useSimulationAPI } from './hooks/useSimulationAPI';
import { useSimulationHandlers } from './hooks/useSimulationHandlers';
import { useUIState } from './hooks/useUIState';
import { useValidation } from './hooks/useValidation';

// UI Components
import { SimulationHeader } from './components/SimulationHeader';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ProductTable } from './components/ProductTable';
import { SummaryPanel } from './components/SummaryPanel';

/**
 * Enhanced Refactored Informal Import Simulation Component
 * Following SOLID principles with deep modular architecture
 * Phase 3 - Complete separation of concerns with specialized hooks
 */
export default function ImportacaoSimplificadaRefactored() {
  // Navigation hooks
  const [location, setLocation] = useLocation();
  
  // Core state management
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>(DEFAULT_SIMULATION);
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);

  // Specialized hooks for different concerns
  const { uiState, setUIState, actions: uiActions } = useUIState();
  const { useSimulations, useSaveSimulation, useDeleteSimulation } = useSimulationAPI();
  const { data: simulations = [], isLoading } = useSimulations();
  const saveMutation = useSaveSimulation();
  const deleteMutation = useDeleteSimulation();

  // Business logic hooks
  const calculatedResults = useCalculations(activeSimulation);
  const validation = useValidation(activeSimulation);

  // Enhanced event handlers using specialized hook
  const eventHandlers: SimulationEventHandlers = useSimulationHandlers(
    activeSimulation,
    setActiveSimulation,
    setUIState,
    uiActions.setSelectedSimulationId,
    saveMutation,
    calculatedResults
  );

  // Load simulation from URL query params on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const simulationId = searchParams.get('id');
    
    if (simulationId && simulations.length > 0) {
      const simulation = simulations.find(s => s.id === parseInt(simulationId));
      if (simulation) {
        setActiveSimulation(simulation);
        setSelectedSimulationId(simulation.id);
      }
    }
  }, [simulations]);

  // Enhanced save confirmation with validation
  const handleConfirmSave = useMemo(() => {
    return () => {
      saveMutation.mutate(activeSimulation, {
        onSuccess: (savedSimulation) => {
          if (savedSimulation) {
            setActiveSimulation({
              ...savedSimulation,
              nomeFornecedor: savedSimulation.nomeFornecedor || "",
              observacoes: savedSimulation.observacoes || "",
            });
            uiActions.setSelectedSimulationId(savedSimulation.id);
          }
          uiActions.closeSaveDialog();
        },
        onError: () => {
          // Error handling is managed by the API hook
        }
      });
    };
  }, [activeSimulation, saveMutation, setActiveSimulation, uiActions]);

  // Handle back to list navigation
  const handleBackToList = () => {
    setLocation('/simuladores/importacao-simplificada');
  };

  // Performance optimization with memoized component props
  const componentProps = useMemo(() => ({
    simulation: activeSimulation,
    calculatedResults,
    validation,
    isLoading: isLoading || saveMutation.isPending || deleteMutation.isPending,
    simulations,
    selectedSimulationId
  }), [
    activeSimulation, 
    calculatedResults, 
    validation, 
    isLoading, 
    saveMutation.isPending, 
    deleteMutation.isPending, 
    simulations, 
    selectedSimulationId
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back to List Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBackToList}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Lista
        </Button>
      </div>

      <SimulationHeader
        simulation={componentProps.simulation}
        selectedSimulationId={componentProps.selectedSimulationId}
        onSimulationChange={eventHandlers.onSimulationChange}
        onSave={eventHandlers.onSave}
        onLoad={uiActions.openLoadDialog}
        onNewSimulation={eventHandlers.onNew}
        onExportPDF={eventHandlers.onExportPDF}
        validation={validation}
      />

      <ConfigurationPanel
        config={componentProps.simulation.configuracoesGerais}
        onConfigChange={eventHandlers.onConfigChange}
        validation={validation}
      />

      <ProductTable
        produtos={componentProps.calculatedResults.produtos}
        onAddProduct={eventHandlers.onProductAdd}
        onUpdateProduct={eventHandlers.onProductUpdate}
        onRemoveProduct={eventHandlers.onProductRemove}
        validation={validation}
      />

      <SummaryPanel 
        totals={componentProps.calculatedResults.totals} 
        validation={validation}
      />

      {/* Enhanced Save Dialog with validation feedback */}
      <Dialog open={uiState.showSaveDialog} onOpenChange={uiActions.closeSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Simulação</DialogTitle>
            <DialogDescription>
              Deseja salvar a simulação "{componentProps.simulation.nomeSimulacao}"?
              {!validation.isValid && (
                <div className="mt-2 text-red-600 text-sm">
                  Atenção: Existem {validation.errors.length} erro(s) de validação.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={uiActions.closeSaveDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSave} 
              disabled={saveMutation.isPending || !validation.isValid}
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Load Dialog */}
      <Dialog open={uiState.showLoadDialog} onOpenChange={uiActions.closeLoadDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Carregar Simulação</DialogTitle>
            <DialogDescription>
              Selecione uma simulação salva para carregar:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {componentProps.isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {componentProps.simulations.map((sim: any) => (
                  <div
                    key={sim.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => eventHandlers.onLoad(sim)}
                  >
                    <div className="font-medium">{sim.nomeSimulacao}</div>
                    <div className="text-sm text-gray-500">
                      {sim.produtos?.length || 0} produtos • 
                      {sim.nomeFornecedor ? ` Fornecedor: ${sim.nomeFornecedor}` : ' Sem fornecedor'}
                    </div>
                  </div>
                ))}
                {componentProps.simulations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma simulação salva encontrada.
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={uiActions.closeLoadDialog}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={uiState.showDeleteConfirm} onOpenChange={uiActions.closeDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A simulação será permanentemente removida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={uiActions.closeDeleteConfirm}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedSimulationId) {
                  deleteMutation.mutate(selectedSimulationId, {
                    onSuccess: () => {
                      uiActions.closeDeleteConfirm();
                      uiActions.setSelectedSimulationId(null);
                    }
                  });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useUserCreditBalance } from '@/hooks/useUserCredits';

// Types and utilities
import { 
  ConfiguracaoSimulacao, 
  GiroEditavel, 
  InvestmentSimulation,
  DEFAULT_CONFIG,
  DEFAULT_BULK_VALUES
} from './types';
import { 
  exportToCSV, 
  generatePDFFileName, 
  formatCurrency, 
  formatPercentage,
  saveToLocalStorage, 
  loadFromLocalStorage, 
  removeFromLocalStorage,
  convertToDays
} from './utils';

// Custom hooks
import { useCalculations, useBulkOperations } from './hooks/useCalculations';
import { useSimulationAPI } from './hooks/useSimulationAPI';

// UI Components
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { BulkActionsPanel } from './components/BulkActionsPanel';
import { SimulationTable } from './components/SimulationTable';
import { SummaryPanel } from './components/SummaryPanel';
import { ActionsPanel } from './components/ActionsPanel';
import { SimulationSelector } from './components/SimulationSelector';

const FEATURE_CODE = 'simulators.investimentos_roi';

/**
 * Refactored Investment and ROI Simulator Component
 * 
 * Follows SOLID principles with separated concerns:
 * - Configuration management
 * - Calculation logic (custom hooks)
 * - API operations (custom hooks) 
 * - UI components (modular components)
 * - State persistence (localStorage utilities)
 */
export default function InvestimentosROIRefactored() {
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { balance: userBalance } = useUserCreditBalance();

  // Configuration state
  const [config, setConfig] = useState<ConfiguracaoSimulacao>(DEFAULT_CONFIG);
  
  // Giros data state (editable values per cycle)
  const [girosData, setGirosData] = useState<{ [key: number]: GiroEditavel }>({});
  
  // Bulk operation states
  const [bulkROI, setBulkROI] = useState<number>(DEFAULT_BULK_VALUES.roi);
  const [bulkAporte, setBulkAporte] = useState<number>(DEFAULT_BULK_VALUES.aporte);
  const [bulkRetirada, setBulkRetirada] = useState<number>(DEFAULT_BULK_VALUES.retirada);
  
  // Current simulation state
  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);
  const [simulationName, setSimulationName] = useState<string>('Nova Simulação');

  // Custom hooks for business logic
  const { giros, totals } = useCalculations(config, girosData);
  const { applyBulkROI, applyBulkAporte, applyBulkRetirada } = useBulkOperations();
  
  // Custom hook for API operations
  const {
    simulations,
    isLoadingSimulations,
    saveSimulation,
    loadSimulation,
    deleteSimulation,
    isSaving,
    isDeleting
  } = useSimulationAPI();

  // Calculate total simulation time
  const tempoTotalDias = config.numeroGiros * convertToDays(config.duracaoGiro, config.unidadeTempo);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedConfig = loadFromLocalStorage('investimentoConfig', DEFAULT_CONFIG);
    const savedGirosData = loadFromLocalStorage('investimentoGirosData', {});
    
    setConfig(savedConfig);
    setGirosData(savedGirosData);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    saveToLocalStorage('investimentoConfig', config);
  }, [config]);

  useEffect(() => {
    saveToLocalStorage('investimentoGirosData', girosData);
  }, [girosData]);

  // Handler for configuration changes
  const handleConfigChange = (newConfig: ConfiguracaoSimulacao) => {
    setConfig(newConfig);
  };

  // Handler for giro data changes
  const handleGiroDataChange = (giroNumber: number, field: keyof GiroEditavel, value: number) => {
    setGirosData(prev => ({
      ...prev,
      [giroNumber]: {
        ...prev[giroNumber],
        aporte: prev[giroNumber]?.aporte || 0,
        retirada: prev[giroNumber]?.retirada || 0,
        roiGiro: prev[giroNumber]?.roiGiro || 20,
        [field]: value
      }
    }));
  };

  // Bulk operation handlers
  const handleApplyBulkROI = () => {
    const newGirosData = applyBulkROI(girosData, config.numeroGiros, bulkROI);
    setGirosData(newGirosData);
    toast({
      title: "ROI aplicado",
      description: `ROI de ${bulkROI}% aplicado a todos os ${config.numeroGiros} giros.`
    });
  };

  const handleApplyBulkAporte = () => {
    const newGirosData = applyBulkAporte(girosData, config.numeroGiros, bulkAporte);
    setGirosData(newGirosData);
    toast({
      title: "Aporte aplicado",
      description: `Aporte de ${formatCurrency(bulkAporte)} aplicado a todos os giros.`
    });
  };

  const handleApplyBulkRetirada = () => {
    const newGirosData = applyBulkRetirada(girosData, config.numeroGiros, bulkRetirada);
    setGirosData(newGirosData);
    toast({
      title: "Retirada aplicada",
      description: `Retirada de ${formatCurrency(bulkRetirada)} aplicada a todos os giros.`
    });
  };

  // Save simulation handler
  const handleSaveSimulation = () => {
    saveSimulation(
      simulationName,
      config,
      girosData,
      currentSimulationId
    );
  };

  // Load simulation handler
  const handleLoadSimulation = (simulation: InvestmentSimulation) => {
    loadSimulation(
      simulation,
      setConfig,
      setGirosData,
      setCurrentSimulationId,
      setSimulationName
    );
  };

  // Reset simulation handler
  const handleResetSimulation = () => {
    setConfig(DEFAULT_CONFIG);
    setGirosData({});
    setCurrentSimulationId(null);
    setSimulationName('Nova Simulação');
    setBulkROI(DEFAULT_BULK_VALUES.roi);
    setBulkAporte(DEFAULT_BULK_VALUES.aporte);
    setBulkRetirada(DEFAULT_BULK_VALUES.retirada);
    
    removeFromLocalStorage('investimentoConfig');
    removeFromLocalStorage('investimentoGirosData');
    
    toast({
      title: "Simulação resetada",
      description: "Todos os dados foram limpos."
    });
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    try {
      // Verificar créditos antes de exportar
      const creditCheck = await checkCredits(FEATURE_CODE);
      if (!creditCheck.canProcess) {
        showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
        return;
      }

      const fileName = `simulacao_investimentos_${simulationName.replace(/[^a-zA-Z0-9]/g, '-')}_${new Date().toISOString().split('T')[0]}`;
      exportToCSV(giros, fileName);
      
      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'investments-roi',
        model: 'simulation',
        prompt: `Exportação CSV - ${simulationName}`,
        response: `Arquivo CSV exportado com sucesso - ${giros.length} giros de dados`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });
      
      toast({
        title: "CSV exportado",
        description: "Arquivo CSV gerado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o CSV.",
        variant: "destructive"
      });
    }
  };

  // Export PDF handler
  const handleExportPDF = async () => {
    try {
      // Verificar créditos antes de exportar
      const creditCheck = await checkCredits(FEATURE_CODE);
      if (!creditCheck.canProcess) {
        showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SIMULAÇÃO DE INVESTIMENTOS E ROI', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${simulationName} - ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Configuration
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIGURAÇÃO', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const configItems = [
        `Investimento Inicial: ${formatCurrency(config.investimentoInicial)}`,
        `Duração do Giro: ${config.duracaoGiro} ${config.unidadeTempo}`,
        `Número de Giros: ${config.numeroGiros}`,
        `Tempo Total: ${tempoTotalDias} dias`
      ];

      configItems.forEach(item => {
        doc.text(item, margin, yPosition);
        yPosition += 7;
      });
      yPosition += 15;

      // Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO FINANCEIRO', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const summaryItems = [
        `Total Investido: ${formatCurrency(totals.totalInvestido)}`,
        `Saldo Final: ${formatCurrency(totals.saldoFinal)}`,
        `Ganho Líquido: ${formatCurrency(totals.ganhoLiquido)}`,
        `ROI Total: ${formatPercentage(totals.roiTotal)}`
      ];

      summaryItems.forEach(item => {
        doc.text(item, margin, yPosition);
        yPosition += 8;
      });
      yPosition += 15;

      // Table
      const tableColumns = ['Giro', 'Investimento', 'ROI%', 'Retorno', 'Aporte', 'Retirada', 'Saldo'];
      const tableRows = giros.map(giro => [
        giro.numero.toString(),
        formatCurrency(giro.investimento),
        `${giro.roiGiro.toFixed(2)}%`,
        formatCurrency(giro.retorno),
        formatCurrency(giro.aporte),
        formatCurrency(giro.retirada),
        formatCurrency(giro.saldo)
      ]);

      (doc as any).autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      const fileName = generatePDFFileName(simulationName);
      doc.save(fileName);
      
      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'investments-roi',
        model: 'simulation',
        prompt: `Exportação PDF - ${simulationName}`,
        response: `Arquivo PDF exportado com sucesso - ${giros.length} giros de dados`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });
      
      toast({
        title: "PDF exportado",
        description: "Arquivo PDF gerado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Simulador de Investimentos e ROI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Simule seus investimentos com aportes, retiradas e retornos por giro
        </p>
      </div>

      {/* Configuration Panel */}
      <ConfigurationPanel
        config={config}
        onConfigChange={handleConfigChange}
      />

      {/* Bulk Actions Panel */}
      <BulkActionsPanel
        bulkROI={bulkROI}
        bulkAporte={bulkAporte}
        bulkRetirada={bulkRetirada}
        onBulkROIChange={setBulkROI}
        onBulkAporteChange={setBulkAporte}
        onBulkRetiradaChange={setBulkRetirada}
        onApplyBulkROI={handleApplyBulkROI}
        onApplyBulkAporte={handleApplyBulkAporte}
        onApplyBulkRetirada={handleApplyBulkRetirada}
      />

      {/* Simulation Table */}
      <SimulationTable
        giros={giros}
        girosData={girosData}
        onGiroDataChange={handleGiroDataChange}
      />

      {/* Summary Panel */}
      <SummaryPanel
        totals={totals}
        tempoTotalDias={tempoTotalDias}
      />

      {/* Actions Panel */}
      <ActionsPanel
        simulationName={simulationName}
        onSimulationNameChange={setSimulationName}
        onSave={handleSaveSimulation}
        onReset={handleResetSimulation}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        giros={giros}
        totals={totals}
        isSaving={isSaving}
      />

      {/* Simulation Selector */}
      <SimulationSelector
        simulations={simulations}
        isLoadingSimulations={isLoadingSimulations}
        onLoadSimulation={handleLoadSimulation}
        onDeleteSimulation={deleteSimulation}
        isDeleting={isDeleting}
      />
    </div>
  );
}
import { useMemo } from 'react';
import { useFormalImportState } from './hooks/useFormalImportState';
import { useFormalImportAPI } from './hooks/useFormalImportAPI';
import { useProductOperations } from './hooks/useProductOperations';
import { useTaxAndExpenseOperations } from './hooks/useTaxAndExpenseOperations';
import { FormalImportSimulatorPresentation } from './FormalImportSimulatorPresentation';

interface FormalImportSimulatorContainerProps {
  simulationId?: string | null;
}

export const FormalImportSimulatorContainer = ({ simulationId }: FormalImportSimulatorContainerProps) => {
  // Hooks para gerenciamento de estado e operações
  const {
    simulation,
    setSimulation,
    updateSimulation,
    activeTab,
    setActiveTab,
    showAddTaxDialog,
    setShowAddTaxDialog,
    showAddExpenseDialog,
    setShowAddExpenseDialog,
    newTax,
    setNewTax,
    newExpense,
    setNewExpense,
    resetNewTaxForm,
    resetNewExpenseForm,
    isLoading,
    defaultTaxNames
  } = useFormalImportState(simulationId);

  const {
    calculateMutation,
    saveMutation,
    deleteMutation,
    handleCalculate,
    handleSave,
    handleDelete,
    isCalculating,
    isSaving,
    isDeleting
  } = useFormalImportAPI();

  const {
    addProduct,
    updateProduct,
    removeProduct,
    calculateProductTotals
  } = useProductOperations(simulation, setSimulation);

  const {
    calculateTaxEstimate,
    addCustomTax,
    removeCustomTax,
    updateTax,
    addNewExpense,
    removeExpense,
    updateExpense,
    handleExpenseUSDChange,
    handleExpenseRealChange
  } = useTaxAndExpenseOperations(simulation, setSimulation);

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${((value || 0) * 100).toFixed(2)}%`;
  };

  // Cálculos derivados
  const { totalCBM, totalUSD } = useMemo(() => {
    return calculateProductTotals();
  }, [simulation.produtos]);

  const totalTaxes = useMemo(() => {
    return simulation.impostos.reduce((sum: number, tax: any) => sum + (tax.valor || 0), 0);
  }, [simulation.impostos]);

  const totalExpenses = useMemo(() => {
    return simulation.despesasAdicionais.reduce((sum: number, expense: any) => sum + (expense.valorReal || 0), 0);
  }, [simulation.despesasAdicionais]);

  // Handlers para o componente de apresentação
  const handleSimulationUpdate = (field: string, value: any) => {
    updateSimulation({ [field]: value });
  };

  const handleCalculateClick = () => {
    handleCalculate(simulation);
  };

  const handleSaveClick = () => {
    handleSave(simulation, simulationId || undefined);
  };

  const handleDeleteClick = () => {
    if (simulationId) {
      handleDelete(simulationId);
    }
  };

  const handleAddTaxClick = () => {
    addCustomTax();
    setShowAddTaxDialog(false);
    resetNewTaxForm();
  };

  const handleAddExpenseClick = () => {
    addNewExpense();
    setShowAddExpenseDialog(false);
    resetNewExpenseForm();
  };

  return (
    <FormalImportSimulatorPresentation
      // Estado
      simulation={simulation}
      activeTab={activeTab}
      showAddTaxDialog={showAddTaxDialog}
      showAddExpenseDialog={showAddExpenseDialog}
      newTax={newTax}
      newExpense={newExpense}
      isLoading={isLoading}
      isCalculating={isCalculating}
      isSaving={isSaving}
      isDeleting={isDeleting}
      
      // Cálculos
      totalCBM={totalCBM}
      totalUSD={totalUSD}
      totalTaxes={totalTaxes}
      totalExpenses={totalExpenses}
      
      // Funções de formatação
      formatCurrency={formatCurrency}
      formatUSD={formatUSD}
      formatPercentage={formatPercentage}
      
      // Handlers de estado
      setActiveTab={setActiveTab}
      setShowAddTaxDialog={setShowAddTaxDialog}
      setShowAddExpenseDialog={setShowAddExpenseDialog}
      setNewTax={setNewTax}
      setNewExpense={setNewExpense}
      
      // Handlers de operações
      handleSimulationUpdate={handleSimulationUpdate}
      handleCalculateClick={handleCalculateClick}
      handleSaveClick={handleSaveClick}
      handleDeleteClick={handleDeleteClick}
      handleAddTaxClick={handleAddTaxClick}
      handleAddExpenseClick={handleAddExpenseClick}
      
      // Operações de produtos
      addProduct={addProduct}
      updateProduct={updateProduct}
      removeProduct={removeProduct}
      
      // Operações de impostos e despesas
      calculateTaxEstimate={calculateTaxEstimate}
      removeCustomTax={removeCustomTax}
      updateTax={updateTax}
      removeExpense={removeExpense}
      updateExpense={updateExpense}
      handleExpenseUSDChange={handleExpenseUSDChange}
      handleExpenseRealChange={handleExpenseRealChange}
      
      // Constantes
      defaultTaxNames={defaultTaxNames}
    />
  );
}; 
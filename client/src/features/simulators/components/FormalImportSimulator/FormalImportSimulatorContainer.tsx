/**
 * CONTAINER: FormalImportSimulatorContainer
 * Lógica de negócio para simulador de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx (1053 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { useEffect } from 'react';
import { useSimulationData } from '../../hooks/useSimulationData';
import { useCalculations } from '../../hooks/useCalculations';
import { useProducts } from '../../hooks/useProducts';
import { useTaxes, useExpenses } from '../../hooks/useTaxesAndExpenses';
import { FormalImportSimulatorPresentation } from './FormalImportSimulatorPresentation';
import { DEFAULT_TAXES, DEFAULT_EXPENSES } from '../../types';

export const FormalImportSimulatorContainer = () => {
  // ===== HOOKS INTEGRATION =====
  const simulationHook = useSimulationData();
  const calculationsHook = useCalculations(simulationHook.simulation);

  // Products management
  const productsHook = useProducts(
    simulationHook.simulation.produtos,
    (products) => simulationHook.updateSimulation({ produtos: products }),
    simulationHook.simulation.taxaDolar
  );

  // Taxes management
  const taxesHook = useTaxes(
    simulationHook.simulation.impostos,
    (taxes) => simulationHook.updateSimulation({ impostos: taxes })
  );

  // Expenses management
  const expensesHook = useExpenses(
    simulationHook.simulation.despesasAdicionais,
    (expenses) => simulationHook.updateSimulation({ despesasAdicionais: expenses }),
    simulationHook.simulation.taxaDolar
  );

  // ===== INITIALIZATION =====
  useEffect(() => {
    // Initialize with default taxes and expenses if empty
    if (simulationHook.simulation.impostos.length === 0) {
      const defaultTaxes = DEFAULT_TAXES.map(tax => ({ ...tax, valor: 0 }));
      simulationHook.updateSimulation({ impostos: defaultTaxes });
    }

    if (simulationHook.simulation.despesasAdicionais.length === 0) {
      const defaultExpenses = DEFAULT_EXPENSES.map(expense => ({
        ...expense,
        valorReal: expense.valorDolar * simulationHook.simulation.taxaDolar
      }));
      simulationHook.updateSimulation({ despesasAdicionais: defaultExpenses });
    }
  }, []);

  // ===== RECALCULATE ON CHANGES =====
  useEffect(() => {
    const results = calculationsHook.calculateAll();
    simulationHook.updateSimulation({ resultados: results });
  }, [
    simulationHook.simulation.produtos,
    simulationHook.simulation.impostos,
    simulationHook.simulation.despesasAdicionais,
    simulationHook.simulation.taxaDolar,
    simulationHook.simulation.valorFobDolar,
    simulationHook.simulation.valorFreteDolar,
    simulationHook.simulation.percentualSeguro
  ]);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Simulation data
    simulationProps: {
      simulation: simulationHook.simulation,
      isLoading: simulationHook.isLoading,
      error: simulationHook.error,
      onUpdateSimulation: simulationHook.updateSimulation,
      onSaveSimulation: simulationHook.saveSimulation,
      onLoadSimulation: simulationHook.loadSimulation,
      onResetSimulation: simulationHook.resetSimulation
    },

    // Products management
    productsProps: {
      products: productsHook.products,
      onAddProduct: productsHook.addProduct,
      onUpdateProduct: productsHook.updateProduct,
      onRemoveProduct: productsHook.removeProduct,
      onCalculateMetrics: productsHook.calculateProductMetrics
    },

    // Taxes management
    taxesProps: {
      taxes: taxesHook.taxes,
      onAddTax: taxesHook.addTax,
      onUpdateTax: taxesHook.updateTax,
      onRemoveTax: taxesHook.removeTax
    },

    // Expenses management
    expensesProps: {
      expenses: expensesHook.expenses,
      onAddExpense: expensesHook.addExpense,
      onUpdateExpense: expensesHook.updateExpense,
      onRemoveExpense: expensesHook.removeExpense
    },

    // Calculations
    calculationsProps: {
      results: calculationsHook.results,
      calculateAll: calculationsHook.calculateAll,
      calculateFob: calculationsHook.calculateFob,
      calculateFreight: calculationsHook.calculateFreight,
      calculateInsurance: calculationsHook.calculateInsurance,
      calculateTotalTaxes: calculationsHook.calculateTotalTaxes,
      calculateTotalExpenses: calculationsHook.calculateTotalExpenses,
      calculateFinalCost: calculationsHook.calculateFinalCost
    }
  };

  return <FormalImportSimulatorPresentation {...containerProps} />;
};
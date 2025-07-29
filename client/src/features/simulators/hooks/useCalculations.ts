/**
 * HOOK: useCalculations
 * Gerencia cálculos complexos da simulação de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx para modularização
 */
import { useCallback, useMemo } from 'react';
import { FormalImportSimulation, SimulationResults, Product, Tax, Expense, UseCalculationsReturn } from '../types';

export const useCalculations = (simulation: FormalImportSimulation): UseCalculationsReturn => {
  // ===== BASIC CALCULATIONS =====
  const calculateFob = useCallback((): number => {
    return simulation.produtos.reduce((total, product) => {
      return total + (product.quantidade * product.valorUnitarioUsd);
    }, 0);
  }, [simulation.produtos]);

  const calculateFreight = useCallback((): number => {
    return simulation.valorFreteDolar;
  }, [simulation.valorFreteDolar]);

  const calculateCfr = useCallback((): number => {
    return calculateFob() + calculateFreight();
  }, [calculateFob, calculateFreight]);

  const calculateInsurance = useCallback((): number => {
    const cfrValue = calculateCfr();
    return cfrValue * (simulation.percentualSeguro / 100);
  }, [calculateCfr, simulation.percentualSeguro]);

  // ===== PRODUCT CALCULATIONS =====
  const calculateProductMetrics = useCallback((products: Product[]): Product[] => {
    const totalCbm = products.reduce((total, product) => {
      const cbmUnitario = (product.comprimento * product.largura * product.altura) / 1000000; // cm³ to m³
      return total + (cbmUnitario * product.quantidade);
    }, 0);

    return products.map(product => {
      const cbmUnitario = (product.comprimento * product.largura * product.altura) / 1000000;
      const cbmTotal = cbmUnitario * product.quantidade;
      const percentualContainer = totalCbm > 0 ? (cbmTotal / totalCbm) * 100 : 0;
      const valorTotalUSD = product.quantidade * product.valorUnitarioUsd;
      const valorTotalBRL = valorTotalUSD * simulation.taxaDolar;

      return {
        ...product,
        cbmUnitario,
        cbmTotal,
        percentualContainer,
        valorTotalUSD,
        valorTotalBRL
      };
    });
  }, [simulation.taxaDolar]);

  // ===== TAX CALCULATIONS =====
  const calculateTaxValue = useCallback((tax: Tax): number => {
    const fobValue = calculateFob();
    const freightValue = calculateFreight();
    const cfrValue = fobValue + freightValue;
    const insuranceValue = calculateInsurance();

    let baseValue = 0;

    switch (tax.baseCalculo) {
      case 'FOB':
        baseValue = fobValue;
        break;
      case 'FOB + II':
        const iiTax = simulation.impostos.find(t => t.nome.includes('Imposto de Importação'));
        const iiValue = iiTax ? (fobValue * iiTax.aliquota / 100) : 0;
        baseValue = fobValue + iiValue;
        break;
      case 'CFR + II + IPI':
        const iiTax2 = simulation.impostos.find(t => t.nome.includes('Imposto de Importação'));
        const ipiTax = simulation.impostos.find(t => t.nome.includes('IPI'));
        const iiValue2 = iiTax2 ? (fobValue * iiTax2.aliquota / 100) : 0;
        const ipiValue = ipiTax ? ((fobValue + iiValue2) * ipiTax.aliquota / 100) : 0;
        baseValue = cfrValue + iiValue2 + ipiValue;
        break;
      case 'CFR + II + IPI + PIS + COFINS + Seguro':
        // Complex calculation for ICMS base
        const allTaxes = simulation.impostos.reduce((total, t) => {
          if (t.nome.includes('ICMS')) return total;
          return total + t.valor;
        }, 0);
        baseValue = cfrValue + allTaxes + insuranceValue;
        break;
      default:
        baseValue = fobValue;
    }

    return baseValue * (tax.aliquota / 100);
  }, [simulation.impostos, calculateFob, calculateFreight, calculateInsurance]);

  const calculateTotalTaxes = useCallback((): number => {
    return simulation.impostos.reduce((total, tax) => {
      return total + calculateTaxValue(tax);
    }, 0);
  }, [simulation.impostos, calculateTaxValue]);

  // ===== EXPENSE CALCULATIONS =====
  const calculateTotalExpenses = useCallback((): number => {
    return simulation.despesasAdicionais.reduce((total, expense) => {
      return total + (expense.valorDolar * simulation.taxaDolar);
    }, 0);
  }, [simulation.despesasAdicionais, simulation.taxaDolar]);

  // ===== FINAL COST CALCULATION =====
  const calculateFinalCost = useCallback((): number => {
    const fobValue = calculateFob() * simulation.taxaDolar;
    const freightValue = calculateFreight() * simulation.taxaDolar;
    const insuranceValue = calculateInsurance() * simulation.taxaDolar;
    const totalTaxes = calculateTotalTaxes();
    const totalExpenses = calculateTotalExpenses();

    return fobValue + freightValue + insuranceValue + totalTaxes + totalExpenses;
  }, [
    calculateFob,
    calculateFreight, 
    calculateInsurance,
    calculateTotalTaxes,
    calculateTotalExpenses,
    simulation.taxaDolar
  ]);

  // ===== COMPREHENSIVE CALCULATION =====
  const calculateAll = useCallback((): SimulationResults => {
    const fobValue = calculateFob();
    const freightValue = calculateFreight();
    const cfrValue = fobValue + freightValue;
    const insuranceValue = calculateInsurance();
    const totalTaxes = calculateTotalTaxes();
    const totalExpenses = calculateTotalExpenses();
    const finalCost = calculateFinalCost();

    const totalQuantity = simulation.produtos.reduce((total, product) => {
      return total + product.quantidade;
    }, 0);

    return {
      valorFobReal: fobValue * simulation.taxaDolar,
      valorFreteReal: freightValue * simulation.taxaDolar,
      valorCfrDolar: cfrValue,
      valorCfrReal: cfrValue * simulation.taxaDolar,
      valorSeguro: insuranceValue * simulation.taxaDolar,
      totalImpostos: totalTaxes,
      totalDespesas: totalExpenses,
      custoTotalImportacao: finalCost,
      custoUnitarioMedio: totalQuantity > 0 ? finalCost / totalQuantity : 0
    };
  }, [
    calculateFob,
    calculateFreight,
    calculateInsurance,
    calculateTotalTaxes,
    calculateTotalExpenses,
    calculateFinalCost,
    simulation.produtos,
    simulation.taxaDolar
  ]);

  // ===== MEMOIZED RESULTS =====
  const results = useMemo(() => calculateAll(), [calculateAll]);

  return {
    results,
    calculateAll,
    calculateFob,
    calculateFreight,
    calculateInsurance,
    calculateTotalTaxes,
    calculateTotalExpenses,
    calculateFinalCost
  };
};
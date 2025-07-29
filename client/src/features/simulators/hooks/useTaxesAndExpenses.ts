/**
 * HOOK: useTaxesAndExpenses
 * Gerencia impostos e despesas da simulação de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx para modularização
 */
import { useCallback } from 'react';
import { Tax, Expense, UseTaxesReturn, UseExpensesReturn } from '../types';

// ===== TAXES HOOK =====
export const useTaxes = (
  taxes: Tax[],
  updateTaxes: (taxes: Tax[]) => void
): UseTaxesReturn => {
  
  const addTax = useCallback((tax: Omit<Tax, 'valor'>) => {
    const newTax: Tax = {
      ...tax,
      valor: 0
    };
    updateTaxes([...taxes, newTax]);
  }, [taxes, updateTaxes]);

  const updateTax = useCallback((index: number, taxUpdate: Partial<Tax>) => {
    const updatedTaxes = taxes.map((tax, i) => 
      i === index ? { ...tax, ...taxUpdate } : tax
    );
    updateTaxes(updatedTaxes);
  }, [taxes, updateTaxes]);

  const removeTax = useCallback((index: number) => {
    const filteredTaxes = taxes.filter((_, i) => i !== index);
    updateTaxes(filteredTaxes);
  }, [taxes, updateTaxes]);

  const calculateTaxes = useCallback(() => {
    // Calculation logic would be integrated with main calculation hook
    // This is a placeholder for tax-specific calculations
    console.log('Calculating taxes...');
  }, []);

  return {
    taxes,
    addTax,
    updateTax,
    removeTax,
    calculateTaxes
  };
};

// ===== EXPENSES HOOK =====
export const useExpenses = (
  expenses: Expense[],
  updateExpenses: (expenses: Expense[]) => void,
  taxaDolar: number
): UseExpensesReturn => {
  
  const addExpense = useCallback((expense: Omit<Expense, 'valorReal'>) => {
    const newExpense: Expense = {
      ...expense,
      valorReal: expense.valorDolar * taxaDolar
    };
    updateExpenses([...expenses, newExpense]);
  }, [expenses, updateExpenses, taxaDolar]);

  const updateExpense = useCallback((index: number, expenseUpdate: Partial<Expense>) => {
    const updatedExpenses = expenses.map((expense, i) => {
      if (i === index) {
        const updated = { ...expense, ...expenseUpdate };
        // Recalculate valorReal if valorDolar changed
        if (expenseUpdate.valorDolar !== undefined) {
          updated.valorReal = expenseUpdate.valorDolar * taxaDolar;
        }
        return updated;
      }
      return expense;
    });
    updateExpenses(updatedExpenses);
  }, [expenses, updateExpenses, taxaDolar]);

  const removeExpense = useCallback((index: number) => {
    const filteredExpenses = expenses.filter((_, i) => i !== index);
    updateExpenses(filteredExpenses);
  }, [expenses, updateExpenses]);

  const calculateExpenses = useCallback(() => {
    // Recalculate all valorReal based on current taxaDolar
    const updatedExpenses = expenses.map(expense => ({
      ...expense,
      valorReal: expense.valorDolar * taxaDolar
    }));
    updateExpenses(updatedExpenses);
  }, [expenses, updateExpenses, taxaDolar]);

  return {
    expenses,
    addExpense,
    updateExpense,
    removeExpense,
    calculateExpenses
  };
};
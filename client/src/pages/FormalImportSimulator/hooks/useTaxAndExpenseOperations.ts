import { Tax, Expense } from './useFormalImportState';

export const useTaxAndExpenseOperations = (
  simulation: any,
  setSimulation: (simulation: any) => void
) => {
  const calculateTaxEstimate = (tax: Tax) => {
    const baseCalculo = simulation.valorFobDolar + simulation.valorFreteDolar + 
      (simulation.valorFobDolar * simulation.percentualSeguro);
    
    return (baseCalculo * tax.aliquota) / 100;
  };

  const addCustomTax = () => {
    const newTax: Tax = {
      nome: "",
      aliquota: 0,
      baseCalculo: "fob_frete_seguro",
      valor: 0
    };

    setSimulation({
      ...simulation,
      impostos: [...simulation.impostos, newTax]
    });
  };

  const removeCustomTax = (index: number) => {
    const updatedTaxes = simulation.impostos.filter((_: any, i: number) => i !== index);
    setSimulation({
      ...simulation,
      impostos: updatedTaxes
    });
  };

  const updateTax = (index: number, field: keyof Tax, value: any) => {
    const updatedTaxes = [...simulation.impostos];
    updatedTaxes[index] = {
      ...updatedTaxes[index],
      [field]: value
    };

    // Recalcular valor se aliquota foi alterada
    if (field === 'aliquota') {
      updatedTaxes[index].valor = calculateTaxEstimate(updatedTaxes[index]);
    }

    setSimulation({
      ...simulation,
      impostos: updatedTaxes
    });
  };

  const addNewExpense = () => {
    const newExpense: Expense = {
      nome: "",
      valorDolar: 0,
      valorReal: 0
    };

    setSimulation({
      ...simulation,
      despesasAdicionais: [...simulation.despesasAdicionais, newExpense]
    });
  };

  const removeExpense = (index: number) => {
    const updatedExpenses = simulation.despesasAdicionais.filter((_: any, i: number) => i !== index);
    setSimulation({
      ...simulation,
      despesasAdicionais: updatedExpenses
    });
  };

  const updateExpense = (index: number, field: keyof Expense, value: any) => {
    const updatedExpenses = [...simulation.despesasAdicionais];
    updatedExpenses[index] = {
      ...updatedExpenses[index],
      [field]: value
    };

    // Recalcular valor em real se valor em dólar foi alterado
    if (field === 'valorDolar') {
      updatedExpenses[index].valorReal = value * simulation.taxaDolar;
    }

    // Recalcular valor em dólar se valor em real foi alterado
    if (field === 'valorReal') {
      updatedExpenses[index].valorDolar = value / simulation.taxaDolar;
    }

    setSimulation({
      ...simulation,
      despesasAdicionais: updatedExpenses
    });
  };

  const handleExpenseUSDChange = (index: number, value: number) => {
    updateExpense(index, 'valorDolar', value);
  };

  const handleExpenseRealChange = (index: number, value: number) => {
    updateExpense(index, 'valorReal', value);
  };

  return {
    calculateTaxEstimate,
    addCustomTax,
    removeCustomTax,
    updateTax,
    addNewExpense,
    removeExpense,
    updateExpense,
    handleExpenseUSDChange,
    handleExpenseRealChange
  };
}; 
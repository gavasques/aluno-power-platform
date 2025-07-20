import { Product } from './useFormalImportState';

export const useProductOperations = (
  simulation: any,
  setSimulation: (simulation: any) => void
) => {
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      nome: `Produto ${simulation.produtos.length + 1}`,
      ncm: "",
      quantidade: 1,
      valorUnitarioUsd: 100,
      comprimento: 30,
      largura: 20,
      altura: 15
    };

    setSimulation({
      ...simulation,
      produtos: [...simulation.produtos, newProduct]
    });
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updatedProducts = [...simulation.produtos];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };

    // Calcular CBM unitário se dimensões foram alteradas
    if (field === 'comprimento' || field === 'largura' || field === 'altura') {
      const produto = updatedProducts[index];
      const cbmUnitario = (produto.comprimento * produto.largura * produto.altura) / 1000000; // cm³ para m³
      const cbmTotal = cbmUnitario * produto.quantidade;
      
      updatedProducts[index] = {
        ...produto,
        cbmUnitario,
        cbmTotal
      };
    }

    // Calcular valor total USD se quantidade ou valor unitário foram alterados
    if (field === 'quantidade' || field === 'valorUnitarioUsd') {
      const produto = updatedProducts[index];
      const valorTotalUSD = produto.quantidade * produto.valorUnitarioUsd;
      
      updatedProducts[index] = {
        ...produto,
        valorTotalUSD
      };
    }

    setSimulation({
      ...simulation,
      produtos: updatedProducts
    });
  };

  const removeProduct = (index: number) => {
    const updatedProducts = simulation.produtos.filter((_: any, i: number) => i !== index);
    setSimulation({
      ...simulation,
      produtos: updatedProducts
    });
  };

  const calculateProductTotals = () => {
    const totalCBM = simulation.produtos.reduce((sum: number, produto: Product) => {
      return sum + (produto.cbmTotal || 0);
    }, 0);

    const totalUSD = simulation.produtos.reduce((sum: number, produto: Product) => {
      return sum + (produto.valorTotalUSD || 0);
    }, 0);

    return { totalCBM, totalUSD };
  };

  return {
    addProduct,
    updateProduct,
    removeProduct,
    calculateProductTotals
  };
}; 
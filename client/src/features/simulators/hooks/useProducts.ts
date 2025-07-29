/**
 * HOOK: useProducts
 * Gerencia produtos da simulação de importação formal
 * Extraído de FormalImportSimulatorFixed.tsx para modularização
 */
import { useCallback } from 'react';
import { Product, UseProductsReturn } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useProducts = (
  products: Product[],
  updateProducts: (products: Product[]) => void,
  taxaDolar: number
): UseProductsReturn => {
  
  // ===== PRODUCT ACTIONS =====
  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4()
    };
    
    updateProducts([...products, newProduct]);
  }, [products, updateProducts]);

  const updateProduct = useCallback((id: string, productUpdate: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...productUpdate } : product
    );
    updateProducts(updatedProducts);
  }, [products, updateProducts]);

  const removeProduct = useCallback((id: string) => {
    const filteredProducts = products.filter(product => product.id !== id);
    updateProducts(filteredProducts);
  }, [products, updateProducts]);

  // ===== PRODUCT METRICS CALCULATION =====
  const calculateProductMetrics = useCallback(() => {
    const totalCbm = products.reduce((total, product) => {
      const cbmUnitario = (product.comprimento * product.largura * product.altura) / 1000000; // cm³ to m³
      return total + (cbmUnitario * product.quantidade);
    }, 0);

    const updatedProducts = products.map(product => {
      const cbmUnitario = (product.comprimento * product.largura * product.altura) / 1000000;
      const cbmTotal = cbmUnitario * product.quantidade;
      const percentualContainer = totalCbm > 0 ? (cbmTotal / totalCbm) * 100 : 0;
      const valorTotalUSD = product.quantidade * product.valorUnitarioUsd;
      const valorTotalBRL = valorTotalUSD * taxaDolar;

      return {
        ...product,
        cbmUnitario,
        cbmTotal,
        percentualContainer,
        valorTotalUSD,
        valorTotalBRL
      };
    });

    updateProducts(updatedProducts);
  }, [products, updateProducts, taxaDolar]);

  return {
    products,
    addProduct,
    updateProduct,
    removeProduct,
    calculateProductMetrics
  };
};
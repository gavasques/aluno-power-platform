/**
 * HOOK: useProductDetail
 * Gerencia dados detalhados do produto importado
 * Extraído de ImportedProductDetail.tsx para modularização
 */
import { useState, useEffect, useCallback } from 'react';
import { ProductDetailView, ProductDetailApiResponse, UseProductDetailReturn } from '../types';

export const useProductDetail = (productId: string): UseProductDetailReturn => {
  // ===== STATE =====
  const [product, setProduct] = useState<ProductDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== FETCH PRODUCT DATA =====
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError('ID do produto não fornecido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/imported-products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: ProductDetailApiResponse = await response.json();
      
      // Combine all data into single product view
      const productView: ProductDetailView = {
        ...data.product,
        images: data.images || [],
        suppliers: data.suppliers || [],
        packages: data.packages || []
      };

      setProduct(productView);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Falha ao carregar produto: ${errorMessage}`);
      console.error('Erro ao buscar produto:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ===== REFETCH FUNCTION =====
  const refetch = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch
  };
};
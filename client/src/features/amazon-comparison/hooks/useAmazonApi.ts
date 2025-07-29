/**
 * HOOK: useAmazonApi
 * Gerencia chamadas para API da Amazon
 * Extraído de CompararListings.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AmazonProductResponse, UseAmazonApiReturn, API_ENDPOINTS } from '../types';

export const useAmazonApi = (): UseAmazonApiReturn => {
  // ===== EXTERNAL HOOKS =====
  const { token } = useAuth();

  // ===== STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== API CALLS =====
  const fetchProduct = useCallback(async (asin: string, country: string): Promise<AmazonProductResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AMAZON_PRODUCT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asin: asin.trim(),
          country: country
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Erro ${response.status}: ${response.statusText}`
        );
      }

      const data: AmazonProductResponse = await response.json();
      
      if (data.status !== 'success' && data.status !== 'OK') {
        throw new Error('Produto não encontrado ou indisponível');
      }

      return data;

    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao buscar produto na Amazon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    fetchProduct,
    isLoading,
    error
  };
};
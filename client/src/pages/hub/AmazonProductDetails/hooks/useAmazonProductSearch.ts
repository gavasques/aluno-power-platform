import { useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import type { 
  UseAmazonProductSearchReturn, 
  SearchState, 
  ProductData, 
  AmazonProductDetailsResponse 
} from '../types';

/**
 * USE AMAZON PRODUCT SEARCH HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para busca de produtos Amazon
 * Responsabilidade única: Gerenciar estado de busca e API calls
 */
export function useAmazonProductSearch(): UseAmazonProductSearchReturn {
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast } = useCreditSystem();
  const { execute: executeRequest } = useApiRequest();

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    asin: '',
    country: 'US'
  });

  // Product data state
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update search state
  const updateSearchState = (field: keyof SearchState, value: any) => {
    setSearchState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle search
  const handleSearch = async (): Promise<void> => {
    if (!searchState.asin.trim()) {
      toast({
        title: "ASIN obrigatório",
        description: "Por favor, digite um ASIN válido",
        variant: "destructive"
      });
      return;
    }

    // Check credits before making request
    const hasCredits = await checkCredits('tools.product_details', 1);
    if (!hasCredits) {
      showInsufficientCreditsToast('tools.product_details', 1);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProductData(null);

    try {
      const response = await executeRequest<AmazonProductDetailsResponse>({
        endpoint: '/api/amazon-product-details',
        method: 'POST',
        data: {
          asin: searchState.asin.trim(),
          country: searchState.country
        }
      });

      if (response.success && response.data) {
        setProductData(response.data);
        toast({
          title: "Produto encontrado!",
          description: "Dados do produto carregados com sucesso"
        });
      } else {
        throw new Error(response.error || 'Produto não encontrado');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produto';
      setError(errorMessage);
      
      toast({
        title: "Erro na busca",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchState,
    productData,
    updateSearchState,
    handleSearch,
    isLoading,
    error
  };
}
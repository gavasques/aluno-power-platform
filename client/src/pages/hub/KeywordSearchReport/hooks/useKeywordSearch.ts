import { useState, useCallback } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { SearchParams, SearchState, Product } from '../types';
import { FEATURE_CODE } from '../types';

export const useKeywordSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    country: 'BR',
    sort_by: 'RELEVANCE',
    min_price: '',
    max_price: '',
    brand: '',
    seller_id: '',
    deals_and_discounts: 'NONE'
  });

  const [state, setState] = useState<SearchState>({
    isSearching: false,
    currentPage: 0,
    totalPages: 7,
    progress: 0,
    products: [],
    totalProducts: 0,
    searchParams: null,
    errors: []
  });

  const { execute, loading } = useApiRequest();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();
  const { token } = useAuth();

  const updateSearchParam = useCallback((key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const searchProducts = useCallback(async (page: number): Promise<Product[]> => {
    const data = await execute(
      () => fetch('/api/amazon-keywords/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...searchParams,
          page,
          min_price: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
          max_price: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
        })
      })
    );

    if (data?.success) {
      return data.data.products || [];
    }
    
    throw new Error('Falha na busca de produtos');
  }, [execute, searchParams, token]);

  const startSearch = useCallback(async () => {
    if (!searchParams.query.trim()) return;

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setState(prev => ({
      ...prev,
      isSearching: true,
      currentPage: 0,
      progress: 0,
      products: [],
      errors: [],
      searchParams: { ...searchParams }
    }));

    // Log da busca inicial
    try {
      await fetch('/api/amazon-keywords/log-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchParams.query,
          country: searchParams.country,
          filters: {
            sort_by: searchParams.sort_by,
            brand: searchParams.brand,
            min_price: searchParams.min_price,
            max_price: searchParams.max_price,
            seller_id: searchParams.seller_id,
            deals_and_discounts: searchParams.deals_and_discounts,
          }
        })
      });
    } catch (logError) {
      // Log error silently
    }

    try {
      let allProducts: Product[] = [];
      const totalPages = 7;

      for (let page = 1; page <= totalPages; page++) {
        setState(prev => ({
          ...prev,
          currentPage: page,
          progress: (page / totalPages) * 100
        }));

        try {
          const products = await searchProducts(page);
          allProducts = [...allProducts, ...products];
          
          setState(prev => ({
            ...prev,
            products: allProducts,
            totalProducts: allProducts.length
          }));
          
          if (page < totalPages) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          const errorMsg = `Erro na página ${page}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
          setState(prev => ({
            ...prev,
            errors: [...prev.errors, errorMsg]
          }));
        }
      }

      setState(prev => ({
        ...prev,
        isSearching: false,
        products: allProducts,
        totalProducts: allProducts.length,
        progress: 100
      }));

      // Registrar log de uso com dedução automática de créditos
      await logAIGeneration({
        featureCode: FEATURE_CODE,
        provider: 'amazon',
        model: 'keyword-search',
        prompt: `Pesquisa: ${searchParams.query}`,
        response: `${allProducts.length} produtos encontrados`,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        duration: 0
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isSearching: false,
        errors: [...prev.errors, `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }));
    }
  }, [searchParams, checkCredits, showInsufficientCreditsToast, searchProducts, logAIGeneration]);

  const stopSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSearching: false
    }));
  }, []);

  return {
    searchParams,
    state,
    loading,
    actions: {
      updateSearchParam,
      startSearch,
      stopSearch,
      downloadXLSX: () => {} // Will be implemented in export hook
    }
  };
};
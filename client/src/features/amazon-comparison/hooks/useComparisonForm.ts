/**
 * HOOK: useComparisonForm
 * Gerencia estado e validação do formulário de comparação Amazon
 * Extraído de CompararListings.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { 
  ComparisonFormData, 
  ComparisonState, 
  ComparisonErrors, 
  UseComparisonFormReturn,
  AmazonProductResponse,
  MAX_ASINS,
  MIN_ASINS,
  VALIDATION_MESSAGES
} from '../types';
import { useAmazonApi } from './useAmazonApi';
import { validateComparisonForm } from '../utils/validation';

export const useComparisonForm = (): UseComparisonFormReturn => {
  // ===== EXTERNAL HOOKS =====
  const { toast } = useToast();
  const { checkCredits } = useCreditSystem();
  const amazonApi = useAmazonApi();

  // ===== STATE =====
  const [formData, setFormData] = useState<ComparisonFormData>({
    asins: ['', ''],
    country: 'BR'
  });

  const [state, setState] = useState<ComparisonState>({
    asins: ['', ''],
    country: 'BR',
    loading: false,
    results: [],
    error: ''
  });

  const [errors, setErrors] = useState<ComparisonErrors>({});

  // ===== FORM ACTIONS =====
  const handleAddAsin = useCallback(() => {
    if (formData.asins.length < MAX_ASINS) {
      const newAsins = [...formData.asins, ''];
      setFormData(prev => ({ ...prev, asins: newAsins }));
      setState(prev => ({ ...prev, asins: newAsins }));
    }
  }, [formData.asins]);

  const handleRemoveAsin = useCallback((index: number) => {
    if (formData.asins.length > MIN_ASINS) {
      const newAsins = formData.asins.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, asins: newAsins }));
      setState(prev => ({ ...prev, asins: newAsins }));
      
      // Clear error for removed ASIN
      if (errors.asins) {
        const newAsinErrors = [...errors.asins];
        newAsinErrors.splice(index, 1);
        setErrors(prev => ({ ...prev, asins: newAsinErrors }));
      }
    }
  }, [formData.asins, errors.asins]);

  const handleAsinChange = useCallback((index: number, value: string) => {
    const newAsins = [...formData.asins];
    newAsins[index] = value.toUpperCase().trim();
    
    setFormData(prev => ({ ...prev, asins: newAsins }));
    setState(prev => ({ ...prev, asins: newAsins }));
    
    // Clear error for this specific ASIN
    if (errors.asins && errors.asins[index]) {
      const newAsinErrors = [...errors.asins];
      newAsinErrors[index] = '';
      setErrors(prev => ({ ...prev, asins: newAsinErrors }));
    }
  }, [formData.asins, errors.asins]);

  const handleCountryChange = useCallback((country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setState(prev => ({ ...prev, country }));
    
    // Clear country error
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: undefined }));
    }
  }, [errors.country]);

  // ===== COMPARISON LOGIC =====
  const handleCompare = useCallback(async () => {
    // Clear previous errors and results
    setErrors({});
    setState(prev => ({ ...prev, error: '', results: [] }));

    // Validate form
    const validationErrors = validateComparisonForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check credits
    const requiredCredits = formData.asins.filter(asin => asin.trim()).length * 10;
    const hasCredits = await checkCredits(requiredCredits);
    
    if (!hasCredits) {
      setErrors({ general: VALIDATION_MESSAGES.CREDITS_INSUFFICIENT });
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${requiredCredits} créditos para esta comparação.`,
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const validAsins = formData.asins.filter(asin => asin.trim());
      const promises = validAsins.map(asin => 
        amazonApi.fetchProduct(asin, formData.country)
      );

      const results = await Promise.allSettled(promises);
      const successfulResults: AmazonProductResponse[] = [];
      const failedAsins: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
        } else {
          failedAsins.push(validAsins[index]);
        }
      });

      if (successfulResults.length === 0) {
        throw new Error('Nenhum produto encontrado');
      }

      setState(prev => ({ 
        ...prev, 
        results: successfulResults, 
        loading: false 
      }));

      if (failedAsins.length > 0) {
        toast({
          title: "Alguns produtos não foram encontrados",
          description: `ASINs não encontrados: ${failedAsins.join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Comparação realizada com sucesso",
          description: `${successfulResults.length} produtos comparados.`,
        });
      }

    } catch (error: any) {
      const errorMessage = error?.message || VALIDATION_MESSAGES.API_ERROR;
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      
      setErrors({ general: errorMessage });
      
      toast({
        title: "Erro na comparação",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [formData, amazonApi, checkCredits, toast]);

  // ===== EXPORT LOGIC =====
  const handleExportComparison = useCallback(() => {
    if (state.results.length === 0) {
      toast({
        title: "Nenhum resultado para exportar",
        description: "Realize uma comparação primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        country: state.country,
        products: state.results.map(result => ({
          asin: result.data.asin,
          title: result.data.product_title,
          price: result.data.product_price,
          rating: result.data.product_star_rating,
          reviews: result.data.product_num_ratings,
          availability: result.data.product_availability,
          is_best_seller: result.data.is_best_seller,
          is_prime: result.data.is_prime,
          url: result.data.product_url
        })),
        metrics: {
          avgPrice: calculateAveragePrice(state.results),
          avgRating: calculateAverageRating(state.results),
          avgReviews: calculateAverageReviews(state.results),
          bestSellers: countBestSellers(state.results),
          primeProducts: countPrimeProducts(state.results),
          climateFreindly: countClimateFreindly(state.results)
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amazon-comparison-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso.",
      });

    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  }, [state.results, state.country, toast]);

  // ===== UTILITY FUNCTIONS =====
  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: [], error: '' }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    state,
    errors,
    actions: {
      handleAddAsin,
      handleRemoveAsin,
      handleAsinChange,
      handleCountryChange,
      handleCompare,
      handleExportComparison,
      clearResults,
      clearErrors
    }
  };
};

// ===== HELPER FUNCTIONS =====
const calculateAveragePrice = (results: AmazonProductResponse[]): number => {
  const prices = results
    .map(r => parseFloat(r.data.product_price.replace(/[^\d.,]/g, '').replace(',', '.')))
    .filter(price => !isNaN(price));
  
  return prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
};

const calculateAverageRating = (results: AmazonProductResponse[]): number => {
  const ratings = results
    .map(r => parseFloat(r.data.product_star_rating))
    .filter(rating => !isNaN(rating));
  
  return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
};

const calculateAverageReviews = (results: AmazonProductResponse[]): number => {
  const reviews = results.map(r => r.data.product_num_ratings);
  return reviews.length > 0 ? reviews.reduce((sum, reviews) => sum + reviews, 0) / reviews.length : 0;
};

const countBestSellers = (results: AmazonProductResponse[]): number => {
  return results.filter(r => r.data.is_best_seller).length;
};

const countPrimeProducts = (results: AmazonProductResponse[]): number => {
  return results.filter(r => r.data.is_prime).length;
};

const countClimateFreindly = (results: AmazonProductResponse[]): number => {
  return results.filter(r => r.data.climate_pledge_friendly).length;
};
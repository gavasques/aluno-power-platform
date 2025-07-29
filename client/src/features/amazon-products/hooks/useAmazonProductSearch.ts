/**
 * HOOK: useAmazonProductSearch
 * Gerencia busca de produtos Amazon e estado da aplicação
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useAuth } from '@/hooks/useAuth';
import { useUserCreditBalance } from '@/hooks/useUserCredits';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductData, 
  UseAmazonProductSearchReturn, 
  FEATURE_CODE, 
  CREDIT_COSTS 
} from '../types';

export const useAmazonProductSearch = (): UseAmazonProductSearchReturn => {
  // ===== STATE MANAGEMENT =====
  const [asin, setAsin] = useState<string>('');
  const [country, setCountry] = useState<string>('BR');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ===== HOOKS INTEGRATION =====
  const { execute, loading, error } = useApiRequest<ProductData>({
    successMessage: 'Produto encontrado com sucesso!',
  });
  const { balance: userBalance } = useUserCreditBalance();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();
  const { toast } = useToast();
  const { token } = useAuth();

  // ===== COMPUTED VALUES =====
  const canAffordSearch = userBalance >= CREDIT_COSTS.SEARCH_PRODUCT;

  // ===== SEARCH ACTIONS =====
  const handleSearch = async () => {
    if (!asin.trim()) {
      toast({
        title: "ASIN obrigatório",
        description: "Por favor, informe um ASIN para buscar",
        variant: "destructive"
      });
      return;
    }

    if (!checkCredits(CREDIT_COSTS.SEARCH_PRODUCT, FEATURE_CODE)) {
      showInsufficientCreditsToast(CREDIT_COSTS.SEARCH_PRODUCT);
      return;
    }

    try {
      const result = await execute('/api/amazon-product-details', {
        method: 'POST',
        body: JSON.stringify({
          asin: asin.trim(),
          country: country
        })
      });

      if (result?.data) {
        setProductData(result);
        
        // Log successful AI generation for credits
        await logAIGeneration(
          FEATURE_CODE,
          CREDIT_COSTS.SEARCH_PRODUCT,
          `Amazon Product Search: ${asin} (${country})`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error searching product:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o produto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // ===== EXPORT ACTIONS =====
  const handleExportTXT = async () => {
    if (!productData?.data) {
      toast({
        title: "Nenhum produto",
        description: "Busque um produto primeiro para exportar",
        variant: "destructive"
      });
      return;
    }

    if (!checkCredits(CREDIT_COSTS.EXPORT_TXT, FEATURE_CODE)) {
      showInsufficientCreditsToast(CREDIT_COSTS.EXPORT_TXT);
      return;
    }

    setIsExporting(true);
    try {
      const product = productData.data;
      const txtContent = `
DETALHES DO PRODUTO AMAZON
========================

ASIN: ${product.asin}
País: ${product.country}
Título: ${product.product_title}
Preço: ${product.product_price}
Preço Original: ${product.product_original_price}
Avaliação: ${product.product_star_rating} (${product.product_num_ratings} avaliações)
Disponibilidade: ${product.product_availability}

CARACTERÍSTICAS:
- Best Seller: ${product.is_best_seller ? 'Sim' : 'Não'}
- Amazon Choice: ${product.is_amazon_choice ? 'Sim' : 'Não'}
- Prime: ${product.is_prime ? 'Sim' : 'Não'}
- Climate Pledge Friendly: ${product.climate_pledge_friendly ? 'Sim' : 'Não'}

DESCRIÇÃO:
${product.product_description}

SOBRE O PRODUTO:
${product.about_product?.join('\n') || 'Não disponível'}

URL DO PRODUTO: ${product.product_url}
      `.trim();

      const blob = new Blob([txtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amazon-product-${product.asin}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log successful export
      await logAIGeneration(
        FEATURE_CODE,
        CREDIT_COSTS.EXPORT_TXT,
        `TXT Export: ${product.asin}`,
        'success'
      );

      toast({
        title: "Arquivo exportado!",
        description: "O arquivo TXT foi baixado com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting TXT:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o arquivo TXT",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImages = async () => {
    if (!productData?.data?.product_photos) {
      toast({
        title: "Nenhuma imagem",
        description: "Este produto não possui imagens para download",
        variant: "destructive"
      });
      return;
    }

    if (!checkCredits(CREDIT_COSTS.DOWNLOAD_IMAGES, FEATURE_CODE)) {
      showInsufficientCreditsToast(CREDIT_COSTS.DOWNLOAD_IMAGES);
      return;
    }

    setIsExporting(true);
    try {
      const images = productData.data.product_photos;
      const downloadPromises = images.map(async (imageUrl, index) => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `amazon-${productData.data.asin}-image-${index + 1}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      // Log successful download
      await logAIGeneration(
        FEATURE_CODE,
        CREDIT_COSTS.DOWNLOAD_IMAGES,
        `Images Download: ${productData.data.asin} (${images.length} images)`,
        'success'
      );

      toast({
        title: "Imagens baixadas!",
        description: `${images.length} imagens foram baixadas com sucesso`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar as imagens",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ===== RETURN INTERFACE =====
  return {
    // Search State
    asin,
    setAsin,
    country,
    setCountry,
    productData,
    
    // Loading States
    isLoading: loading,
    isExporting,
    error,
    
    // Actions
    handleSearch,
    handleExportTXT,
    handleDownloadImages,
    
    // Credits
    userBalance,
    canAffordSearch
  };
};
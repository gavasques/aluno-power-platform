import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UseProductExportReturn, ProductData } from '../types';

/**
 * USE PRODUCT EXPORT HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para exportação de dados de produtos
 * Responsabilidade única: Gerenciar funcionalidades de exportação
 */
export function useProductExport(): UseProductExportReturn {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Export product data to TXT file
  const exportToTxt = (productData: ProductData['data']) => {
    try {
      const txtContent = generateTxtContent(productData);
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Amazon_${productData.asin}_${productData.country}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação concluída",
        description: "Arquivo TXT baixado com sucesso"
      });
    } catch (error) {
      console.error('Error exporting TXT:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo TXT",
        variant: "destructive"
      });
    }
  };

  // Download product images
  const downloadImages = async (productData: ProductData['data']) => {
    if (!productData.product_photos || productData.product_photos.length === 0) {
      toast({
        title: "Nenhuma imagem encontrada",
        description: "Este produto não possui imagens para download",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Download images sequentially to avoid overwhelming the browser
      for (let i = 0; i < productData.product_photos.length; i++) {
        const imageUrl = productData.product_photos[i];
        await downloadImage(imageUrl, `${productData.asin}_image_${i + 1}`);
        
        // Small delay between downloads
        if (i < productData.product_photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Download concluído",
        description: `${productData.product_photos.length} imagens baixadas com sucesso`
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar todas as imagens",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToTxt,
    downloadImages,
    isExporting
  };
}

// Helper function to generate TXT content
function generateTxtContent(productData: ProductData['data']): string {
  const sections = [
    "=".repeat(60),
    "AMAZON PRODUCT DETAILS",
    "=".repeat(60),
    "",
    `ASIN: ${productData.asin}`,
    `País: ${productData.country}`,
    `Título: ${productData.product_title}`,
    `URL: ${productData.product_url}`,
    "",
    "PREÇO E DISPONIBILIDADE",
    "-".repeat(30),
    `Preço atual: ${productData.product_price}`,
    `Preço original: ${productData.product_original_price}`,
    `Disponibilidade: ${productData.product_availability}`,
    `Número de ofertas: ${productData.product_num_offers}`,
    "",
    "AVALIAÇÕES",
    "-".repeat(30),
    `Classificação: ${productData.product_star_rating} estrelas`,
    `Número de avaliações: ${productData.product_num_ratings}`,
    ""
  ];

  // Add badges
  const badges = [];
  if (productData.is_best_seller) badges.push("Best Seller");
  if (productData.is_amazon_choice) badges.push("Amazon's Choice");
  if (productData.is_prime) badges.push("Prime");
  if (productData.climate_pledge_friendly) badges.push("Climate Pledge Friendly");
  if (productData.has_aplus) badges.push("A+ Content");

  if (badges.length > 0) {
    sections.push("BADGES");
    sections.push("-".repeat(30));
    badges.forEach(badge => sections.push(`• ${badge}`));
    sections.push("");
  }

  // Add description
  if (productData.product_description) {
    sections.push("DESCRIÇÃO");
    sections.push("-".repeat(30));
    sections.push(productData.product_description);
    sections.push("");
  }

  // Add about product
  if (productData.about_product && productData.about_product.length > 0) {
    sections.push("SOBRE O PRODUTO");
    sections.push("-".repeat(30));
    productData.about_product.forEach(item => sections.push(`• ${item}`));
    sections.push("");
  }

  // Add specifications
  if (productData.product_information && Object.keys(productData.product_information).length > 0) {
    sections.push("ESPECIFICAÇÕES TÉCNICAS");
    sections.push("-".repeat(30));
    Object.entries(productData.product_information).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        sections.push(`${key}: ${value}`);
      }
    });
    sections.push("");
  }

  // Add image URLs
  if (productData.product_photos && productData.product_photos.length > 0) {
    sections.push("IMAGENS");
    sections.push("-".repeat(30));
    productData.product_photos.forEach((url, index) => {
      sections.push(`Imagem ${index + 1}: ${url}`);
    });
    sections.push("");
  }

  // Add video URLs
  if (productData.product_photos_videos && productData.product_photos_videos.length > 0) {
    const videos = productData.product_photos_videos.filter(item => item.type === 'video');
    if (videos.length > 0) {
      sections.push("VÍDEOS");
      sections.push("-".repeat(30));
      videos.forEach((video, index) => {
        sections.push(`Vídeo ${index + 1}: ${video.url}`);
      });
      sections.push("");
    }
  }

  // Add category path
  if (productData.category_path && productData.category_path.length > 0) {
    sections.push("CATEGORIA");
    sections.push("-".repeat(30));
    const categoryPath = productData.category_path.map(cat => cat.name).join(" > ");
    sections.push(categoryPath);
    sections.push("");
  }

  sections.push("=".repeat(60));
  sections.push(`Exportado em: ${new Date().toLocaleString('pt-BR')}`);
  sections.push("=".repeat(60));

  return sections.join("\n");
}

// Helper function to download a single image
async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error(`Error downloading image ${filename}:`, error);
    throw error;
  }
}
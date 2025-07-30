import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import type { Product, SearchParams } from '../types';

export const useExportData = (products: Product[], searchParams: SearchParams) => {
  const { toast } = useToast();

  const formatPrice = useCallback((price: string | null | undefined): string => {
    if (!price) return 'N/A';
    return price.replace(/[^\d.,]/g, '');
  }, []);

  const downloadXLSX = useCallback(() => {
    if (products.length === 0) {
      toast({
        title: "Erro no Download",
        description: "Nenhum produto encontrado para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const workbookData = products.map((product, index) => ({
        'Nº': index + 1,
        'ASIN': product.asin,
        'Título do Produto': product.product_title,
        'Preço': formatPrice(product.product_price),
        'Preço Original': formatPrice(product.product_original_price),
        'Moeda': product.currency || 'N/A',
        'Avaliação': product.product_star_rating || 'N/A',
        'Número de Avaliações': product.product_num_ratings || 0,
        'Best Seller': product.is_best_seller ? 'Sim' : 'Não',
        'Amazon Choice': product.is_amazon_choice ? 'Sim' : 'Não',
        'Prime': product.is_prime ? 'Sim' : 'Não',
        'Volume de Vendas': product.sales_volume || 'N/A',
        'Entrega': product.delivery || 'N/A',
        'Badge': product.product_badge || 'N/A',
        'Descrição': product.product_byline || 'N/A',
        'URL do Produto': product.product_url,
        'URL da Imagem': product.product_photo
      }));

      const worksheet = XLSX.utils.json_to_sheet(workbookData);
      const workbook = XLSX.utils.book_new();
      
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
        { wch: 40 }, { wch: 40 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Produtos');
      
      const fileName = `relatorio_keywords_${searchParams.query.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, fileName);
      
      toast({
        title: "Download Iniciado",
        description: `Arquivo ${fileName} está sendo baixado.`,
      });
      
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Falha ao gerar arquivo XLSX. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [products, searchParams, formatPrice, toast]);

  return { downloadXLSX, formatPrice };
};
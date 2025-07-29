/**
 * HOOK: useProductActions
 * Gerencia ações do produto (PDF, download, update, delete)
 * Extraído de ImportedProductDetail.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { ImportedProduct, ProductImage, ProductStatus, UseProductActionsReturn } from '../types';

export const useProductActions = (): UseProductActionsReturn => {
  // ===== GENERATE PDF =====
  const generatePDF = useCallback(async (product: ImportedProduct) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Detalhes do Produto Importado', margin, yPosition);
      yPosition += 15;
      
      // Basic Information
      pdf.setFontSize(14);
      pdf.text('Informações Básicas', margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      const basicInfo = [
        `Nome: ${product.name}`,
        `Código Interno: ${product.internalCode}`,
        `Status: ${product.status}`,
        `Categoria: ${product.category || 'N/A'}`,
        `Marca: ${product.brand || 'N/A'}`,
        `Modelo: ${product.model || 'N/A'}`,
        `Referência: ${product.reference || 'N/A'}`
      ];
      
      basicInfo.forEach(info => {
        pdf.text(info, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      
      // Technical Specifications
      if (product.technicalSpecifications) {
        pdf.setFontSize(14);
        pdf.text('Especificações Técnicas', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(product.technicalSpecifications, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }
      
      // Supplier Information
      if (product.supplierName) {
        pdf.setFontSize(14);
        pdf.text('Informações do Fornecedor', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const supplierInfo = [
          `Fornecedor: ${product.supplierName}`,
          `Código do Produto no Fornecedor: ${product.supplierProductCode || 'N/A'}`,
          `Nome do Produto no Fornecedor: ${product.supplierProductName || 'N/A'}`,
          `MOQ: ${product.moq || 'N/A'}`,
          `Lead Time: ${product.leadTimeDays ? `${product.leadTimeDays} dias` : 'N/A'}`
        ];
        
        supplierInfo.forEach(info => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(info, margin, yPosition);
          yPosition += 5;
        });
      }
      
      // Save PDF
      const fileName = `produto_${product.internalCode}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Gerado",
        description: `Arquivo ${fileName} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar PDF do produto.",
        variant: "destructive",
      });
    }
  }, []);

  // ===== DOWNLOAD IMAGES =====
  const downloadImages = useCallback(async (images: ProductImage[]) => {
    if (images.length === 0) {
      toast({
        title: "Nenhuma Imagem",
        description: "Este produto não possui imagens para download.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const image of images) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = image.originalName || `imagem_${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "Download Concluído",
        description: `${images.length} imagem(ns) baixada(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao baixar imagens do produto.",
        variant: "destructive",
      });
    }
  }, []);

  // ===== UPDATE STATUS =====
  const updateStatus = useCallback(async (productId: string, status: ProductStatus) => {
    try {
      const response = await fetch(`/api/imported-products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Status Atualizado",
        description: `Status do produto alterado para: ${status}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do produto.",
        variant: "destructive",
      });
    }
  }, []);

  // ===== DELETE PRODUCT =====
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/imported-products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Produto Removido",
        description: "Produto foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover produto.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    generatePDF,
    downloadImages,
    updateStatus,
    deleteProduct
  };
};
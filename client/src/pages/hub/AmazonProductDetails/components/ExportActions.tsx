import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { ProductData, UseProductExportReturn } from '../types';

interface ExportActionsProps {
  productData: ProductData['data'];
  exportHook: UseProductExportReturn;
}

/**
 * EXPORT ACTIONS COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para ações de exportação
 * Responsabilidade única: Interface de exportação de dados
 */
export function ExportActions({ productData, exportHook }: ExportActionsProps) {
  const { exportToTxt, downloadImages, isExporting } = exportHook;

  const handleExportTxt = () => {
    exportToTxt(productData);
  };

  const handleDownloadImages = () => {
    downloadImages(productData);
  };

  const hasImages = productData.product_photos && productData.product_photos.length > 0;
  const imageCount = productData.product_photos?.length || 0;

  return (
    <Card className="border border-blue-200 bg-blue-50">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
          <Download className="w-5 h-5" />
          Ações de Exportação
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Export TXT */}
          <Button
            onClick={handleExportTxt}
            variant="outline"
            className="flex items-center gap-2 justify-start p-3 h-auto border-blue-300 hover:bg-blue-100 transition-colors"
            disabled={isExporting}
          >
            <div className="flex items-center gap-2 flex-1">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex flex-col items-start">
                <span className="font-medium text-blue-900">Exportar TXT</span>
                <span className="text-xs text-blue-700">
                  Arquivo de texto com todos os dados
                </span>
              </div>
            </div>
            {isExporting && <LoadingSpinner size="sm" />}
          </Button>

          {/* Download Images */}
          <Button
            onClick={handleDownloadImages}
            variant="outline"
            className="flex items-center gap-2 justify-start p-3 h-auto border-blue-300 hover:bg-blue-100 transition-colors"
            disabled={isExporting || !hasImages}
          >
            <div className="flex items-center gap-2 flex-1">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <div className="flex flex-col items-start">
                <span className="font-medium text-blue-900">Baixar Imagens</span>
                <span className="text-xs text-blue-700">
                  {hasImages 
                    ? `${imageCount} imagem${imageCount !== 1 ? 's' : ''} disponível${imageCount !== 1 ? 'is' : ''}`
                    : 'Nenhuma imagem disponível'
                  }
                </span>
              </div>
            </div>
            {isExporting && <LoadingSpinner size="sm" />}
          </Button>
        </div>

        {/* Export Info */}
        <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>TXT:</strong> Inclui título, preço, descrição, especificações, URLs de imagens e vídeos</div>
            <div><strong>Imagens:</strong> Download direto de todas as fotos do produto em alta qualidade</div>
          </div>
        </div>

        {/* Loading State */}
        {isExporting && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
            <LoadingSpinner size="sm" />
            <span>Processando exportação...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
/**
 * COMPONENTE: ExportActions
 * Ações de exportação para produtos Amazon
 * Extraído de AmazonProductDetails.tsx para modularização
 */
import { Button } from "@/components/ui/button";
import { Download, FileText, ImageIcon } from "lucide-react";
import { CreditCostButton } from '@/components/CreditCostButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ExportActionsProps, CREDIT_COSTS } from '../../types';

export const ExportActions = ({
  productData,
  onExportTXT,
  onDownloadImages,
  isExporting
}: ExportActionsProps) => {
  if (!productData) {
    return null;
  }

  const hasImages = productData.data.product_photos && productData.data.product_photos.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center sm:text-left">
        <h3 className="font-medium text-gray-900 mb-1">Exportar Dados do Produto</h3>
        <p className="text-sm text-gray-600">
          Baixe as informações ou imagens do produto
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Export TXT Button */}
        <CreditCostButton
          cost={CREDIT_COSTS.EXPORT_TXT}
          onClick={onExportTXT}
          disabled={isExporting}
          variant="outline"
          className="min-w-[140px] border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Exportando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Exportar TXT</span>
            </div>
          )}
        </CreditCostButton>

        {/* Download Images Button */}
        <CreditCostButton
          cost={CREDIT_COSTS.DOWNLOAD_IMAGES}
          onClick={onDownloadImages}
          disabled={isExporting || !hasImages}
          variant="outline"
          className="min-w-[150px] border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Baixando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>
                Baixar Imagens
                {hasImages && ` (${productData.data.product_photos.length})`}
              </span>
            </div>
          )}
        </CreditCostButton>
      </div>
      
      {!hasImages && (
        <p className="text-xs text-gray-500 text-center w-full sm:w-auto">
          Este produto não possui imagens disponíveis
        </p>
      )}
    </div>
  );
};
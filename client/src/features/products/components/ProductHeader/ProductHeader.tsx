/**
 * COMPONENTE: ProductHeader
 * Header com ações principais do produto
 * Extraído de ImportedProductDetail.tsx para modularização
 */
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ProductHeaderProps } from '../../types';

export const ProductHeader = ({
  product,
  onGeneratePDF,
  onDownloadImages,
  isGeneratingPDF
}: ProductHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Link href="/myarea/importacoes/produtos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">Código: {product.internalCode}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onGeneratePDF}
          disabled={isGeneratingPDF}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Gerando...' : 'PDF'}
        </Button>
        
        <Button
          onClick={onDownloadImages}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Imagens
        </Button>
        
        <Link href={`/myarea/importacoes/produtos/${product.id}/edit`}>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>
    </div>
  );
};
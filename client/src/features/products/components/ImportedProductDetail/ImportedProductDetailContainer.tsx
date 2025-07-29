/**
 * CONTAINER: ImportedProductDetailContainer
 * Lógica de negócio para detalhes de produtos importados
 * Extraído de ImportedProductDetail.tsx (1020 linhas) para modularização
 * Data: Janeiro 29, 2025
 */
import { useParams } from 'wouter';
import { useProductDetail } from '../../hooks/useProductDetail';
import { useProductActions } from '../../hooks/useProductActions';
import { useProductImages } from '../../hooks/useProductImages';
import { ImportedProductDetailPresentation } from './ImportedProductDetailPresentation';

export const ImportedProductDetailContainer = () => {
  // ===== PARAMS =====
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600">ID do produto não foi fornecido.</p>
        </div>
      </div>
    );
  }

  // ===== HOOKS INTEGRATION =====
  const productHook = useProductDetail(id);
  const actionsHook = useProductActions();
  const imagesHook = useProductImages(productHook.product?.images || []);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Product data
    productProps: {
      product: productHook.product,
      isLoading: productHook.isLoading,
      error: productHook.error,
      refetch: productHook.refetch
    },

    // Product actions
    actionsProps: {
      onGeneratePDF: () => productHook.product && actionsHook.generatePDF(productHook.product),
      onDownloadImages: () => actionsHook.downloadImages(imagesHook.images),
      onUpdateStatus: actionsHook.updateStatus,
      onDeleteProduct: actionsHook.deleteProduct
    },

    // Images management
    imagesProps: {
      images: imagesHook.images,
      selectedImage: imagesHook.selectedImage,
      isImageModalOpen: imagesHook.isImageModalOpen,
      onImageClick: imagesHook.openImageModal,
      onCloseImageModal: imagesHook.closeImageModal
    }
  };

  return <ImportedProductDetailPresentation {...containerProps} />;
};
/**
 * HOOK: useProductImages
 * Gerencia estado e ações das imagens do produto
 * Extraído de ImportedProductDetail.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { ProductImage, UseProductImagesReturn } from '../types';

export const useProductImages = (images: ProductImage[]): UseProductImagesReturn => {
  // ===== STATE =====
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // ===== MODAL ACTIONS =====
  const openImageModal = useCallback((image: ProductImage) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  }, []);

  return {
    images,
    selectedImage,
    setSelectedImage,
    isImageModalOpen,
    openImageModal,
    closeImageModal
  };
};
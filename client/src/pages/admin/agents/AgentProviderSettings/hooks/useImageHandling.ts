import { useState } from 'react';
import type { ImageUploadState, ReferenceImage, UseImageHandlingReturn } from '../types';

/**
 * USE IMAGE HANDLING HOOK - FASE 4 REFATORAÇÃO
 * 
 * Hook especializado para gerenciamento de imagens
 * Responsabilidade única: Upload, preview e manipulação de imagens
 */
export function useImageHandling(): UseImageHandlingReturn {

  // Image state
  const [imageState, setImageState] = useState<ImageUploadState>({
    uploadedImage: null,
    imageFile: null,
    referenceImages: []
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setImageState(prev => ({
            ...prev,
            referenceImages: [
              ...prev.referenceImages,
              { file, preview }
            ]
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  // Remove specific image
  const removeImage = (index: number) => {
    setImageState(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  // Clear all images
  const clearImages = () => {
    setImageState(prev => ({
      ...prev,
      uploadedImage: null,
      imageFile: null,
      referenceImages: []
    }));
  };

  return {
    // Image state
    imageState,
    
    // Actions
    handleImageUpload,
    removeImage,
    clearImages
  };
}
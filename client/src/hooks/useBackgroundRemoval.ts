import { useState, useCallback } from 'react';
import type { BackgroundRemovalState } from '@/types/background-removal';
import { validateImageForBackgroundRemoval, uploadImageForBackgroundRemoval, processBackgroundRemoval } from '@/utils/background-removal';
import { useAsyncUpload, useAsyncProcessing } from './useAsyncOperation';

const initialState: Omit<BackgroundRemovalState, 'isProcessing' | 'isUploading' | 'error'> = {
  originalImage: null,
  processedImage: null,
  hasUploadedImage: false,
  uploadedImageId: null,
  processingDuration: 0,
};

export const useBackgroundRemoval = () => {
  const [state, setState] = useState(initialState);
  
  // Hooks especializados para upload e processamento
  const uploadOp = useAsyncUpload({
    loadingKey: 'background-upload',
    successMessage: "Imagem carregada com sucesso!",
    errorMessage: "Erro no upload"
  });

  const processOp = useAsyncProcessing({
    loadingKey: 'background-processing', 
    successMessage: "Background removido com sucesso!",
    errorMessage: "Erro no processamento"
  });

  const uploadImage = useCallback(async (file: File) => {
    const validation = validateImageForBackgroundRemoval(file);
    if (!validation.isValid) {
      uploadOp.setError(validation.error || 'Arquivo inválido');
      return false;
    }

    const result = await uploadOp.execute(async () => {
      const uploadResult = await uploadImageForBackgroundRemoval(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Erro no upload');
      }

      return uploadResult;
    });

    if (result) {
      const imageUrl = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        originalImage: {
          id: `temp-${Date.now()}`,
          url: imageUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        },
        uploadedImageId: result.imageId || null,
        hasUploadedImage: true,
        processedImage: null,
      }));
      return true;
    }

    return false;
  }, [uploadOp]);

  const removeBackground = useCallback(async () => {
    if (!state.uploadedImageId) {
      processOp.setError('Nenhuma imagem carregada');
      return;
    }

    const startTime = Date.now();
    
    const result = await processOp.execute(async () => {
      const processResult = await processBackgroundRemoval(state.uploadedImageId!);
      
      if (!processResult.success) {
        throw new Error(processResult.error || 'Erro no processamento');
      }

      return processResult;
    });

    if (result) {
      const duration = Date.now() - startTime;
      setState(prev => ({
        ...prev,
        processedImage: result.processedImageUrl || null,
        processingDuration: duration,
      }));
    }
  }, [state.uploadedImageId, processOp]);

  const removeImage = useCallback(() => {
    if (state.originalImage?.url) {
      URL.revokeObjectURL(state.originalImage.url);
    }
    setState(prev => ({
      ...prev,
      originalImage: null,
      processedImage: null,
      hasUploadedImage: false,
      uploadedImageId: null,
    }));
    uploadOp.reset();
    processOp.reset();
  }, [state.originalImage?.url, uploadOp, processOp]);

  const reset = useCallback(() => {
    if (state.originalImage?.url) {
      URL.revokeObjectURL(state.originalImage.url);
    }
    setState(initialState);
    uploadOp.reset();
    processOp.reset();
  }, [state.originalImage?.url, uploadOp, processOp]);

  return {
    // State - combinando estado local com operações assíncronas
    originalImage: state.originalImage,
    processedImage: state.processedImage,
    isProcessing: processOp.isLoading,
    isUploading: uploadOp.isLoading,
    hasUploadedImage: state.hasUploadedImage,
    error: uploadOp.error || processOp.error,
    processingDuration: state.processingDuration,
    
    // Novos recursos do useAsyncOperation
    shouldShowUploadLoading: uploadOp.shouldShowLoading,
    shouldShowProcessingLoading: processOp.shouldShowLoading,
    uploadProgress: uploadOp.progress,
    processProgress: processOp.progress,
    
    // Actions
    uploadImage,
    removeImage,
    removeBackground,
    reset,
  };
};
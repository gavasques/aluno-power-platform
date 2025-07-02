import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { BackgroundRemovalState } from '@/types/background-removal';
import { validateImageForBackgroundRemoval, uploadImageForBackgroundRemoval, processBackgroundRemoval } from '@/utils/background-removal';

const initialState: BackgroundRemovalState = {
  originalImage: null,
  processedImage: null,
  isProcessing: false,
  isUploading: false,
  hasUploadedImage: false,
  error: null,
  uploadedImageId: null,
  processingDuration: 0,
};

export const useBackgroundRemoval = () => {
  const [state, setState] = useState<BackgroundRemovalState>(initialState);
  const { toast } = useToast();

  const setIsUploading = useCallback((uploading: boolean) => {
    setState(prev => ({ ...prev, isUploading: uploading }));
  }, []);

  const setIsProcessing = useCallback((processing: boolean) => {
    setState(prev => ({ ...prev, isProcessing: processing }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    const validation = validateImageForBackgroundRemoval(file);
    if (!validation.isValid) {
      setError(validation.error || 'Arquivo inválido');
      toast({
        title: "Erro na validação",
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadImageForBackgroundRemoval(file);
      
      if (!result.success) {
        setError(result.error || 'Erro no upload');
        toast({
          title: "Erro no upload",
          description: result.error || 'Erro inesperado no upload',
          variant: "destructive",
        });
        return false;
      }

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
        error: null,
      }));

      toast({
        title: "Upload concluído",
        description: "Imagem carregada com sucesso!",
      });

      return true;
    } catch (error) {
      const errorMessage = 'Erro inesperado no upload';
      setError(errorMessage);
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [toast, setError, setIsUploading]);

  const removeBackground = useCallback(async () => {
    if (!state.uploadedImageId) {
      setError('Nenhuma imagem carregada');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();

    try {
      const result = await processBackgroundRemoval(state.uploadedImageId);
      const duration = Date.now() - startTime;

      if (!result.success) {
        setError(result.error || 'Erro no processamento');
        toast({
          title: "Erro no processamento",
          description: result.error || 'Erro inesperado no processamento',
          variant: "destructive",
        });
        return;
      }

      setState(prev => ({
        ...prev,
        processedImage: result.processedImageUrl || null,
        processingDuration: duration,
        error: null,
      }));

      toast({
        title: "Background removido com sucesso!",
        description: `Processamento concluído em ${Math.round(duration / 1000)}s`,
      });
    } catch (error) {
      const errorMessage = 'Erro inesperado no processamento';
      setError(errorMessage);
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [state.uploadedImageId, toast, setError, setIsProcessing]);

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
      error: null,
    }));
  }, [state.originalImage?.url]);

  const reset = useCallback(() => {
    if (state.originalImage?.url) {
      URL.revokeObjectURL(state.originalImage.url);
    }
    setState(initialState);
  }, [state.originalImage?.url]);

  return {
    // State
    originalImage: state.originalImage,
    processedImage: state.processedImage,
    isProcessing: state.isProcessing,
    isUploading: state.isUploading,
    hasUploadedImage: state.hasUploadedImage,
    error: state.error,
    processingDuration: state.processingDuration,
    
    // Actions
    uploadImage,
    removeImage,
    removeBackground,
    reset,
  };
};
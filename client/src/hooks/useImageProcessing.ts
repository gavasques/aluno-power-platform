import { useState, useCallback } from 'react';
import { AIImageService } from '@/services/aiImageService';
import { AI_IMAGE_CONFIG } from '@/config/ai-image';
import type { 
  UploadedImage, 
  ProcessedImage, 
  ProcessingState, 
  UpscaleOptions, 
  BackgroundRemovalOptions 
} from '@/types/ai-image';

interface UseImageProcessingReturn {
  // Estado
  uploadedImage: UploadedImage | null;
  processedImage: ProcessedImage | null;
  state: ProcessingState;
  
  // Ações
  uploadImage: (file: File) => Promise<void>;
  processBackgroundRemoval: (options?: BackgroundRemovalOptions) => Promise<void>;
  processUpscale: (options: UpscaleOptions) => Promise<void>;
  downloadImage: (fileName?: string) => Promise<void>;
  reset: () => void;
}

export const useImageProcessing = (): UseImageProcessingReturn => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    isUploading: false,
    error: null,
    step: '',
  });

  const updateState = useCallback((updates: Partial<ProcessingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      updateState({ isUploading: true, error: null });
      
      // Validar arquivo
      AIImageService.validateImageFile(file, AI_IMAGE_CONFIG);
      
      // Upload
      const result = await AIImageService.uploadImage(file);
      setUploadedImage(result);
      
      updateState({ isUploading: false });
    } catch (error) {
      updateState({ 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Erro no upload' 
      });
    }
  }, [updateState]);

  const processBackgroundRemoval = useCallback(async (options: BackgroundRemovalOptions = {}) => {
    if (!uploadedImage) return;
    
    try {
      updateState({ isProcessing: true, error: null, step: 'Removendo background...' });
      
      const result = await AIImageService.removeBackground(uploadedImage.id, options);
      setProcessedImage(result);
      
      updateState({ isProcessing: false, step: '' });
    } catch (error) {
      updateState({ 
        isProcessing: false, 
        step: '',
        error: error instanceof Error ? error.message : 'Erro no processamento' 
      });
    }
  }, [uploadedImage, updateState]);

  const processUpscale = useCallback(async (options: UpscaleOptions) => {
    if (!uploadedImage) return;
    
    try {
      const stepMessage = `Processando upscale ${options.scale}x...`;
      updateState({ isProcessing: true, error: null, step: stepMessage });
      
      const result = await AIImageService.upscaleImage(uploadedImage.id, options);
      setProcessedImage(result);
      
      updateState({ isProcessing: false, step: '' });
    } catch (error) {
      updateState({ 
        isProcessing: false, 
        step: '',
        error: error instanceof Error ? error.message : 'Erro no processamento' 
      });
    }
  }, [uploadedImage, updateState]);

  const downloadImage = useCallback(async (fileName?: string) => {
    if (!processedImage || !uploadedImage) return;
    
    try {
      updateState({ error: null, step: 'Preparando download...' });
      
      const downloadFileName = fileName || `processed_${uploadedImage.metadata.fileName}`;
      await AIImageService.downloadProcessedImage(processedImage.url, downloadFileName);
      
      updateState({ step: '' });
    } catch (error) {
      updateState({ 
        error: 'Erro no download da imagem',
        step: '' 
      });
    }
  }, [processedImage, uploadedImage, updateState]);

  const reset = useCallback(() => {
    setUploadedImage(null);
    setProcessedImage(null);
    setState({
      isProcessing: false,
      isUploading: false,
      error: null,
      step: '',
    });
  }, []);

  return {
    uploadedImage,
    processedImage,
    state,
    uploadImage,
    processBackgroundRemoval,
    processUpscale,
    downloadImage,
    reset,
  };
};
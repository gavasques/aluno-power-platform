/**
 * Processing logic hook for image upscale tool
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ImageUpscaleParams, UpscaleResult } from '../types';
import { PROCESSING_STEPS, UPSCALE_CONFIG } from '../constants';

interface UseUpscaleProcessingProps {
  onProcessingStateChange: (isProcessing: boolean, step: number, status: string) => void;
  onResultChange: (result: UpscaleResult | null) => void;
}

export const useUpscaleProcessing = ({
  onProcessingStateChange,
  onResultChange
}: UseUpscaleProcessingProps) => {
  const { toast } = useToast();

  const processImage = useCallback(async (
    imageData: string,
    fileName: string,
    parameters: ImageUpscaleParams
  ) => {
    if (!imageData) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro.",
        variant: "destructive"
      });
      return;
    }

    onProcessingStateChange(true, 0, '');
    onResultChange(null);

    try {
      // Process each step with delay for better UX
      for (let step = 0; step < UPSCALE_CONFIG.totalSteps - 1; step++) {
        onProcessingStateChange(true, step + 1, PROCESSING_STEPS[step]);
        await new Promise(resolve => setTimeout(resolve, UPSCALE_CONFIG.stepDelay));
      }

      // Final processing step
      onProcessingStateChange(true, 3, PROCESSING_STEPS[2]);

      const response = await fetch('/api/picsart/image-upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          imageData: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
          fileName,
          parameters
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      // Complete processing
      onProcessingStateChange(true, 4, PROCESSING_STEPS[3]);
      await new Promise(resolve => setTimeout(resolve, UPSCALE_CONFIG.stepDelay));

      onResultChange(data.data);

      toast({
        title: "Sucesso!",
        description: `Imagem aumentada ${parameters.scale}x com qualidade IA! ${data.data.creditsUsed} créditos utilizados.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error processing image:', error);
      
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      });
      
      onProcessingStateChange(false, 0, '');
    } finally {
      onProcessingStateChange(false, 0, '');
    }
  }, [toast, onProcessingStateChange, onResultChange]);

  return {
    processImage
  };
};
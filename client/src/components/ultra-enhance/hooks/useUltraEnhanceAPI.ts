import { useToast } from '@/hooks/use-toast';
import { UltraEnhanceParams, UltraEnhanceResult } from './useUltraEnhanceState';

export const useUltraEnhanceAPI = () => {
  const { toast } = useToast();

  const processImage = async (
    file: File,
    parameters: UltraEnhanceParams,
    setProcessingState: (processing: boolean) => void,
    setProgressValue: (value: number) => void,
    setResultData: (data: UltraEnhanceResult | null) => void,
    setErrorMessage: (message: string | null) => void
  ) => {
    if (!file) return;

    setProcessingState(true);
    setProgressValue(0);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('upscale_factor', parameters.upscale_factor.toString());
      formData.append('format', parameters.format);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgressValue((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/picsart/ultra-enhance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setProgressValue(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erro na API');
      }

      const data = await response.json();
      
      if (data.success) {
        setResultData(data.data);
        toast({
          title: "Sucesso!",
          description: `Imagem melhorada com sucesso! Factor: ${parameters.upscale_factor}x`,
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('Ultra enhance error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrorMessage(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingState(false);
      setProgressValue(0);
    }
  };

  const downloadProcessedImage = (
    result: UltraEnhanceResult,
    parameters: UltraEnhanceParams,
    selectedFileName?: string
  ) => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = `data:image/${parameters.format.toLowerCase()};base64,${result.processedImageData}`;
    link.download = `enhanced_${parameters.upscale_factor}x_${selectedFileName || 'image'}.${parameters.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    processImage,
    downloadProcessedImage
  };
}; 
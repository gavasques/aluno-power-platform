import { apiRequest } from "@/lib/queryClient";
import type { 
  ProcessedImage, 
  UploadedImage, 
  ProcessingResponse, 
  UpscaleOptions, 
  BackgroundRemovalOptions 
} from "@/types/ai-image";

export class AIImageService {
  // Upload de imagem temporária
  static async uploadImage(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiRequest('/api/temp-image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.success) {
      throw new Error(response.error || 'Erro no upload da imagem');
    }

    return {
      id: response.data.id,
      url: response.data.url,
      file,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        width: response.data.metadata?.width,
        height: response.data.metadata?.height,
      }
    };
  }

  // Background removal
  static async removeBackground(
    imageId: string, 
    options: BackgroundRemovalOptions = {}
  ): Promise<ProcessedImage> {
    const response = await apiRequest('/api/background-removal/process', {
      method: 'POST',
      body: JSON.stringify({ imageId, ...options }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Erro no processamento da imagem');
    }

    return {
      id: response.data.id,
      url: response.data.processedImageUrl,
      metadata: {
        processingTime: response.data.processingTime,
      }
    };
  }

  // Image upscale
  static async upscaleImage(
    imageId: string, 
    options: UpscaleOptions
  ): Promise<ProcessedImage> {
    const response = await apiRequest('/api/image-upscale/process', {
      method: 'POST',
      body: JSON.stringify({ imageId, scale: options.scale }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Erro no processamento da imagem');
    }

    return {
      id: response.data.id,
      url: response.data.upscaledImageUrl,
      metadata: {
        scale: options.scale,
        processingTime: response.data.processingTime,
        width: response.data.metadata?.width,
        height: response.data.metadata?.height,
      }
    };
  }

  // Download de imagem processada
  static async downloadProcessedImage(url: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha no download');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      // Fallback: abrir em nova aba
      window.open(url, '_blank');
    }
  }

  // Validação de arquivo
  static validateImageFile(file: File, config: { maxFileSize: number; allowedFormats: string[] }): void {
    if (!config.allowedFormats.includes(file.type)) {
      throw new Error(`Formato não suportado. Use: ${config.allowedFormats.join(', ')}`);
    }

    if (file.size > config.maxFileSize) {
      const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024));
      throw new Error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
    }
  }
}
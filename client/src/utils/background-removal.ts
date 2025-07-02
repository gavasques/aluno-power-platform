import { BACKGROUND_REMOVAL_CONFIG } from '@/config/background-removal';
import type { BackgroundRemovalRequest, BackgroundRemovalResponse } from '@/types/background-removal';

export const validateImageForBackgroundRemoval = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > BACKGROUND_REMOVAL_CONFIG.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo permitido: ${BACKGROUND_REMOVAL_CONFIG.MAX_FILE_SIZE_MB}MB`
    };
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !BACKGROUND_REMOVAL_CONFIG.SUPPORTED_FORMATS.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Formato não suportado. Use: ${BACKGROUND_REMOVAL_CONFIG.SUPPORTED_FORMATS.join(', ')}`
    };
  }

  return { isValid: true };
};

export const uploadImageForBackgroundRemoval = async (file: File): Promise<{ success: boolean; imageId?: string; error?: string }> => {
  try {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        try {
          const base64Data = fileReader.result as string;
          
          const response = await fetch('/api/background-removal/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
              imageData: base64Data,
              fileName: file.name,
              fileSize: file.size
            })
          });

          const result = await response.json();
          
          if (!response.ok) {
            resolve({ success: false, error: result.error || 'Erro no upload' });
            return;
          }

          resolve({ success: true, imageId: result.imageId });
        } catch (error) {
          resolve({ success: false, error: 'Erro no processamento do arquivo' });
        }
      };

      fileReader.onerror = () => {
        resolve({ success: false, error: 'Erro na leitura do arquivo' });
      };

      fileReader.readAsDataURL(file);
    });
  } catch (error) {
    return { success: false, error: 'Erro inesperado no upload' };
  }
};

export const processBackgroundRemoval = async (imageId: string): Promise<BackgroundRemovalResponse> => {
  try {
    const response = await fetch('/api/background-removal/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ imageId } as BackgroundRemovalRequest)
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erro no processamento',
        code: result.code,
        message: result.error || 'Erro no processamento'
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Erro de conexão',
      message: 'Erro de conexão'
    };
  }
};

export const downloadProcessedImage = async (imageUrl: string, originalFileName: string) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename
    const nameWithoutExtension = originalFileName.split('.').slice(0, -1).join('.');
    link.download = `${nameWithoutExtension}_sem_fundo.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
    // Fallback to opening in new tab
    window.open(imageUrl, '_blank');
  }
};
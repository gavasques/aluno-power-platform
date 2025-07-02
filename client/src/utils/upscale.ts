import { FILE_VALIDATION, API_ENDPOINTS } from "@/config/upscale";
import type { ValidationError, UploadResponse, ProcessResponse } from "@/types/upscale";

export const validateFile = async (file: File): Promise<ValidationError | null> => {
  if (!FILE_VALIDATION.allowedTypes.includes(file.type as any)) {
    return {
      message: 'Formato não suportado. Use PNG, JPG, JPEG ou WEBP.',
      type: 'format'
    };
  }

  if (file.size > FILE_VALIDATION.maxSize) {
    return {
      message: 'Arquivo muito grande. Máximo 25MB permitido.',
      type: 'size'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { minDimensions } = FILE_VALIDATION;
      if (img.width < minDimensions.width || img.height < minDimensions.height) {
        resolve({
          message: `Imagem muito pequena. Mínimo ${minDimensions.width}x${minDimensions.height} pixels.`,
          type: 'dimension'
        });
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve({
      message: 'Erro ao processar a imagem.',
      type: 'processing'
    });
    img.src = URL.createObjectURL(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const downloadImage = async (url: string, filename: string): Promise<void> => {
  const response = await fetch(url);
  const blob = await response.blob();
  
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const uploadImage = async (imageData: string, fileName: string, fileSize: number): Promise<UploadResponse> => {
  const response = await fetch(API_ENDPOINTS.upload, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageData, fileName, fileSize }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro no upload');
  }

  return response.json();
};

export const processUpscale = async (imageId: string, scale: number): Promise<ProcessResponse> => {
  const response = await fetch(API_ENDPOINTS.process, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageId, scale }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro no processamento');
  }

  return response.json();
};

export const generateFileName = (scale: number): string => 
  `upscaled-${scale}x-${Date.now()}.png`;

export const createImageViewer = (imageUrl: string, scale: number): void => {
  const imageWindow = window.open('', '_blank');
  if (imageWindow) {
    imageWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imagem Upscaled - ${scale}x</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: #f5f5f5; 
              font-family: Arial, sans-serif;
            }
            img { 
              max-width: 100%; 
              max-height: 90vh; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
              border-radius: 8px;
            }
            .info {
              position: fixed;
              top: 20px;
              right: 20px;
              background: white;
              padding: 10px 15px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="Imagem Upscaled ${scale}x" />
          <div class="info">Upscaled ${scale}x</div>
        </body>
      </html>
    `);
    imageWindow.document.close();
  }
};
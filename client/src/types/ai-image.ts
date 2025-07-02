// Tipos compartilhados para processamento de imagens IA
export interface ProcessedImage {
  id: string;
  url: string;
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    scale?: number;
    processingTime?: number;
  };
}

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  metadata: {
    fileName: string;
    fileSize: number;
    width?: number;
    height?: number;
  };
}

export interface ProcessingState {
  isProcessing: boolean;
  isUploading: boolean;
  error: string | null;
  step: string;
}

export interface ImageProcessingConfig {
  maxFileSize: number;
  allowedFormats: string[];
  processingTimeout: number;
}

export interface UpscaleOptions {
  scale: 2 | 4;
}

export interface BackgroundRemovalOptions {
  format?: 'png' | 'jpg';
}

export interface ProcessingResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  processingTime?: number;
}
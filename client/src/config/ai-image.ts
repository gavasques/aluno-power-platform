import type { ImageProcessingConfig } from "@/types/ai-image";

export const AI_IMAGE_CONFIG: ImageProcessingConfig = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedFormats: [
    'image/png',
    'image/jpg', 
    'image/jpeg',
    'image/webp'
  ],
  processingTimeout: 60000, // 60 segundos
};

export const UPSCALE_CONFIG = {
  scales: [
    { value: 2 as const, label: '2x (Rápido)', time: '~30s' },
    { value: 4 as const, label: '4x (Alta Qualidade)', time: '~60s' }
  ],
  defaultScale: 2 as const,
  costs: {
    2: 0.10, // $0.10 para 2x
    4: 0.10  // $0.10 para 4x
  }
};

export const BACKGROUND_REMOVAL_CONFIG = {
  cost: 0.02, // $0.02 por processamento
  defaultFormat: 'png' as const,
  estimatedTime: '~15s'
};

export const UI_MESSAGES = {
  upload: {
    dragText: 'Arraste uma imagem aqui ou clique para selecionar',
    formats: 'PNG, JPG, JPEG, WebP',
    maxSize: '25MB máximo',
    uploading: 'Carregando imagem...',
    success: 'Imagem carregada com sucesso'
  },
  processing: {
    backgroundRemoval: 'Removendo background...',
    upscale2x: 'Processando upscale 2x...',
    upscale4x: 'Processando upscale 4x...',
    downloading: 'Preparando download...',
  },
  errors: {
    upload: 'Erro no upload da imagem',
    processing: 'Erro no processamento',
    download: 'Erro no download',
    invalidFile: 'Arquivo inválido',
    networkError: 'Erro de conexão'
  }
};
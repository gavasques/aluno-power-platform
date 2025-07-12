/**
 * Constants for Image Upscale Tool
 */

export const SCALE_OPTIONS = [
  {
    value: '2',
    label: '2x (800×600 → 1600×1200)',
    description: 'Padrão'
  },
  {
    value: '4',
    label: '4x (800×600 → 3200×2400)', 
    description: 'Alta qualidade'
  },
  {
    value: '8',
    label: '8x (800×600 → 6400×4800)',
    description: 'Máxima qualidade'
  }
] as const;

export const FORMAT_OPTIONS = [
  {
    value: 'PNG',
    label: 'PNG',
    description: 'Melhor qualidade'
  },
  {
    value: 'JPG', 
    label: 'JPG',
    description: 'Menor tamanho'
  },
  {
    value: 'WEBP',
    label: 'WEBP', 
    description: 'Moderno e eficiente'
  }
] as const;

export const PROCESSING_STEPS = [
  'Validando parâmetros...',
  'Enviando imagem para processamento...',
  'Melhorando qualidade da imagem com IA...',
  'Processamento concluído!'
] as const;

export const UPSCALE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['PNG', 'JPG', 'JPEG', 'WEBP'],
  totalSteps: 4,
  creditsPerUse: 4,
  stepDelay: 500
} as const;
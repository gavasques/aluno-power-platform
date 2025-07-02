import { Scissors } from "lucide-react";

export const BACKGROUND_REMOVAL_CONFIG = {
  MAX_FILE_SIZE_MB: 25,
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024,
  SUPPORTED_FORMATS: ['jpg', 'jpeg'],
  OUTPUT_FORMAT: 'png',
  ESTIMATED_PROCESSING_TIME: '30-60 segundos'
} as const;

export const BACKGROUND_REMOVAL_ICONS = {
  process: Scissors,
} as const;

export const BACKGROUND_REMOVAL_TIPS = [
  {
    icon: '📁',
    text: 'Use apenas imagens JPG/JPEG para melhor compatibilidade'
  },
  {
    icon: '🎯',
    text: 'Ideal para fotos de produtos e retratos com fundo definido'
  },
  {
    icon: '✨',
    text: 'Resultado em PNG transparente para máxima versatilidade'
  },
  {
    icon: '🚀',
    text: 'Processamento automático com IA de última geração'
  }
] as const;

export interface CompressionConfig {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  removeMetadata: boolean;
}

export const COMPRESSION_CONFIGS = {
  // Para uploads gerais do usuário
  general: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg' as const,
    removeMetadata: true,
  },
  
  // Para imagens de produto
  product: {
    quality: 90,
    maxWidth: 1500,
    maxHeight: 1500,
    format: 'jpeg' as const,
    removeMetadata: true,
  },
  
  // Para avatars/perfil
  avatar: {
    quality: 80,
    maxWidth: 400,
    maxHeight: 400,
    format: 'jpeg' as const,
    removeMetadata: true,
  },
  
  // Para thumbnails
  thumbnail: {
    quality: 75,
    maxWidth: 200,
    maxHeight: 200,
    format: 'jpeg' as const,
    removeMetadata: true,
  },
  
  // Para imagens que precisam de transparência
  transparent: {
    quality: 90,
    format: 'png' as const,
    removeMetadata: true,
  },
  
  // Para máxima compressão
  highCompression: {
    quality: 60,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp' as const,
    removeMetadata: true,
  },
} as const;

export type CompressionProfile = keyof typeof COMPRESSION_CONFIGS;

export const getCompressionConfig = (profile: CompressionProfile): CompressionConfig => {
  return COMPRESSION_CONFIGS[profile];
};

// Utilitário para estimar o tamanho final da imagem
export const estimateCompressedSize = (originalSize: number, profile: CompressionProfile): number => {
  const reductionFactors = {
    general: 0.3,     // ~70% de redução
    product: 0.25,    // ~75% de redução
    avatar: 0.4,      // ~60% de redução
    thumbnail: 0.6,   // ~40% de redução
    transparent: 0.15, // ~85% de redução (PNG comprime menos)
    highCompression: 0.6, // ~40% de redução (WebP é muito eficiente)
  };
  
  return Math.round(originalSize * reductionFactors[profile]);
};

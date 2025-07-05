
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface CompressionOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
  removeMetadata?: boolean;
}

export class ImageCompressor {
  private static defaultOptions: CompressionOptions = {
    quality: 80,
    format: 'jpeg',
    removeMetadata: true,
  };

  static async compressImage(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions = {}
  ): Promise<{ originalSize: number; compressedSize: number; compressionRatio: number }> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Obter tamanho original
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    let sharpInstance = sharp(inputPath);

    // Remover metadados se solicitado
    if (opts.removeMetadata) {
      sharpInstance = sharpInstance.rotate(); // Auto-rotaciona baseado no EXIF e remove metadados
    }

    // Redimensionar se especificado
    if (opts.width || opts.height) {
      sharpInstance = sharpInstance.resize(opts.width, opts.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Aplicar compressão baseada no formato
    switch (opts.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: opts.quality,
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: opts.quality,
          compressionLevel: 9,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: opts.quality,
          effort: 6 
        });
        break;
    }

    // Processar e salvar
    await sharpInstance.toFile(outputPath);

    // Calcular tamanho comprimido
    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    };
  }

  static async compressBuffer(
    buffer: Buffer,
    options: CompressionOptions = {}
  ): Promise<{ buffer: Buffer; originalSize: number; compressedSize: number; compressionRatio: number }> {
    const opts = { ...this.defaultOptions, ...options };
    const originalSize = buffer.length;

    let sharpInstance = sharp(buffer);

    // Remover metadados se solicitado
    if (opts.removeMetadata) {
      sharpInstance = sharpInstance.rotate();
    }

    // Redimensionar se especificado
    if (opts.width || opts.height) {
      sharpInstance = sharpInstance.resize(opts.width, opts.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Aplicar compressão baseada no formato
    switch (opts.format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: opts.quality,
          progressive: true,
          mozjpeg: true 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: opts.quality,
          compressionLevel: 9,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: opts.quality,
          effort: 6 
        });
        break;
    }

    const compressedBuffer = await sharpInstance.toBuffer();
    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      buffer: compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    };
  }

  static getOptimalFormat(filename: string): 'jpeg' | 'png' | 'webp' {
    const ext = path.extname(filename).toLowerCase();
    
    // WebP oferece melhor compressão na maioria dos casos
    if (['.jpg', '.jpeg'].includes(ext)) return 'jpeg';
    if (ext === '.png') return 'png'; // Manter PNG para transparência
    
    return 'webp'; // Formato padrão para melhor compressão
  }

  static async getImageInfo(input: string | Buffer) {
    const metadata = await sharp(input).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density,
    };
  }
}

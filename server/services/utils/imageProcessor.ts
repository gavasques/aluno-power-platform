import fs from 'fs';
import path from 'path';
import { toFile } from 'openai';
import { ImageCompressor, CompressionOptions } from './imageCompressor';

export class ImageProcessor {
  private static tempDir = '/tmp';

  static async processMultipleImages(
    images: Array<{ data: string; filename: string }>,
    compressionOptions?: CompressionOptions
  ): Promise<{
    files: any[];
    tempPaths: string[];
    cleanup: () => void;
    compressionStats: Array<{
      filename: string;
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    }>;
  }> {
    const timestamp = Date.now();
    const tempPaths: string[] = [];
    const compressionStats: Array<{
      filename: string;
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    }> = [];
    
    const files = await Promise.all(
      images.map(async (img, index) => {
        const imageBuffer = Buffer.from(img.data, 'base64');
        const originalSize = imageBuffer.length;
        
        // Aplicar compressão se especificado
        let processedBuffer = imageBuffer;
        let compressionInfo = {
          filename: img.filename || `image-${index}`,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
        };

        if (compressionOptions) {
          const compressed = await ImageCompressor.compressBuffer(imageBuffer, compressionOptions);
          processedBuffer = compressed.buffer;
          compressionInfo = {
            filename: img.filename || `image-${index}`,
            originalSize: compressed.originalSize,
            compressedSize: compressed.compressedSize,
            compressionRatio: compressed.compressionRatio,
          };
        }

        compressionStats.push(compressionInfo);

        const tempFileName = `temp_image_${index}_${timestamp}.png`;
        const tempPath = path.join(this.tempDir, tempFileName);
        tempPaths.push(tempPath);
        
        fs.writeFileSync(tempPath, processedBuffer);
        
        return toFile(fs.createReadStream(tempPath), img.filename || `image-${index}.png`, {
          type: 'image/png'
        });
      })
    );

    const cleanup = () => {
      tempPaths.forEach(tempPath => {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.log(`Warning: Could not clean temporary file: ${tempPath}`);
        }
      });
    };

    return { files, tempPaths, cleanup, compressionStats };
  }

  static validateImageResponse(response: any): string {
    const imageBase64 = response.data?.[0]?.b64_json || '';
    
    if (!imageBase64) {
      throw new Error('API did not return generated image');
    }
    
    return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  }

  static async saveCompressedImage(
    imageBuffer: Buffer,
    fileName: string,
    uploadDir: string = '/uploads',
    compressionOptions?: CompressionOptions
  ): Promise<{
    filePath: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  }> {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000000);
    const fileExtension = compressionOptions?.format || ImageCompressor.getOptimalFormat(fileName);
    const finalFileName = `photo-${timestamp}-${randomId}.${fileExtension}`;
    const filePath = path.join(uploadDir, finalFileName);

    // Garantir que o diretório existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Comprimir e salvar
    const compressionResult = await ImageCompressor.compressBuffer(imageBuffer, {
      quality: 85,
      format: fileExtension as any,
      removeMetadata: true,
      ...compressionOptions,
    });

    fs.writeFileSync(filePath, compressionResult.buffer);

    return {
      filePath: `/uploads/${finalFileName}`,
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      compressionRatio: compressionResult.compressionRatio,
    };
  }
}
import fs from 'fs';
import path from 'path';
import { toFile } from 'openai';

export class ImageProcessor {
  private static tempDir = '/tmp';

  static async processMultipleImages(images: Array<{ data: string; filename: string }>): Promise<{
    files: any[];
    tempPaths: string[];
    cleanup: () => void;
  }> {
    const timestamp = Date.now();
    const tempPaths: string[] = [];
    
    const files = await Promise.all(
      images.map(async (img, index) => {
        const imageBuffer = Buffer.from(img.data, 'base64');
        const tempFileName = `temp_image_${index}_${timestamp}.png`;
        const tempPath = path.join(this.tempDir, tempFileName);
        tempPaths.push(tempPath);
        
        fs.writeFileSync(tempPath, imageBuffer);
        
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

    return { files, tempPaths, cleanup };
  }

  static validateImageResponse(response: any): string {
    const imageBase64 = response.data?.[0]?.b64_json || '';
    
    if (!imageBase64) {
      throw new Error('API did not return generated image');
    }
    
    return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  }
}
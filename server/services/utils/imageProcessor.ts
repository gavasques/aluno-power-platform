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
    console.log(`📸 [IMAGE_PROCESSOR] Processing ${images.length} images`);
    
    // Validate input
    if (!images || images.length === 0) {
      throw new Error('No images provided to process');
    }
    
    const timestamp = Date.now();
    const tempPaths: string[] = [];
    
    const files = await Promise.all(
      images.map(async (img, index) => {
        console.log(`📸 [IMAGE_PROCESSOR] Processing image ${index + 1}/${images.length}`);
        console.log(`   📋 Filename: ${img.filename || 'unknown'}`);
        console.log(`   📏 Data length: ${img.data?.length || 0}`);
        console.log(`   📄 Data type: ${typeof img.data}`);
        
        if (!img.data || typeof img.data !== 'string') {
          throw new Error(`Invalid image data at index ${index}: expected string, got ${typeof img.data}`);
        }
        
        const imageBuffer = Buffer.from(img.data, 'base64');
        const tempFileName = `temp_image_${index}_${timestamp}.png`;
        const tempPath = path.join(this.tempDir, tempFileName);
        tempPaths.push(tempPath);
        
        fs.writeFileSync(tempPath, imageBuffer);
        console.log(`✅ [IMAGE_PROCESSOR] Saved temp file: ${tempPath}`);
        
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
    // Handle different response formats from OpenAI API
    let imageBase64 = '';
    
    if (response.data?.[0]?.b64_json) {
      imageBase64 = response.data[0].b64_json;
    } else if (response.data?.[0]?.url) {
      return response.data[0].url;
    } else if (typeof response === 'string') {
      imageBase64 = response;
    }
    
    if (!imageBase64) {
      console.error('Image response validation failed:', JSON.stringify(response, null, 2));
      throw new Error('API did not return generated image');
    }
    
    return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  }
}
export interface UpscaleData {
  id?: string;
  originalImageUrl: string;
  upscaledImageUrl: string;
  scale: number;
  processingTime?: number;
  cost?: string;
  message?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

export type ScaleOption = 2 | 4;

export type ImageComparison = 'original' | 'upscaled' | 'side-by-side';

export interface ScaleConfig {
  value: ScaleOption;
  title: string;
  description: string;
  time: string;
  color: 'blue' | 'purple';
}

export interface ValidationError {
  message: string;
  type: 'format' | 'size' | 'dimension' | 'processing';
}

export interface UploadResponse {
  success: boolean;
  imageId: string;
  message: string;
  duration: number;
}

export interface ProcessResponse {
  success: boolean;
  data: UpscaleData;
  message: string;
  duration?: number;
}
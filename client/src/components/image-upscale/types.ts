/**
 * Types for Image Upscale Tool
 */

export interface ImageUpscaleParams {
  scale: '2' | '4' | '8';
  format: 'PNG' | 'JPG' | 'WEBP';
}

export interface UpscaleResult {
  processedImageBase64: string;
  processedImageUrl: string;
  originalFileName: string;
  scale: string;
  format: string;
  processingTime: number;
  creditsUsed: number;
  fileSize: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: number;
  status: string;
}

export interface UpscaleToolState {
  imageData: string;
  fileName: string;
  parameters: ImageUpscaleParams;
  result: UpscaleResult | null;
  processing: ProcessingState;
}

export interface UpscaleEventHandlers {
  onImageSelect: (imageData: string, fileName: string) => void;
  onImageRemove: () => void;
  onParameterChange: (key: keyof ImageUpscaleParams, value: string) => void;
  onProcess: () => Promise<void>;
  onReset: () => void;
}
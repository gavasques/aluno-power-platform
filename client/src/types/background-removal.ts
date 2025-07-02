export interface BackgroundRemovalRequest {
  imageId: string;
}

export interface BackgroundRemovalResponse {
  success: boolean;
  processedImageUrl?: string;
  originalImageUrl?: string;
  message: string;
  duration?: number;
  cost?: number;
  error?: string;
  code?: string;
}

export interface BackgroundRemovalState {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
  error: string | null;
  uploadedImageId: string | null;
  processingDuration: number;
}

export interface BackgroundRemovalLog {
  id: number;
  userId: number;
  originalImageUrl: string;
  processedImageUrl: string;
  fileSize: number;
  fileName: string;
  processingTime: number;
  cost: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
}
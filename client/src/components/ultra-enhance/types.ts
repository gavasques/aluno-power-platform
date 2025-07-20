import { RefObject } from 'react';
import { UltraEnhanceParams, UltraEnhanceResult } from './hooks/useUltraEnhanceState';

export interface UltraEnhancePresentationProps {
  // Estado
  selectedFile: File | null;
  previewUrl: string | null;
  isProcessing: boolean;
  progress: number;
  result: UltraEnhanceResult | null;
  parameters: UltraEnhanceParams;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  
  // Handlers
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleProcessImage: () => Promise<void>;
  handleDownloadImage: () => void;
  handleParameterChange: (field: 'upscale_factor' | 'format', value: number | string) => void;
  resetTool: () => void;
} 
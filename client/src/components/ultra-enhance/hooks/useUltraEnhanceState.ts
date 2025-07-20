import { useState, useRef } from 'react';

export interface UltraEnhanceParams {
  upscale_factor: number;
  format: 'JPG' | 'PNG' | 'WEBP';
}

export interface UltraEnhanceResult {
  processedImageUrl: string;
  processedImageData: string;
  sessionId: string;
  duration: number;
}

export const useUltraEnhanceState = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UltraEnhanceResult | null>(null);
  const [parameters, setParameters] = useState<UltraEnhanceParams>({
    upscale_factor: 2,
    format: 'JPG'
  });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Simulate file input change
    const event = {
      target: {
        files: [file]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(event);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateParameters = (updates: Partial<UltraEnhanceParams>) => {
    setParameters(prev => ({ ...prev, ...updates }));
  };

  const setProcessingState = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const setProgressValue = (value: number | ((prev: number) => number)) => {
    setProgress(value);
  };

  const setResultData = (data: UltraEnhanceResult | null) => {
    setResult(data);
  };

  const setErrorMessage = (message: string | null) => {
    setError(message);
  };

  return {
    // Estado
    selectedFile,
    previewUrl,
    isProcessing,
    progress,
    result,
    parameters,
    error,
    fileInputRef,
    
    // Handlers
    handleFileSelect,
    handleDragOver,
    handleDrop,
    resetTool,
    updateParameters,
    setProcessingState,
    setProgressValue,
    setResultData,
    setErrorMessage
  };
}; 
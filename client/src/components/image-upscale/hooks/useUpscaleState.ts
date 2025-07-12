/**
 * State management hook for image upscale tool
 */

import { useState, useCallback } from 'react';
import type { ImageUpscaleParams, UpscaleResult, UpscaleToolState } from '../types';

const initialParameters: ImageUpscaleParams = {
  scale: '2',
  format: 'PNG'
};

const initialState: UpscaleToolState = {
  imageData: '',
  fileName: '',
  parameters: initialParameters,
  result: null,
  processing: {
    isProcessing: false,
    currentStep: 0,
    status: ''
  }
};

export const useUpscaleState = () => {
  const [state, setState] = useState<UpscaleToolState>(initialState);

  const setImageData = useCallback((imageData: string, fileName: string) => {
    setState(prev => ({
      ...prev,
      imageData,
      fileName,
      result: null // Clear previous result when new image is selected
    }));
  }, []);

  const clearImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      imageData: '',
      fileName: '',
      result: null
    }));
  }, []);

  const setParameters = useCallback((parameters: Partial<ImageUpscaleParams>) => {
    setState(prev => ({
      ...prev,
      parameters: { ...prev.parameters, ...parameters }
    }));
  }, []);

  const setProcessingState = useCallback((
    isProcessing: boolean,
    currentStep: number = 0,
    status: string = ''
  ) => {
    setState(prev => ({
      ...prev,
      processing: { isProcessing, currentStep, status }
    }));
  }, []);

  const setResult = useCallback((result: UpscaleResult | null) => {
    setState(prev => ({
      ...prev,
      result
    }));
  }, []);

  const resetTool = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setImageData,
    clearImage,
    setParameters,
    setProcessingState,
    setResult,
    resetTool
  };
};
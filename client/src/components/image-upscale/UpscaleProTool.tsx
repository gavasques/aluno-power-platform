/**
 * Refactored Upscale PRO Tool - Following SOLID/DRY/KISS principles
 * 
 * Features:
 * - Modular architecture with separated concerns
 * - Custom hooks for state and business logic
 * - Optimized performance with proper memoization
 * - Comprehensive error handling
 * - Clean and maintainable code structure
 */

import { useCallback, useMemo } from 'react';
import { useUpscaleState } from './hooks/useUpscaleState';
import { useUpscaleProcessing } from './hooks/useUpscaleProcessing';
import { UpscaleHeader } from './components/UpscaleHeader';
import { ImageUploadCard } from './components/ImageUploadCard';
import { ParametersCard } from './components/ParametersCard';
import { ProcessingCard } from './components/ProcessingCard';
import { ActionCard } from './components/ActionCard';
import type { ImageUpscaleParams } from './types';

export default function UpscaleProTool() {
  // State management with custom hook
  const {
    state,
    setImageData,
    clearImage,
    setParameters,
    setProcessingState,
    setResult,
    resetTool
  } = useUpscaleState();

  // Processing logic with custom hook
  const { processImage } = useUpscaleProcessing({
    onProcessingStateChange: setProcessingState,
    onResultChange: setResult
  });

  // Event handlers - memoized for performance
  const handleImageSelect = useCallback((imageData: string, fileName: string) => {
    setImageData(imageData, fileName);
  }, [setImageData]);

  const handleParameterChange = useCallback((key: keyof ImageUpscaleParams, value: string) => {
    setParameters({ [key]: value });
  }, [setParameters]);

  const handleProcess = useCallback(async () => {
    await processImage(state.imageData, state.fileName, state.parameters);
  }, [processImage, state.imageData, state.fileName, state.parameters]);

  // Computed values - memoized for performance
  const hasImage = useMemo(() => Boolean(state.imageData), [state.imageData]);
  const isDisabled = useMemo(() => state.processing.isProcessing, [state.processing.isProcessing]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <UpscaleHeader />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <ImageUploadCard
            onImageSelect={handleImageSelect}
            onImageRemove={clearImage}
            selectedImage={state.imageData}
            fileName={state.fileName}
            disabled={isDisabled}
          />

          <ParametersCard
            parameters={state.parameters}
            onParameterChange={handleParameterChange}
          />
        </div>

        {/* Right Column - Processing & Results */}
        <div className="lg:col-span-2 space-y-6">
          <ProcessingCard
            processing={state.processing}
            result={state.result}
            imageData={state.imageData}
            parameters={state.parameters}
            onReset={resetTool}
          />

          <ActionCard
            onProcess={handleProcess}
            disabled={isDisabled}
            hasImage={hasImage}
          />
        </div>
      </div>
    </div>
  );
}
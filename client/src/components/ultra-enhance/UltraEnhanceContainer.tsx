import { useUltraEnhanceState } from './hooks/useUltraEnhanceState';
import { useUltraEnhanceAPI } from './hooks/useUltraEnhanceAPI';
import { UltraEnhancePresentation } from './UltraEnhancePresentation';

export const UltraEnhanceContainer = () => {
  // Hooks para gerenciamento de estado e operações
  const {
    selectedFile,
    previewUrl,
    isProcessing,
    progress,
    result,
    parameters,
    error,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDrop,
    resetTool,
    updateParameters,
    setProcessingState,
    setProgressValue,
    setResultData,
    setErrorMessage
  } = useUltraEnhanceState();

  const { processImage, downloadProcessedImage } = useUltraEnhanceAPI();

  const handleProcessImage = async () => {
    if (!selectedFile) return;
    
    await processImage(
      selectedFile,
      parameters,
      setProcessingState,
      setProgressValue,
      setResultData,
      setErrorMessage
    );
  };

  const handleDownloadImage = () => {
    if (!result) return;
    downloadProcessedImage(result, parameters, selectedFile?.name);
  };

  const handleParameterChange = (field: 'upscale_factor' | 'format', value: number | string) => {
    updateParameters({ [field]: field === 'upscale_factor' ? Number(value) : value });
  };

  return (
    <UltraEnhancePresentation
      // Estado
      selectedFile={selectedFile}
      previewUrl={previewUrl}
      isProcessing={isProcessing}
      progress={progress}
      result={result}
      parameters={parameters}
      error={error}
      fileInputRef={fileInputRef}
      
      // Handlers
      handleFileSelect={handleFileSelect}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      handleProcessImage={handleProcessImage}
      handleDownloadImage={handleDownloadImage}
      handleParameterChange={handleParameterChange}
      resetTool={resetTool}
    />
  );
}; 
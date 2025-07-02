import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { validateFile, fileToBase64, uploadImage, processUpscale } from "@/utils/upscale";
import type { UploadedImage, UpscaleData, ScaleOption } from "@/types/upscale";

export const useUpscale = () => {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedScale, setSelectedScale] = useState<ScaleOption>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [result, setResult] = useState<UpscaleData | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const localUrl = URL.createObjectURL(file);
      setUploadedImage({
        id: 'local-preview',
        url: localUrl,
        name: file.name
      });

      const validationError = await validateFile(file);
      if (validationError) {
        toast({
          title: "Erro de validação",
          description: validationError.message,
          variant: "destructive",
        });
        return;
      }

      const imageData = await fileToBase64(file);
      const response = await uploadImage(imageData, file.name, file.size);
      
      setUploadedImage({
        id: response.imageId,
        url: localUrl,
        name: file.name,
      });

      toast({
        title: "Upload realizado!",
        description: `${file.name} carregado com sucesso`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setUploadedImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpscale = async () => {
    if (!uploadedImage) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload de uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Conectando com PixelCut AI...');
    
    try {
      setProcessingStep('Enviando imagem para processamento...');
      const response = await processUpscale(uploadedImage.id, selectedScale);
      
      setResult(response.data);
      setProcessingStep('');
      
      toast({
        title: "Sucesso!",
        description: "Imagem processada com sucesso",
      });

    } catch (error) {
      console.error('Upscale error:', error);
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const resetState = () => {
    setUploadedImage(null);
    setResult(null);
    setIsProcessing(false);
    setProcessingStep('');
  };

  const removeImage = () => {
    setUploadedImage(null);
    setResult(null);
  };

  return {
    // State
    uploadedImage,
    selectedScale,
    isProcessing,
    isUploading,
    processingStep,
    result,
    
    // Actions
    handleFileUpload,
    handleUpscale,
    setSelectedScale,
    resetState,
    removeImage,
  };
};
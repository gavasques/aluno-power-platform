import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Scissors } from "lucide-react";
import { ImageUploader } from "@/components/ai/ImageUploader";
import { BackgroundRemovalControls } from "@/components/ai/BackgroundRemovalControls";
import { BackgroundRemovalResult } from "@/components/ai/BackgroundRemovalResult";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import { BACKGROUND_REMOVAL_CONFIG } from "@/config/background-removal";

const PageHeader = () => (
  <div className="text-center space-y-2 mb-8">
    <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
      <Scissors className="h-8 w-8 text-purple-600" />
      Remover Background com IA
    </h1>
    <p className="text-muted-foreground max-w-2xl mx-auto">
      Remova automaticamente o fundo de suas imagens usando inteligência artificial avançada. 
      Ideal para fotos de produtos, retratos e criação de conteúdo profissional.
    </p>
  </div>
);

const ProcessingFeedback = ({ isProcessing, isUploading, error }: {
  isProcessing: boolean;
  isUploading: boolean;
  error: string | null;
}) => {
  if (!isProcessing && !isUploading && !error) return null;

  return (
    <div className="mb-6">
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Erro no processamento
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ResetButton = ({ onReset, disabled }: { onReset: () => void; disabled: boolean }) => (
  <div className="text-center">
    <Button
      onClick={onReset}
      variant="outline"
      disabled={disabled}
      className="w-full sm:w-auto"
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Começar Nova Remoção
    </Button>
  </div>
);

export default function BackgroundRemoval() {
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  const {
    originalImage,
    processedImage,
    isProcessing,
    isUploading,
    hasUploadedImage,
    error,
    processingDuration,
    uploadImage,
    removeImage,
    removeBackground,
    reset,
  } = useBackgroundRemoval();

  const handleImageUpload = async (file: File) => {
    setUploadedFileName(file.name);
    return await uploadImage(file);
  };

  const handleRemoveBackground = async () => {
    await removeBackground();
  };

  const handleReset = () => {
    setUploadedFileName('');
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader />
      
      <ProcessingFeedback 
        isProcessing={isProcessing}
        isUploading={isUploading}
        error={error}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Coluna Esquerda: Upload e Controles */}
        <div className="space-y-6">
          {/* Upload da Imagem */}
          <Card>
            <CardHeader>
              <CardTitle>Upload da Imagem</CardTitle>
              <CardDescription>
                Selecione uma imagem para remover o fundo automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onFileSelect={handleImageUpload}
                uploadedImage={originalImage}
                onRemoveImage={removeImage}
                isUploading={isUploading}
              />
            </CardContent>
          </Card>

          {/* Controles de Remoção */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configure o processamento de remoção de fundo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackgroundRemovalControls
                onRemoveBackground={handleRemoveBackground}
                isProcessing={isProcessing}
                isUploading={isUploading}
                hasUploadedImage={hasUploadedImage}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Resultado */}
        <div className="space-y-6">
          {processedImage ? (
            <BackgroundRemovalResult
              originalImage={originalImage!.url}
              processedImage={processedImage}
              processingDuration={processingDuration}
              originalFileName={uploadedFileName}
            />
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <Scissors className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      Resultado aparecerá aqui
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Faça o upload de uma imagem e clique em "Remover Background" para ver o resultado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Botão de Reset */}
      {(hasUploadedImage || processedImage) && (
        <ResetButton 
          onReset={handleReset}
          disabled={isProcessing || isUploading}
        />
      )}
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import { ImageUploader } from "@/components/ai/ImageUploader";
import { BackgroundRemovalResult } from "@/components/ai/BackgroundRemovalResult";
import { AIPageHeader } from "@/components/ai/common/AIPageHeader";
import { ProcessingFeedback } from "@/components/ai/common/ProcessingFeedback";
import { ResetButton } from "@/components/ai/common/ResetButton";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import { BACKGROUND_REMOVAL_CONFIG } from "@/config/ai-image";

// Componente inline para controles de background removal
const BackgroundRemovalControls = ({ 
  onProcess, 
  isProcessing, 
  isUploading, 
  hasUploadedImage 
}: {
  onProcess: () => void;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
}) => (
  <div className="space-y-4">
    <div className="text-sm text-muted-foreground space-y-2">
      <p>• Tempo estimado: {BACKGROUND_REMOVAL_CONFIG.estimatedTime}</p>
      <p>• Formato de saída: PNG transparente</p>
    </div>

    <Button 
      onClick={onProcess}
      disabled={!hasUploadedImage || isProcessing || isUploading}
      className="w-full"
      size="lg"
    >
      <Scissors className="h-4 w-4 mr-2" />
      {isProcessing ? 'Removendo Background...' : 'Remover Background'}
    </Button>
  </div>
);

export default function BackgroundRemoval() {
  const {
    uploadedImage,
    processedImage,
    state,
    uploadImage,
    processBackgroundRemoval,
    downloadImage,
    reset
  } = useImageProcessing();

  const { isProcessing, isUploading, error, step } = state;
  const hasUploadedImage = !!uploadedImage;

  const handleProcess = () => {
    processBackgroundRemoval({ format: 'png' });
  };

  const handleDownload = () => {
    if (uploadedImage && processedImage) {
      const fileName = `removed_bg_${uploadedImage.metadata.fileName}`;
      downloadImage(fileName);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <AIPageHeader 
        icon={Scissors}
        title="Remover Background com IA"
        description="Remova automaticamente o fundo de suas imagens usando inteligência artificial avançada. Ideal para fotos de produtos, retratos e criação de conteúdo profissional."
      />

      <ProcessingFeedback 
        isProcessing={isProcessing}
        isUploading={isUploading}
        error={error}
        step={step}
        processingColor="purple"
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
                onFileSelect={uploadImage}
                uploadedImage={uploadedImage}
                onRemoveImage={reset}
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
                onProcess={handleProcess}
                isProcessing={isProcessing}
                isUploading={isUploading}
                hasUploadedImage={hasUploadedImage}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Resultado */}
        <div className="space-y-6">
          {processedImage && uploadedImage ? (
            <BackgroundRemovalResult
              originalImage={uploadedImage.url}
              processedImage={processedImage}
              processingDuration={processedImage.metadata?.processingTime}
              originalFileName={uploadedImage.metadata.fileName}
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
          onReset={reset}
          disabled={isProcessing || isUploading}
        />
      )}
    </div>
  );
}
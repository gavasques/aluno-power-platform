import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/ai/ImageUploader";
import { UpscaleResult } from "@/components/ai/UpscaleResult";
import { AIPageHeader } from "@/components/ai/common/AIPageHeader";
import { ProcessingFeedback } from "@/components/ai/common/ProcessingFeedback";
import { ResetButton } from "@/components/ai/common/ResetButton";
import { useImageProcessing } from "@/hooks/useImageProcessing";
import { UPSCALE_CONFIG } from "@/config/ai-image";

// Componente para controles de upscale
const UpscaleControls = ({ 
  onProcess, 
  isProcessing, 
  isUploading, 
  hasUploadedImage,
  scale,
  setScale
}: {
  onProcess: (scale: 2 | 4) => void;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
  scale: 2 | 4;
  setScale: (scale: 2 | 4) => void;
}) => (
  <div className="space-y-6">
    {/* Seleção de escala */}
    <div className="space-y-3">
      <h3 className="font-medium">Escala de Upscale</h3>
      <div className="grid grid-cols-2 gap-3">
        {UPSCALE_CONFIG.scales.map((option) => (
          <button
            key={option.value}
            onClick={() => setScale(option.value)}
            className={`p-4 rounded-lg border-2 transition-all ${
              scale === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center space-y-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.time}</div>
              <Badge variant="outline" className="text-xs">
                ${UPSCALE_CONFIG.costs[option.value]}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Botão de processamento */}
    <Button 
      onClick={() => onProcess(scale)}
      disabled={!hasUploadedImage || isProcessing || isUploading}
      className="w-full"
      size="lg"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {isProcessing ? `Processando ${scale}x...` : `Processar Upscale ${scale}x`}
    </Button>
  </div>
);

export default function ImageUpscale() {
  const {
    uploadedImage,
    processedImage,
    state,
    uploadImage,
    processUpscale,
    downloadImage,
    reset
  } = useImageProcessing();

  const [scale, setScale] = useState<2 | 4>(UPSCALE_CONFIG.defaultScale);

  const { isProcessing, isUploading, error, step } = state;
  const hasUploadedImage = !!uploadedImage;

  const handleProcess = (selectedScale: 2 | 4) => {
    processUpscale({ scale: selectedScale });
  };

  const handleDownload = () => {
    if (uploadedImage && processedImage) {
      const fileName = `upscaled_${scale}x_${uploadedImage.metadata.fileName}`;
      downloadImage(fileName);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <AIPageHeader 
        icon={Sparkles}
        title="Upscale de Imagens com IA"
        description="Aumente a resolução das suas imagens usando inteligência artificial avançada. Ideal para melhorar fotos para impressão ou uso profissional."
        gradient={true}
      />

      <ProcessingFeedback 
        isProcessing={isProcessing}
        isUploading={isUploading}
        error={error}
        step={step}
        processingColor="blue"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Coluna Esquerda: Upload e Controles */}
        <div className="space-y-6">
          {/* Upload da Imagem */}
          <Card>
            <CardHeader>
              <CardTitle>Upload da Imagem</CardTitle>
              <CardDescription>
                Selecione uma imagem para aumentar sua resolução
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

          {/* Controles de Upscale */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Upscale</CardTitle>
              <CardDescription>
                Escolha a escala de aumento desejada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpscaleControls
                onProcess={handleProcess}
                isProcessing={isProcessing}
                isUploading={isUploading}
                hasUploadedImage={hasUploadedImage}
                scale={scale}
                setScale={setScale}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Resultado */}
        <div className="space-y-6">
          {processedImage && uploadedImage ? (
            <UpscaleResult
              result={{
                id: processedImage.id,
                originalImageUrl: uploadedImage.url,
                upscaledImageUrl: processedImage.url,
                scale: processedImage.metadata?.scale || scale,
                processingTime: processedImage.metadata?.processingTime,
              }}
              originalImage={{
                id: uploadedImage.id,
                url: uploadedImage.url,
                name: uploadedImage.metadata.fileName,
              }}
              scale={processedImage.metadata?.scale || scale}
            />
          ) : (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <CardContent>
                <div className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground">
                      Resultado aparecerá aqui
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Faça o upload de uma imagem e escolha a escala para ver o resultado
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
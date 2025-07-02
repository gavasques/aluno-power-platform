import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ai/ImageUploader";
import { UpscaleControls } from "@/components/ai/UpscaleControls";
import { UpscaleResult } from "@/components/ai/UpscaleResult";
import { useUpscale } from "@/hooks/useUpscale";
import { Sparkles, RotateCcw } from "lucide-react";

const PageHeader = () => (
  <div className="text-center space-y-4 mb-8">
    <div className="flex items-center justify-center gap-3">
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Upscale de Imagens com IA
      </h1>
    </div>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      Aumente a resolução das suas imagens usando inteligência artificial avançada. 
      Ideal para melhorar fotos para impressão ou uso profissional.
    </p>
  </div>
);

const ProcessingFeedback = ({ 
  step, 
  isProcessing 
}: { 
  step: string; 
  isProcessing: boolean; 
}) => {
  if (!isProcessing || !step) return null;

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              {step}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Aguarde enquanto processamos sua imagem...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResetButton = ({ 
  onReset, 
  disabled 
}: { 
  onReset: () => void; 
  disabled: boolean; 
}) => (
  <div className="flex justify-center pt-6">
    <Button
      variant="outline"
      onClick={onReset}
      disabled={disabled}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Começar Novamente
    </Button>
  </div>
);

export default function ImageUpscale() {
  const {
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
  } = useUpscale();

  const hasUploadedImage = uploadedImage?.url;
  const hasResult = result?.upscaledImageUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Upload da Imagem
                </CardTitle>
                <CardDescription>
                  Selecione uma imagem para fazer o upscale com IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  onFileSelect={handleFileUpload}
                  uploadedImage={uploadedImage}
                  onRemoveImage={removeImage}
                  isUploading={isUploading}
                />
              </CardContent>
            </Card>

            {hasUploadedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Upscale</CardTitle>
                  <CardDescription>
                    Escolha o nível de ampliação desejado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpscaleControls
                    selectedScale={selectedScale}
                    onScaleChange={setSelectedScale}
                    onUpscale={handleUpscale}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            )}

            <ProcessingFeedback 
              step={processingStep} 
              isProcessing={isProcessing} 
            />
          </div>

          {/* Right Column - Result */}
          <div className="space-y-6">
            {hasResult && hasUploadedImage ? (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado do Processamento</CardTitle>
                  <CardDescription>
                    Sua imagem foi processada com sucesso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpscaleResult
                    result={result}
                    originalImage={uploadedImage}
                    scale={selectedScale}
                  />
                </CardContent>
              </Card>
            ) : hasUploadedImage ? (
              <Card>
                <CardHeader>
                  <CardTitle>Preview da Imagem</CardTitle>
                  <CardDescription>
                    Imagem carregada e pronta para processamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border-2 border-border bg-muted">
                      <img
                        src={uploadedImage.url}
                        alt={uploadedImage.name}
                        className="w-full h-64 object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {uploadedImage.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      Resultado aparecerá aqui
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Faça upload de uma imagem para começar
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {(hasUploadedImage || hasResult) && (
          <ResetButton 
            onReset={resetState} 
            disabled={isProcessing || isUploading} 
          />
        )}
      </div>
    </div>
  );
}
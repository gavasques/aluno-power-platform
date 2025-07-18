import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors } from "lucide-react";
import { LoadingSpinner, ButtonLoader } from "@/components/common/LoadingSpinner";
import { BACKGROUND_REMOVAL_TIPS } from "@/config/background-removal";

interface BackgroundRemovalControlsProps {
  onRemoveBackground: () => void;
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
}

const ProcessingInfo = () => (
  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" className="text-yellow-600" />
        <div>
          <p className="font-medium text-yellow-900 dark:text-yellow-100">
            Removendo background...
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Isso pode levar alguns segundos. Não feche a página.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UploadingInfo = () => (
  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" className="text-blue-600" />
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">
            Carregando imagem...
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Por favor, aguarde enquanto sua imagem é carregada.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RemoveBackgroundButton = ({ 
  isProcessing, 
  isUploading,
  hasUploadedImage,
  onRemoveBackground 
}: {
  isProcessing: boolean;
  isUploading: boolean;
  hasUploadedImage: boolean;
  onRemoveBackground: () => void;
}) => {
  const isDisabled = isProcessing || isUploading || !hasUploadedImage;

  return (
    <Button
      onClick={onRemoveBackground}
      disabled={isDisabled}
      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
    >
      {isProcessing ? (
        <>
          <ButtonLoader />
          Processando...
        </>
      ) : isUploading ? (
        <>
          <ButtonLoader />
          Carregando imagem...
        </>
      ) : !hasUploadedImage ? (
        <>
          <Scissors className="mr-2 h-5 w-5" />
          Selecione uma imagem primeiro
        </>
      ) : (
        <>
          <Scissors className="mr-2 h-5 w-5" />
          Remover Background
        </>
      )}
    </Button>
  );
};

const BackgroundRemovalTips = () => (
  <div className="space-y-2 text-xs text-muted-foreground">
    {BACKGROUND_REMOVAL_TIPS.map((tip, index) => (
      <div key={index} className="flex items-center gap-2">
        <span className="text-base">{tip.icon}</span>
        <span>{tip.text}</span>
      </div>
    ))}
  </div>
);

export function BackgroundRemovalControls({
  onRemoveBackground,
  isProcessing,
  isUploading,
  hasUploadedImage,
}: BackgroundRemovalControlsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Remover Background</h3>
        <p className="text-sm text-muted-foreground">
          Remova o fundo da sua imagem automaticamente com IA
        </p>
      </div>

      {isUploading && <UploadingInfo />}
      {isProcessing && <ProcessingInfo />}
      
      <RemoveBackgroundButton
        isProcessing={isProcessing}
        isUploading={isUploading}
        hasUploadedImage={hasUploadedImage}
        onRemoveBackground={onRemoveBackground}
      />

      <BackgroundRemovalTips />
    </div>
  );
}
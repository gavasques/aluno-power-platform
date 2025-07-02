import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, ArrowLeftRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadImage, createImageViewer, generateFileName } from "@/utils/upscale";
import type { UpscaleData, UploadedImage } from "@/types/upscale";

interface UpscaleResultProps {
  result: UpscaleData;
  originalImage: UploadedImage;
  scale: number;
}

type ViewMode = "original" | "upscaled" | "comparison";

const ViewModeSelector = ({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) => (
  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
    <Button
      variant={viewMode === "original" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewModeChange("original")}
      className="h-8"
    >
      Original
    </Button>
    <Button
      variant={viewMode === "upscaled" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewModeChange("upscaled")}
      className="h-8"
    >
      Upscaled
    </Button>
    <Button
      variant={viewMode === "comparison" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewModeChange("comparison")}
      className="h-8"
    >
      <ArrowLeftRight className="h-4 w-4 mr-2" />
      Comparar
    </Button>
  </div>
);

const ImageDisplay = ({ 
  src, 
  alt, 
  label 
}: { 
  src: string; 
  alt: string; 
  label: string; 
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-center">{label}</p>
    <div className="relative rounded-lg overflow-hidden border-2 border-border bg-muted">
      <img
        src={src}
        alt={alt}
        className="w-full h-64 object-contain"
      />
    </div>
  </div>
);

const ComparisonView = ({
  originalImage,
  result,
  scale,
}: {
  originalImage: UploadedImage;
  result: UpscaleData;
  scale: number;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <ImageDisplay
      src={originalImage.url}
      alt="Imagem original"
      label="Imagem Original"
    />
    <ImageDisplay
      src={result.upscaledImageUrl}
      alt={`Imagem upscaled ${scale}x`}
      label={`Imagem Upscaled ${scale}x`}
    />
  </div>
);

const SingleImageView = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => (
  <div className="relative rounded-lg overflow-hidden border-2 border-border bg-muted">
    <img
      src={src}
      alt={alt}
      className="w-full h-80 object-contain"
    />
  </div>
);

const ResultStats = ({ 
  result,
  scale 
}: { 
  result: UpscaleData;
  scale: number;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{scale}x</div>
          <div className="text-sm text-muted-foreground">Ampliação</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">✓</div>
          <div className="text-sm text-muted-foreground">Processado</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActionButtons = ({
  result,
  scale,
  onDownload,
  onView,
}: {
  result: UpscaleData;
  scale: number;
  onDownload: () => void;
  onView: () => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Button onClick={onDownload} className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Baixar Imagem
    </Button>
    <Button variant="outline" onClick={onView} className="w-full">
      <Eye className="h-4 w-4 mr-2" />
      Visualizar
    </Button>
  </div>
);

const QualityTips = ({ scale }: { scale: number }) => (
  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium">
      <ImageIcon className="h-4 w-4 text-primary" />
      Dicas de Qualidade
    </div>
    <div className="space-y-1 text-xs text-muted-foreground">
      {scale === 2 ? (
        <>
          <div>• Ideal para uso digital e web</div>
          <div>• Dobra a resolução mantendo qualidade</div>
          <div>• Processamento rápido e eficiente</div>
        </>
      ) : (
        <>
          <div>• Perfeito para impressão em alta qualidade</div>
          <div>• Quadruplica a resolução original</div>
          <div>• Máxima definição para ampliações</div>
        </>
      )}
    </div>
  </div>
);

export function UpscaleResult({
  result,
  originalImage,
  scale,
}: UpscaleResultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("comparison");

  const handleDownload = async () => {
    try {
      const filename = generateFileName(scale);
      await downloadImage(result.upscaledImageUrl, filename);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleView = () => {
    createImageViewer(result.upscaledImageUrl, scale);
  };

  // Demo mode warning component
  const DemoModeWarning = () => (
    result.isDemoMode ? (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-amber-500 text-xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Modo Demonstração Ativo</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              {result.message || 'Os créditos da API PixelCut foram esgotados. Esta é uma simulação do resultado do upscale. Para usar o upscale real, entre em contato com o administrador para recarregar os créditos.'}
            </p>
          </div>
        </div>
      </div>
    ) : null
  );

  const renderImageView = () => {
    switch (viewMode) {
      case "original":
        return (
          <SingleImageView
            src={originalImage.url}
            alt="Imagem original"
          />
        );
      case "upscaled":
        return (
          <SingleImageView
            src={result.upscaledImageUrl}
            alt={`Imagem upscaled ${scale}x`}
          />
        );
      case "comparison":
        return (
          <ComparisonView
            originalImage={originalImage}
            result={result}
            scale={scale}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resultado do Upscale</h3>
        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      <DemoModeWarning />

      {renderImageView()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActionButtons
            result={result}
            scale={scale}
            onDownload={handleDownload}
            onView={handleView}
          />
        </div>
        <div>
          <ResultStats result={result} scale={scale} />
        </div>
      </div>

      <QualityTips scale={scale} />
    </div>
  );
}
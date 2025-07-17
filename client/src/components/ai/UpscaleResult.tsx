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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Resultado Final</h3>
        <p className="text-sm text-muted-foreground">Sua imagem foi processada com sucesso</p>
      </div>

      {/* Imagem Resultado Final */}
      <div className="relative rounded-lg overflow-hidden border-2 border-border bg-muted">
        <img
          src={result.upscaledImageUrl}
          alt={`Imagem upscaled ${scale}x`}
          className="w-full h-80 object-contain"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
          {scale}x Processado
        </div>
      </div>

      {/* Botões de Ação */}
      <ActionButtons
        result={result}
        scale={scale}
        onDownload={handleDownload}
        onView={handleView}
      />
    </div>
  );
}